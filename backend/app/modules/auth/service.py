from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.schemas import UserCreate, UserPublic


class AuthService:
    def __init__(self):
        self.usuarios = UsuarioService()

    def register(self, data: UserCreate) -> UserPublic:
        return self.usuarios.register(data)

    def login(self, username: str, password: str):
        return self.usuarios.authenticate(username, password)
