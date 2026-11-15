from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import get_settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from .schemas import Message
from .service import AuthService

router = APIRouter(prefix='/auth', tags=['Autenticación'])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post('/register', status_code=201, response_model=UserPublic)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.register(data)


@router.post('/token', response_model=Message)
def login(response: Response, form: OAuth2PasswordRequestForm = Depends(), service: AuthService = Depends(get_auth_service)):
    user = service.login(form.username, form.password)
    settings = get_settings()
    response.set_cookie('access_token', create_access_token(user.id), httponly=True,
                        secure=settings.COOKIE_SECURE, samesite='lax', path='/',
                        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return Message(message='Login exitoso')


@router.post('/logout', response_model=Message)
def logout(response: Response):
    response.delete_cookie('access_token', path='/', samesite='lax', secure=get_settings().COOKIE_SECURE)
    return Message(message='Sesión cerrada')


@router.get('/me', response_model=UserPublic)
def me(user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(user)
