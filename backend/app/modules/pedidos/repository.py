from sqlmodel import select, func
from app.core.base_repository import BaseRepository
from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def list_by_usuario(self, user_id: int, skip: int = 0, limit: int = 20, estado: str | None = None, is_admin: bool = False) -> tuple[int, list[Pedido]]:
        conditions = []
        if not is_admin:
            conditions.append(Pedido.usuario_id == user_id)
        if estado:
            conditions.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*conditions)).one()
        orders = self.session.exec(select(Pedido).where(*conditions).order_by(Pedido.created_at.desc(), Pedido.id.desc()).offset(skip).limit(limit)).all()
        return total, list(orders)

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.estado == estado)).one()
