from fastapi import HTTPException
from sqlmodel import Session, select
from app.core.database import session_factory
from app.core.security import hash_password, verify_password
from .models import Usuario
from .repository import UsuarioRepository
from .schemas import UserCreate, UserPublic


class UsuarioService:
    def register(self, data: UserCreate) -> UserPublic:
        with session_factory() as session:
            repo = UsuarioRepository(session)
            username = data.username.strip()
            email = str(data.email).strip().lower()
            if repo.get_by_username(username) or repo.get_by_email(email):
                raise HTTPException(409, 'Username o email ya registrado')
            user = Usuario(username=username, full_name=data.full_name.strip(), email=email,
                           hashed_password=hash_password(data.password), role='user')
            session.add(user)
            session.commit()
            session.refresh(user)
            return UserPublic.model_validate(user)

    def authenticate(self, username: str, password: str) -> Usuario:
        with session_factory() as session:
            user = UsuarioRepository(session).get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(401, 'Credenciales incorrectas')
            if user.disabled:
                raise HTTPException(400, 'Cuenta de usuario desactivada')
            session.expunge(user)
            return user

    def list_users(self) -> list[UserPublic]:
        with session_factory() as session:
            users = session.exec(select(Usuario).order_by(Usuario.id)).all()
            return [UserPublic.model_validate(user) for user in users]

    def set_disabled(self, user_id: int, disabled: bool, current_id: int) -> UserPublic:
        with session_factory() as session:
            user = session.get(Usuario, user_id)
            if user is None:
                raise HTTPException(404, 'Usuario no encontrado')
            if disabled and user.id == current_id:
                raise HTTPException(400, 'El administrador no puede desactivarse a sí mismo')
            user.disabled = disabled
            session.add(user)
            session.commit()
            session.refresh(user)
            return UserPublic.model_validate(user)
