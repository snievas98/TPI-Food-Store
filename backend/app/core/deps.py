from typing import Callable
from fastapi import Depends, HTTPException, Request
from sqlmodel import Session
from .database import get_session
from .security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(401, detail='No autenticado')
    try:
        user_id = decode_access_token(token)
    except ValueError:
        raise HTTPException(401, detail='Token inválido o vencido') from None
    user = session.get(Usuario, user_id)
    if user is None:
        raise HTTPException(401, detail='Sesión inválida')
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(400, detail='Cuenta de usuario desactivada')
    return user


def require_role(roles: list[str]) -> Callable:
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(403, detail='Permisos insuficientes')
        return user
    return checker
