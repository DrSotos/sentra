from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid
from app.database import get_db
from app.models.user import User, Role, UserRole
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin"))):
    result = await db.execute(select(User).options(selectinload(User.roles)))
    users = result.scalars().all()
    out = []
    for u in users:
        uo = UserResponse.model_validate(u)
        uo.roles = [r.name for r in u.roles]
        out.append(uo)
    return out

@router.get("/{id}", response_model=UserResponse)
async def get_user(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != id and "admin" not in [r.name for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(User).options(selectinload(User.roles)).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    uo = UserResponse.model_validate(user)
    uo.roles = [r.name for r in user.roles]
    return uo

@router.patch("/{id}", response_model=UserResponse)
async def update_user(id: uuid.UUID, data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != id and "admin" not in [r.name for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(User).options(selectinload(User.roles)).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.organization is not None:
        user.organization = data.organization
    if data.is_active is not None and "admin" in [r.name for r in current_user.roles]:
        user.is_active = data.is_active
        
    await db.commit()
    await db.refresh(user)
    
    uo = UserResponse.model_validate(user)
    uo.roles = [r.name for r in user.roles]
    return uo

@router.delete("/{id}")
async def delete_user(id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin"))):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}

@router.put("/{id}/role")
async def assign_role(id: uuid.UUID, role_name: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin"))):
    role_res = await db.execute(select(Role).where(Role.name == role_name))
    role = role_res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    ur_res = await db.execute(select(UserRole).where(UserRole.user_id == id, UserRole.role_id == role.id))
    if not ur_res.scalars().first():
        db.add(UserRole(user_id=id, role_id=role.id))
        await db.commit()
    return {"message": "Role assigned"}
