from app.core.errors import NotFound
from app.modules.categorias.models import Categoria
from .models import Producto
from .schemas import ProductoCreate, ProductoRead, ProductoUpdate, ProductoStockUpdate, ProductosPaginados
from .unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(NotFound):
    pass


class CategoriaNoEncontrada(NotFound):
    pass


class ProductoService:
    def __init__(self, uow=ProductoUnitOfWork):
        self.uow = uow()

    @staticmethod
    def active(uow, id: int) -> Producto:
        product = uow.productos.get_by_id(id)
        if product is None or not product.activo:
            raise ProductoNoEncontrado('Producto no encontrado')
        return product

    @staticmethod
    def verify_category(uow, id: int):
        cat = uow.session.get(Categoria, id)
        if cat is None or not cat.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada o inactiva')

    def listar(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None) -> ProductosPaginados:
        with self.uow as uow:
            total, products = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in products])

    def detalle(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self.active(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self.verify_category(uow, data.categoria_id)
            product = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(product)

    def editar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self.active(uow, id)
            updates = data.model_dump(exclude_unset=True, exclude_none=True)
            if 'categoria_id' in updates:
                self.verify_category(uow, updates['categoria_id'])
            for key, value in updates.items():
                setattr(product, key, value)
            uow.session.flush()
            return ProductoRead.model_validate(product)

    def stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self.active(uow, id)
            product.stock = data.stock
            product.disponible = data.disponible
            uow.session.flush()
            return ProductoRead.model_validate(product)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            self.active(uow, id).activo = False
