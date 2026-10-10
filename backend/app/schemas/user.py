from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, field_validator
import uuid

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    organization: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    roles: List[str] = []

    model_config = ConfigDict(from_attributes=True)

    @field_validator("roles", mode="before")
    @classmethod
    def extract_roles(cls, v: Any) -> List[str]:
        if not v:
            return []
        res = []
        for item in v:
            if isinstance(item, str):
                res.append(item)
            elif hasattr(item, "name"):
                res.append(item.name)
            elif isinstance(item, dict) and "name" in item:
                res.append(item["name"])
        return res
