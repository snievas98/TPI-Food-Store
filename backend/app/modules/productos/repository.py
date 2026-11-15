from sqlmodel import select, func
from app.core.base_repository import BaseRepository
from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session):
        super().__init__(session, Producto)

    def search(self, skip: int = 0, limit: int = 20, search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None) -> tuple[int, list[Producto]]:
        conditions = [Producto.activo == True]  # noqa: E712
        if search:
            conditions.append(Producto.nombre.ilike(f'%{search}%'))
        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conditions.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*conditions)).one()
        items = self.session.exec(select(Producto).where(*conditions).order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, list(items)

    def locked(self, product_id: int) -> Producto | None:
        # Bloqueo de filas en PostgreSQL; SQLite ignora SELECT ... FOR UPDATE.
        return self.session.exec(select(Producto).where(Producto.id == product_id).with_for_update()).first()
