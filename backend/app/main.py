from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as users_router
from app.modules.categorias.router import router as categories_router
from app.modules.productos.router import router as products_router
from app.modules.pedidos.router import router as orders_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    create_all_tables()
    yield


app = FastAPI(title='Food Store · API', description='TPI de Programación IV — Santiago Nievas',
              version='1.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[get_settings().FRONTEND_ORIGIN],
                   allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
for router in (auth_router, users_router, categories_router, products_router, orders_router):
    app.include_router(router, prefix='/api/v1')


@app.get('/health', tags=['Sistema'])
def health():
    return {'status': 'ok'}
