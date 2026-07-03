"""User login/register (future)."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register(request: RegisterRequest):
    return {"message": "Registration endpoint — not yet implemented"}


@router.post("/login")
async def login(request: LoginRequest):
    return {"message": "Login endpoint — not yet implemented"}
