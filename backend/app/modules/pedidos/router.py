from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.core.errors import DomainError
from app.modules.usuarios.models import Usuario
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, ResumenPedidos, EstadoPedido
from .service import PedidoService

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])


def get_pedido_service():
    return PedidoService()


def execute(func):
    try:
        return func()
    except DomainError as e:
        raise HTTPException(e.status_code, e.message) from e


@router.post('', status_code=201, response_model=PedidoRead)
def crear(data: PedidoCreate, usuario: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return execute(lambda: service.crear(data, usuario.id))


@router.get('', response_model=PedidosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), estado: EstadoPedido | None = None,
           usuario: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return execute(lambda: service.listar(usuario.id, usuario.role == 'admin', skip, limit, estado))


# ¡Antes de /{id} para que "resumen" no se interprete como un id!
@router.get('/resumen', response_model=ResumenPedidos)
def resumen(admin: Usuario = Depends(require_role(['admin'])), service: PedidoService = Depends(get_pedido_service)):
    return execute(service.resumen)


@router.get('/{id}', response_model=PedidoRead)
def detalle(id: int, usuario: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return execute(lambda: service.detalle(id, usuario.id, usuario.role == 'admin'))


@router.patch('/{id}/estado', response_model=PedidoRead)
def estado(id: int, data: CambioEstado, admin: Usuario = Depends(require_role(['admin'])), service: PedidoService = Depends(get_pedido_service)):
    return execute(lambda: service.cambiar_estado(id, data.estado, admin.id))


@router.patch('/{id}/cancelar', response_model=PedidoRead)
def cancelar(id: int, usuario: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return execute(lambda: service.cancelar(id, usuario.id))
