from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, Role, UserRole
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        organization=user_in.organization
    )
    db.add(user)
    await db.flush()

    viewer_role = await db.execute(select(Role).where(Role.name == "viewer"))
    role = viewer_role.scalars().first()
    if role:
        user_role = UserRole(user_id=user.id, role_id=role.id)
        db.add(user_role)
    
    await db.commit()
    await db.refresh(user, ["roles"])
    
    # Construct roles list for schema compatibility
    user_out = UserResponse.model_validate(user)
    user_out.roles = [r.name for r in user.roles]
    return user_out

@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse)
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    email = None
    password = None
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            data = await request.json()
            email = data.get("email") or data.get("username")
            password = data.get("password")
        else:
            form = await request.form()
            email = form.get("email") or form.get("username")
            password = form.get("password")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request body")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    result = await db.execute(
        select(User).options(selectinload(User.roles)).where(User.email == str(email).strip())
    )
    user = result.scalars().first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user_out = UserResponse.model_validate(user)
    user_out.roles = [r.name for r in user.roles]

    return TokenResponse(
        access_token=create_access_token(subject=user.id),
        refresh_token=create_refresh_token(subject=user.id),
        token_type="bearer",
        user=user_out
    )

@router.post("/refresh", response_model=TokenResponse)
@router.post("/refresh/", response_model=TokenResponse)
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    from app.utils.security import jwt, JWTError
    from app.config import settings
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    return TokenResponse(
        access_token=create_access_token(subject=user_id),
        refresh_token=create_refresh_token(subject=user_id),
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
@router.get("/me/", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    user_out = UserResponse.model_validate(current_user)
    user_out.roles = [r.name for r in current_user.roles]
    return user_out
