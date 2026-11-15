# Matriz de requisitos del enunciado TPI Food Store (23 páginas)

La presente matriz permite localizar el código solicitado. **Implementado** significa que existe código fuente; **validación pendiente** significa que no pudo ejecutarse aquí la integración completa por falta de acceso a paquetes externos. Es obligatorio probar en una PC con dependencias instaladas.

| Criterio | Puntos | Implementación y ubicación | Verificación |
|---|---:|---|---|
| Backend: estructura y config. | 10 | `backend/app/core/`, `backend/app/modules/`, `backend/.env.example`, `requirements.txt`, `app/db/seed.py` | Código presente; ejecución pendiente |
| Modelo 5 entidades y UML | 10 | `modules/{usuarios,categorias,productos,pedidos}/models.py`, relaciones con `back_populates`, baja lógica | Código presente; BD pendiente |
| Unit of Work + Repo | 10 | `core/base_repository.py`, `core/unit_of_work.py`, `*/repository.py`, `*/unit_of_work.py` | Sintaxis verificada |
| Autenticación y usuarios | 10 | `core/security.py`, `core/deps.py`, `modules/auth/`, `modules/usuarios/` | Código presente; login pendiente |
| API catálogo | 10 | `modules/categorias/{router,service,schemas}.py`, `modules/productos/{router,service,schemas}.py` | Código presente; pruebas HTTP pendientes |
| API pedidos RN-01 a RN-06 | 15 | `modules/pedidos/service.py`, `repository.py`, `schemas.py`, `unit_of_work.py` | Código presente; prueba de humo pendiente |
| Frontend cliente | 10 | `features/auth`, `features/productos/pages/CatalogoPage.tsx`, `features/pedidos/pages/{Carrito,Checkout,MisPedidos}Page.tsx` | Sintaxis TS revisada; build pendiente |
| Frontend administración | 10 | `AdminCategoriasPage`, `AdminProductosPage`, `AdminPedidosPage`, `AdminUsuariosPage`, `AdminResumenPage` | Sintaxis TS revisada; build pendiente |
| Estado / datos / sesión | 10 | `store/{authStore,cartStore}.ts`, `shared/api/`, `routes/ProtectedRoute.tsx`, `features/*/hooks` | Código presente; ejecución pendiente |
| Calidad / entrega | 5 | `README.md`, `.env.example` (2), tsconfig strict, CI de GitHub, `entrega/` | Faltan enlaces externos |

## Chequeos que requieren ejecución

- `python -m app.db.seed`, `uvicorn app.main:app` y `python scripts/smoke_check.py` desde `backend/`.
- `pnpm install` y `pnpm build` desde `frontend/`.
- Confirmar que `GET /docs` documenta los endpoints y roles; probar registro, login y cancelaciones con navegador.
- En GitHub, la acción `.github/workflows/ci.yml` ejecuta el smoke test del backend y el build del frontend cuando publiques el repositorio. **Su existencia no equivale a una ejecución exitosa.**

## Requisitos externos todavía necesarios para entregar

- **CE-01:** publicar GitHub público y añadir URL real al README; reconstruir ZIP.
- **CE-07:** grabar video propio de 10 a 15 minutos con cámara al inicio, subirlo y añadir URL real al README; reconstruir ZIP.
- **CE-05 y CE-06:** validar en máquina con dependencias descargadas; corregir cualquier error de ejecución que se presente antes de entregar.
