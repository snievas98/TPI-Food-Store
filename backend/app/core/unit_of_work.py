from collections.abc import Callable
from sqlmodel import Session
from .database import session_factory


class UnitOfWork:
    """La única capa que realiza commit, rollback y cierre de la sesión."""

    def __init__(self, factory: Callable[[], Session] = session_factory):
        self.factory = factory
        self.session: Session

    def __enter__(self):
        self.session = self.factory()
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
        return False
