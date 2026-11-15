from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = 'productos'
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key='categorias.id', nullable=False)
    nombre: str = Field(nullable=False)
    descripcion: str = Field(default='', nullable=False)
    precio_base: float = Field(ge=0, nullable=False)
    imagen_url: str = Field(default='', nullable=False)
    stock: int = Field(default=0, ge=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)
    categoria: 'Categoria' = Relationship(back_populates='productos')
    detalles: list['DetallePedido'] = Relationship(back_populates='producto')
