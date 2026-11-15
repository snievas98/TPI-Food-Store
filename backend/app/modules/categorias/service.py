from app.core.errors import NotFound, Duplicate
from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(NotFound):
    pass


class NombreDuplicado(Duplicate):
    pass


class CategoriaService:
    def __init__(self, uow=CategoriaUnitOfWork):
        self.uow = uow()

    @staticmethod
    def active(uow, id: int) -> Categoria:
        category = uow.categorias.get_by_id(id)
        if category is None or not category.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada')
        return category

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.activas()]

    def detalle(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self.active(uow, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            name = data.nombre.strip()
            if uow.categorias.get_by_nombre(name):
                raise NombreDuplicado('Ya existe una categoría con ese nombre')
            return CategoriaRead.model_validate(uow.categorias.add(Categoria(nombre=name, descripcion=data.descripcion)))

    def editar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            category = self.active(uow, id)
            updates = data.model_dump(exclude_unset=True, exclude_none=True)
            if 'nombre' in updates:
                updates['nombre'] = updates['nombre'].strip()
                other = uow.categorias.get_by_nombre(updates['nombre'])
                if other and other.id != id:
                    raise NombreDuplicado('Ya existe una categoría con ese nombre')
            for key, value in updates.items():
                setattr(category, key, value)
            uow.session.flush()
            return CategoriaRead.model_validate(category)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            self.active(uow, id).activo = False
