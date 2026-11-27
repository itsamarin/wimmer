from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from wimmer.api.deps import CurrentUser, DB
from wimmer.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse
from wimmer.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: DB):
    try:
        user = AuthService(db).register(data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: DB):
    try:
        return AuthService(db).login(data.email, data.password)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=UserResponse)
def me(current_user: CurrentUser):
    return current_user
