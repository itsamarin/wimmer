import uuid

from sqlalchemy.orm import Session

from wimmer.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from wimmer.db.models.user import User
from wimmer.schemas.auth import TokenResponse, UserRegister


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, data: UserRegister) -> User:
        existing = self.db.query(User).filter(User.email == data.email).first()
        if existing:
            raise ValueError("Email already registered")
        user = User(
            id=uuid.uuid4(),
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("Account is disabled")
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == uuid.UUID(user_id)).first()
