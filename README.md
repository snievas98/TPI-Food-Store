# Food Store — Trabajo Práctico Integrador · Programación IV

**Autor:** Santiago Nievas  
**Carrera:** Tecnicatura Universitaria en Programación a Distancia — UTN  
**Materia:** Programación IV · 2026

Food Store es una aplicación web completa para pedidos de comida. Tiene un **backend FastAPI + SQLModel** con arquitectura Router → Service → Unit of Work → Repository → Model, y un **frontend React + TypeScript** organizado por features, con autenticación JWT en cookie HttpOnly, roles `admin` / `user`, React Query, Zustand, TanStack Form y TanStack Table.

## Repositorio y demostración

- **Repositorio público:** https://github.com/snievas98/TPI-Food-Store
- **Video de demostración:** Pendiente de grabación.

## Requisitos

- Python **3.11, 3.12 o 3.13**; `pip`.
- Node.js **20.19+** y pnpm **9+** (`corepack enable` y `corepack prepare pnpm@9.15.9 --activate`, o instalar pnpm 9 por separado).
- PostgreSQL **15+** para la base de datos requerida; **SQLite** también es válido para pruebas locales, tal como permite la consigna.
- Dos terminales, una para el backend y otra para el frontend.
- Si se usa PostgreSQL opcionalmente se puede levantar la base con Docker Desktop y `docker compose up -d db`.

## 1. Configurar el backend

Desde la raíz del proyecto:

```bash
cd backend
python -m venv .venv
```

Activar el entorno virtual:

```powershell
# PowerShell en Windows
.\.venv\Scripts\Activate.ps1
```

```bash
# Linux / macOS
source .venv/bin/activate
```

Instalar dependencias, configurar variables y ejecutar el seed:

```bash
pip install -r requirements.txt
```

Copiar **`backend/.env.example` a `backend/.env`** sin borrar el archivo de ejemplo. En Windows: `Copy-Item .env.example .env`; Linux/macOS: `cp .env.example .env`.

En `backend/.env` utilizar una `SECRET_KEY` propia de al menos 32 caracteres. Para generarla:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Por defecto el ejemplo usa **SQLite**, apto para desarrollo. Para PostgreSQL, levantar `docker compose up -d db` desde la raíz y configurar:

```dotenv
DATABASE_URL=postgresql://foodstore:foodstore@localhost:5432/foodstore_db
SECRET_KEY=una-clave-secreta-real-con-32-o-mas-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
```

> `COOKIE_SECURE=false` corresponde únicamente a HTTP en `localhost`. En producción con HTTPS debe ser `true`; las cookies usan `HttpOnly`, `SameSite=Lax` y no se devuelven en el cuerpo del login. Frontend y backend deben usar el mismo hostname `localhost` para que se envíen las cookies. El servidor de Vite puede accesarse en `http://localhost:5173`.

Ejecutar:

```bash
python -m app.db.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

El seed es **idempotente**: si se ejecuta de nuevo, no duplica categorías, productos ni administrador. Crea cuatro categorías y ocho productos de muestra con stock. Los datos de imagen utilizan URLs públicas; si alguna imagen externa no está disponible, la aplicación sigue funcionando.

**Cuenta administrativa local del seed:**

| Dato | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin1234!` |
| Rol | `admin` |

Estos datos son exclusivamente para la demostración en entorno local. No exponer esta cuenta en una instalación pública. La API Swagger estará en <http://localhost:8000/docs>, ReDoc en <http://localhost:8000/redoc> y healthcheck en <http://localhost:8000/health>.

## 2. Configurar el frontend

En una **segunda terminal** desde la raíz:

```bash
cd frontend
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install
```

Copiar **`frontend/.env.example` a `frontend/.env`** (Windows: `Copy-Item .env.example .env`; Linux/macOS: `cp .env.example .env`). Su contenido debe ser:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Ejecutar las verificaciones y abrir la aplicación:

```bash
pnpm build
pnpm dev
```

Visitar **<http://localhost:5173>**. Los dos procesos deben permanecer ejecutándose. Si se modifica una variable `.env`, reiniciar el proceso correspondiente.

## Funcionalidades y rutas

| Rol | Ruta | Funcionalidad |
|---|---|---|
| Público | `/`, `/login`, `/register` | Catálogo con filtro/búsqueda/paginación, autenticación y registro |
| Público | `/carrito` | Carrito persistente con cantidades y total |
| Usuario autenticado | `/checkout` | Confirmar dirección, pago manual y pedido transaccional |
| Usuario autenticado | `/mis-pedidos` | Detalle, estado y cancelación de pedidos pendientes propios |
| Admin | `/admin/resumen` | Indicadores de pedidos e ingresos entregados |
| Admin | `/admin/categorias` | Crear, modificar, dar de baja (lógica) |
| Admin | `/admin/productos` | Crear, modificar, stock, disponibilidad, baja lógica |
| Admin | `/admin/pedidos` | Gestionar estado, entregar y cancelar con devolución de stock |
| Admin | `/admin/usuarios` | Listar, activar y desactivar usuarios (no puede desactivarse a sí mismo) |

## Reglas de negocio implementadas

- **RN-01:** pedido de uno o más productos, sin repetidos, con validación de productos activos, disponibles y stock. Descuento de stock y copia de nombre/precio al detalle dentro del mismo Unit of Work; rollback integral al fallar.
- **RN-02:** estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, o cancelación desde los dos estados no terminales por admin.
- **RN-03:** cancelación restaura stock de cada detalle en la misma transacción.
- **RN-04:** cada cliente solo accede a sus pedidos y los cancela en `PENDIENTE`; el administrador tiene permisos sobre todos.
- **RN-05:** total y detalles inmutables; sin endpoint de modificación ni borrado de pedidos.
- **RN-06:** `EFECTIVO` o `TRANSFERENCIA`, dirección de 5 a 200 caracteres.

**Backend:** cinco tablas `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`, con las relaciones exactas del UML. Auth/usuarios siguen el estilo directo autorizado en la consigna; categorías/productos/pedidos utilizan Service, Unit of Work y repositorios y nunca hacen commit en Service o Router. API bajo `/api/v1`, respuesta `detail` consistente, paginación `skip` y `limit` (máximo 100).

**Frontend:** Axios con credenciales e interceptor de respuestas, React Query para estado del servidor e invalidación, Zustand persistente para usuario y carrito, sin guardar jamás el token en JavaScript o localStorage. TanStack Form para registro, login, checkout y edición; TanStack Table para ABM; React Router con `ProtectedRoute` de cliente/admin. TypeScript strict.

## Comprobación manual recomendada

1. Ejecutar seed y abrir `/docs`; verificar los endpoints de auth, usuarios, categorías, productos y pedidos.
2. Entrar como `admin`, comprobar las 4 categorías / 8 productos y stock inicial de un producto.
3. Cerrar sesión, registrar un usuario nuevo y hacer login. Agregar 2 unidades de un producto al carrito, recargar la página y verificar su persistencia.
4. Completar checkout con dirección y efectivo o transferencia. Verificar en `/mis-pedidos` que el pedido nace `PENDIENTE` con total correcto.
5. Ingresar como admin y ver stock descontado, pedidos y resumen. Cambiar un pedido a `EN_PREPARACION` y luego `ENTREGADO`.
6. Crear otro pedido y **cancelarlo cuando está pendiente**. Comprobar la restitución exacta de stock.
7. Probar usuario sin permisos administrativos (403), pedidos ajenos (403), duplicados (409), stock insuficiente (400) y la baja lógica (204).

## Estructura

```text
.
├── README.md                       ← ÚNICO README de entrega
├── backend/
│   ├── .env.example, requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/                   ← config, database, security, deps, UoW y repo base
│       ├── modules/
│       │   ├── auth/
│       │   ├── usuarios/
│       │   ├── categorias/
│       │   ├── productos/
│       │   └── pedidos/
│       └── db/seed.py
├── frontend/
│   ├── .env.example, package.json, tsconfig*.json, vite.config.ts
│   └── src/
│       ├── features/{auth,categorias,productos,pedidos,usuarios}/
│       ├── shared/{api,components,layout,ui}/
│       ├── routes/
│       └── store/
├── docker-compose.yml             ← PostgreSQL opcional para desarrollo
└── entrega/                        ← Instrucciones para publicación y video
```

## Entrega final

Se entrega un ZIP del proyecto sin `.env`, `venv` ni `node_modules`, un repositorio público de GitHub con su URL en este README y un video público de **10 a 15 minutos** (enlace también en este README). Para la presentación hay que encender la cámara al inicio y demostrar registro, compra, administración y cancelación con restitución. Consultar `entrega/GUIA_VIDEO_Y_PUBLICACION.md`.
