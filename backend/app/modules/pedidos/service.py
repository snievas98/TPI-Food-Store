from datetime import datetime, time, timezone
from sqlmodel import select, func
from app.core.errors import DomainError, NotFound, Forbidden
from .models import Pedido, DetallePedido
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos, EstadoPedido
from .unit_of_work import PedidoUnitOfWork

class PedidoNoEncontrado(NotFound):
    pass


class ProductoNoEncontrado(NotFound):
    pass


class PedidoAjeno(Forbidden):
    pass


class StockInsuficiente(DomainError):
    pass


class ProductoNoDisponible(DomainError):
    pass


class ProductoRepetido(DomainError):
    pass


class TransicionInvalida(DomainError):
    pass


TRANSICIONES: dict[str, set[str]] = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class PedidoService:
    def __init__(self, uow=PedidoUnitOfWork):
        self.uow = uow()

    @staticmethod
    def read(p: Pedido) -> PedidoRead:
        return PedidoRead.model_validate(p)

    @staticmethod
    def get(uow, id: int, user_id: int, admin: bool) -> Pedido:
        order = uow.pedidos.get_by_id(id)
        if order is None:
            raise PedidoNoEncontrado('Pedido no encontrado')
        if not admin and order.usuario_id != user_id:
            raise PedidoAjeno('No puede consultar pedidos de otro usuario')
        return order

    def crear(self, data: PedidoCreate, user_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido('No se puede repetir un producto en el pedido')
            order = uow.pedidos.add(Pedido(usuario_id=user_id, estado='PENDIENTE', forma_pago=data.forma_pago,
                                           direccion_entrega=data.direccion_entrega.strip(), notas=data.notas, total=0))
            total = 0.0
            for item in data.items:
                product = uow.productos.locked(item.producto_id)
                if product is None or not product.activo:
                    raise ProductoNoEncontrado(f'Producto {item.producto_id} no encontrado')
                if not product.disponible:
                    raise ProductoNoDisponible(f'El producto {product.nombre} no está disponible')
                if product.stock < item.cantidad:
                    raise StockInsuficiente(f'Stock insuficiente para {product.nombre} (disponible: {product.stock})')
                product.stock -= item.cantidad
                subtotal = round(product.precio_base * item.cantidad, 2)
                detail = DetallePedido(pedido_id=order.id, producto_id=product.id, cantidad=item.cantidad,
                                       nombre_producto=product.nombre, precio_unitario=product.precio_base,
                                       subtotal=subtotal)
                uow.session.add(detail)
                uow.session.flush()
                total += subtotal
            order.total = round(total, 2)
            uow.session.flush()
            return self.read(order)

    def listar(self, user_id: int, admin: bool, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            total, orders = uow.pedidos.list_by_usuario(user_id, skip, limit, estado, admin)
            return PedidosPaginados(total=total, items=[self.read(p) for p in orders])

    def detalle(self, id: int, user_id: int, admin: bool) -> PedidoRead:
        with self.uow as uow:
            return self.read(self.get(uow, id, user_id, admin))

    def _transicionar(self, uow, order: Pedido, nuevo: str) -> PedidoRead:
        if nuevo not in TRANSICIONES[order.estado]:
            raise TransicionInvalida(f'Transición inválida: {order.estado} → {nuevo}')
        if nuevo == 'CANCELADO':
            for item in order.items:
                # Productos inactivos también deben recibir restitución de stock.
                product = uow.productos.locked(item.producto_id)
                if product is None:
                    raise ProductoNoEncontrado('Producto del pedido no encontrado al restituir stock')
                product.stock += item.cantidad
        order.estado = nuevo
        order.updated_at = datetime.now(timezone.utc)
        uow.session.flush()
        return self.read(order)

    def cambiar_estado(self, id: int, nuevo: EstadoPedido, user_id: int) -> PedidoRead:
        with self.uow as uow:
            order = self.get(uow, id, user_id, True)
            return self._transicionar(uow, order, nuevo)

    def cancelar(self, id: int, user_id: int) -> PedidoRead:
        with self.uow as uow:
            order = self.get(uow, id, user_id, False)
            if order.estado != 'PENDIENTE':
                raise TransicionInvalida('Solo se pueden cancelar pedidos propios en PENDIENTE')
            return self._transicionar(uow, order, 'CANCELADO')

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            s = uow.session
            inicio = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
            hoy = s.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio)).one()
            ingresos = s.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == 'ENTREGADO')).one()
            return ResumenPedidos(pendientes=uow.pedidos.count_by_estado('PENDIENTE'),
                                  en_preparacion=uow.pedidos.count_by_estado('EN_PREPARACION'),
                                  entregados=uow.pedidos.count_by_estado('ENTREGADO'),
                                  cancelados=uow.pedidos.count_by_estado('CANCELADO'),
                                  pedidos_hoy=hoy, ingresos_entregados=round(float(ingresos), 2))
