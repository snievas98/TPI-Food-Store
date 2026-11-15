"""Seed idempotente: python -m app.db.seed (desde backend/)."""
from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

CATEGORIAS = [
    ('Hamburguesas', 'Hamburguesas caseras con ingredientes frescos'),
    ('Pizzas', 'Pizzas al horno con masa artesanal'),
    ('Bebidas', 'Bebidas frías para acompañar'),
    ('Acompañamientos', 'Guarniciones y entradas'),
]
PRODUCTOS = [
    ('Hamburguesas', 'Burger clásica', 'Medallón de carne, lechuga, tomate y cheddar', 8500, 30, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700'),
    ('Hamburguesas', 'Burger doble', 'Doble carne, doble queso y salsa especial', 11500, 24, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700'),
    ('Hamburguesas', 'Burger veggie', 'Medallón vegetal y vegetales frescos', 9000, 18, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=700'),
    ('Pizzas', 'Pizza muzzarella', 'Salsa de tomate, muzzarella y orégano', 9900, 35, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700'),
    ('Pizzas', 'Pizza napolitana', 'Tomate fresco, muzzarella y ajo', 11500, 22, 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700'),
    ('Bebidas', 'Gaseosa 500 ml', 'Botella individual bien fría', 2500, 100, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=700'),
    ('Bebidas', 'Agua mineral 500 ml', 'Agua mineral sin gas', 1900, 80, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700'),
    ('Acompañamientos', 'Papas fritas', 'Papas crocantes con salsa', 4200, 60, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700'),
]


def main() -> None:
    create_all_tables()
    with session_factory() as session:
        if session.exec(select(Usuario).where(Usuario.username == 'admin')).first() is None:
            session.add(Usuario(username='admin', full_name='Administrador Food Store', email='admin@foodstore.local',
                                hashed_password=hash_password('Admin1234!'), role='admin'))
            session.flush()
        for name, description in CATEGORIAS:
            if session.exec(select(Categoria).where(Categoria.nombre == name)).first() is None:
                session.add(Categoria(nombre=name, descripcion=description))
                session.flush()
        for cat_name, name, description, price, stock, image in PRODUCTOS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == cat_name)).one()
            if session.exec(select(Producto).where(Producto.nombre == name)).first() is None:
                session.add(Producto(categoria_id=cat.id, nombre=name, descripcion=description,
                                    precio_base=price, stock=stock, imagen_url=image))
                session.flush()
        session.commit()
    print('Seed finalizado. Admin: admin / Admin1234! (solo para desarrollo)')


if __name__ == '__main__':
    main()
