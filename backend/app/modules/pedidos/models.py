from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__ = 'pedidos'
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key='usuarios.id', nullable=False)
    estado: str = Field(default='PENDIENTE', nullable=False)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(nullable=False)
    notas: str | None = Field(default=None)
    total: float = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=utcnow, nullable=False)
    usuario: 'Usuario' = Relationship(back_populates='pedidos')
    items: list['DetallePedido'] = Relationship(back_populates='pedido')


class DetallePedido(SQLModel, table=True):
    __tablename__ = 'detalles_pedido'
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key='pedidos.id', nullable=False)
    producto_id: int = Field(foreign_key='productos.id', nullable=False)
    cantidad: int = Field(ge=1, nullable=False)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)
    pedido: Pedido = Relationship(back_populates='items')
    producto: 'Producto' = Relationship(back_populates='detalles')
