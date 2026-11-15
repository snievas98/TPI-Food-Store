from fastapi import APIRouter, Depends
from app.core.deps import require_role
from .models import Usuario
from .schemas import UserPublic
from .service import UsuarioService

router = APIRouter(prefix='/admin/usuarios', tags=['Administración · usuarios'])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get('', response_model=list[UserPublic])
def listar(service: UsuarioService = Depends(get_usuario_service), admin: Usuario = Depends(require_role(['admin']))):
    return service.list_users()


@router.post('/{id}/activar', response_model=UserPublic)
def activar(id: int, service: UsuarioService = Depends(get_usuario_service), admin: Usuario = Depends(require_role(['admin']))):
    return service.set_disabled(id, False, admin.id)


@router.post('/{id}/desactivar', response_model=UserPublic)
def desactivar(id: int, service: UsuarioService = Depends(get_usuario_service), admin: Usuario = Depends(require_role(['admin']))):
    return service.set_disabled(id, True, admin.id)
