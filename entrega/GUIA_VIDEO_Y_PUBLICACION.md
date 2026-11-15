# Guía de publicación y defensa del TPI Food Store

## Publicación del repositorio

La consigna pide **GitHub público**, no alcanza con entregar solo el ZIP. Desde la raíz del proyecto:

```bash
git init
git add .
git commit -m "TPI Food Store - Santiago Nievas"
git branch -M main
```

Abrí GitHub en tu cuenta y creá un repositorio **público** nuevo (nombre sugerido: `TPI-Food-Store`) sin inicializarlo con otros archivos. En la raíz del proyecto ejecutá (reemplazá `USUARIO` con tu usuario real):

```bash
git remote add origin https://github.com/USUARIO/TPI-Food-Store.git
git push -u origin main
```

Si `origin` ya existe, utilizar `git remote set-url origin ...`. Copiá la URL real, comproba que abra en una sesión incógnita y reemplazá `PENDIENTE DE PUBLICACIÓN` en **README.md de la raíz**. Hacé un nuevo commit y push de ese cambio. No subas `.env`, `.venv`, `node_modules` ni contraseñas privadas.

## Preparación para la grabación

1. Encendé PostgreSQL si lo usás y abrí dos terminales: backend (`uvicorn app.main:app --reload`) y frontend (`pnpm dev`).
2. Ejecutá `python -m app.db.seed` una vez; verificá que admin `admin` / `Admin1234!` ingrese.
3. Elegí un producto de stock inicial conocido y apuntá su valor inicial para demostrar descuento y devolución.
4. Prepará una cuenta cliente **nueva** (o registrala durante el video) y el navegador en `http://localhost:5173`.
5. Grabá pantalla y **cámara encendida al inicio**, como exige el PDF. Se sugiere OBS Studio, sin necesidad de mostrar datos personales.

## Guion estimado: 12 a 13 minutos

| Tiempo | Mostrar en pantalla | Explicación sugerida |
|---|---|---|
| 0:00–0:50 | Cámara encendida y portada del proyecto | Nombre, asignatura y objetivo: sistema de pedidos completo, dos roles |
| 0:50–1:40 | Estructura `backend/app/` y `frontend/src/` en VS Code | Capas Router/Service/UoW/Repository/Model y organización por features |
| 1:40–2:10 | `/docs` de FastAPI | Endpoints `/api/v1`, schemas y códigos HTTP |
| 2:10–3:00 | `/register`, `/login` | Registro público siempre `user`; sesión con cookie HttpOnly, no token en localStorage |
| 3:00–4:00 | Catálogo | Buscar, filtrar por categoría, paginar y revisar disponibilidad |
| 4:00–5:00 | Carrito | Agregar cantidades, recargar para ver que persiste, revisar total |
| 5:00–6:20 | Checkout | Dirección, pago en efectivo/transferencia, confirmar; detalles/precio copiados |
| 6:20–7:20 | `/mis-pedidos` | Pedido `PENDIENTE`, detalle, total, posibilidad de cancelar |
| 7:20–8:20 | Administrador: productos | Ver stock reducido, modificar stock/disponibilidad; explicar baja lógica |
| 8:20–9:00 | Administrador: categorías y usuarios | CRUD de categorías, activar/desactivar y restricción de auto-desactivación |
| 9:00–10:00 | Administración: pedidos | Avanzar **otro pedido** PENDIENTE → EN_PREPARACION → ENTREGADO |
| 10:00–11:20 | Cancelación y stock | Cancelar un pedido pendiente (cliente) o no terminal (admin); mostrar stock restituido |
| 11:20–12:20 | Panel resumen y código `service.py` | Conteos, ingresos entregados; rollback en UoW, inmutabilidad de detalles y total |
| 12:20–13:00 | README y repositorio público | Mostrar cómo arrancar y confirmar URLs de entrega |

**Importante:** usá dos pedidos distintos para las pruebas de entrega y cancelación, porque `ENTREGADO` es terminal y no puede cancelarse. Evitá que el video supere 15 minutos y no aceleres tanto que deje de verse el comportamiento real.

## Publicar y verificar video

Subí la grabación a Drive/YouTube con acceso por enlace. Comprobá desde una ventana de incógnito que se puede abrir sin permiso especial. Reemplazá `PENDIENTE DE GRABACIÓN` en el README con la URL real y subí el cambio con Git.

Antes de entregar el ZIP definitivo, verificá que dentro aparezcan `README.md`, `backend/`, `frontend/`, ambos `.env.example` y que **NO** aparezcan `.env`, `venv` ni `node_modules`. Si corregís el README después de grabar, actualizá el ZIP antes de subirlo al campus.
