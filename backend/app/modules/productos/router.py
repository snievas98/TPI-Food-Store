from fastapi import APIRouter, Depends, HTTPException, Query, Response
from app.core.deps import require_role
from app.core.errors import DomainError
from .service import ProductoService
from .schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados

router = APIRouter(prefix='/productos', tags=['Catálogo · productos'])


def get_producto_service():
    return ProductoService()


def execute(func):
    try:
        return func()
    except DomainError as e:
        raise HTTPException(e.status_code, e.message) from e


@router.get('', response_model=ProductosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), search: str | None = None,
           categoria_id: int | None = None, disponible: bool | None = None,
           service: ProductoService = Depends(get_producto_service)):
    return execute(lambda: service.listar(skip, limit, search, categoria_id, disponible))


@router.get('/{id}', response_model=ProductoRead)
def detalle(id: int, service: ProductoService = Depends(get_producto_service)):
    return execute(lambda: service.detalle(id))


@router.post('', status_code=201, response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def crear(data: ProductoCreate, service: ProductoService = Depends(get_producto_service)):
    return execute(lambda: service.crear(data))


@router.put('/{id}', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def editar(id: int, data: ProductoUpdate, service: ProductoService = Depends(get_producto_service)):
    return execute(lambda: service.editar(id, data))


@router.patch('/{id}/stock', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def stock(id: int, data: ProductoStockUpdate, service: ProductoService = Depends(get_producto_service)):
    return execute(lambda: service.stock(id, data))


@router.delete('/{id}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id: int, service: ProductoService = Depends(get_producto_service)):
    execute(lambda: service.eliminar(id))
    return Response(status_code=204)
