from sqlmodel import SQLModel, Session, create_engine
from .config import get_settings

url = get_settings().DATABASE_URL
engine = create_engine(url, echo=False, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {}, pool_pre_ping=True)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def get_session():
    with session_factory() as session:
        yield session


def create_all_tables() -> None:
    # Importar modelos antes de ejecutar create_all.
    from app.modules.usuarios import models as usuarios_models  # noqa: F401
    from app.modules.categorias import models as categorias_models  # noqa: F401
    from app.modules.productos import models as productos_models  # noqa: F401
    from app.modules.pedidos import models as pedidos_models  # noqa: F401
    SQLModel.metadata.create_all(engine)
