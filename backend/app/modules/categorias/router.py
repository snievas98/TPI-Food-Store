from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.deps import require_role
from app.core.errors import DomainError
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from .service import CategoriaService

router = APIRouter(prefix='/categorias', tags=['Catálogo · categorías'])


def get_categoria_service():
    return CategoriaService()


def execute(func):
    try:
        return func()
    except DomainError as e:
        raise HTTPException(e.status_code, e.message) from e


@router.get('', response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return execute(service.listar)


@router.get('/{id}', response_model=CategoriaRead)
def detalle(id: int, service: CategoriaService = Depends(get_categoria_service)):
    return execute(lambda: service.detalle(id))


@router.post('', status_code=201, response_model=CategoriaRead, dependencies=[Depends(require_role(['admin']))])
def crear(data: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    return execute(lambda: service.crear(data))


@router.put('/{id}', response_model=CategoriaRead, dependencies=[Depends(require_role(['admin']))])
def editar(id: int, data: CategoriaUpdate, service: CategoriaService = Depends(get_categoria_service)):
    return execute(lambda: service.editar(id, data))


@router.delete('/{id}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id: int, service: CategoriaService = Depends(get_categoria_service)):
    execute(lambda: service.eliminar(id))
    return Response(status_code=204)
