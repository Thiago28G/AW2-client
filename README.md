# TechStore — Cliente

Interfaz de usuario para una tienda de tecnología. Desarrollada con HTML5, JavaScript vanilla con ES Modules y Tailwind CSS. Consume la API REST del back-end para listar y filtrar productos, gestionar el carrito, registrar ventas y administrar el sistema.

| | |
|---|---|
| **Sitio publicado** | https://aw-2-client.vercel.app |
| **API** | https://techstore-api-326a.onrender.com |
| **Repositorio del back-end** | https://github.com/Thiago28G/AW2Back |

---

## Tecnologías

- **HTML5** — estructura semántica de cada página.
- **JavaScript vanilla con ES Modules** — lógica del cliente, sin frameworks ni bundlers.
- **Tailwind CSS vía CDN** — estilos utilitarios, paleta oscura con acento cyan.

---

## Estructura de archivos

```
AW2-client/
│
├── index.html          # Catálogo principal con cards de productos y accesos a categorías
├── filtrar.html        # Búsqueda avanzada por categoría y rango de precio
├── carrito.html        # Carrito de compras con resumen y botón de compra
├── confirmacion.html   # Pantalla de confirmación post-compra con detalle de la orden
├── login.html          # Formulario de inicio de sesión
├── registro.html       # Formulario de registro de cuenta nueva
├── admin.html          # Panel de administración (requiere rol admin)
│
└── js/
    ├── config.js       # URL base de la API, resuelta según el entorno (local / producción)
    ├── api.js          # Wrapper único de fetch: manejo de errores, cookies y eventos de sesión
    ├── auth.js         # Gestión de sesión: obtenerUsuario, requiereLogin, requiereAdmin, cerrarSesion
    ├── utils.js        # Helpers compartidos: navbar, carrito en localStorage, cards, alertas, formateo
    ├── index.js        # Carga y renderizado del catálogo de productos
    ├── filtrar.js      # Lógica del formulario de filtros y preselección desde URL
    ├── carrito.js      # Tabla del carrito, ajuste de cantidades y flujo de compra
    ├── login.js        # Submit del login con validación inline
    ├── registro.js     # Submit del registro con validación inline
    └── admin.js        # CRUD de productos, ventas y usuarios desde el panel de admin
```

---

## Cómo correr en local

> **Prerequisito:** el back-end tiene que estar corriendo en el puerto 3000 antes de abrir el cliente. Instrucciones en el [repositorio del back-end](https://github.com/Thiago28G/AW2Back).

1. Clonar este repositorio.
2. Abrir la carpeta en Visual Studio Code.
3. Hacer clic derecho sobre `index.html` → **Open with Live Server**.
4. El sitio queda disponible en `http://127.0.0.1:5500` (o el puerto que asigne Live Server).

> **Importante:** no abrir los archivos directamente desde el sistema de archivos (`file://`). Los módulos ES (`type="module"`) requieren un servidor HTTP para funcionar.

---

## Configuración de entorno (`js/config.js`)

`config.js` expone una única constante `BASE_URL` que se resuelve sola según el hostname desde el que se sirve la página:

```js
const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const BASE_URL = esLocal
  ? `http://${window.location.hostname}:3000/api`   // desarrollo
  : 'https://techstore-api-326a.onrender.com/api';  // producción
```

En desarrollo, la URL de la API usa el **mismo hostname** desde el que sirve Live Server. Esto es importante: si la página se abre en `127.0.0.1:5500` y la API apuntara fijo a `localhost:3000`, el navegador los trataría como orígenes distintos y bloquearía la cookie de sesión (ver siguiente sección). Para producción, la URL ya está configurada y no requiere ningún cambio.

---

## Autenticación

La autenticación se basa en **JWT almacenado en una cookie `httpOnly`**. Esto significa que el token nunca es accesible desde JavaScript, lo que lo protege de ataques XSS.

Todo pedido al back-end pasa por `js/api.js`, que incluye `credentials: 'include'` en cada request para que el navegador envíe la cookie automáticamente. El cliente nunca lee ni guarda el token: simplemente consulta `GET /usuarios/perfil` para saber si hay sesión activa.

`js/auth.js` expone funciones como `obtenerUsuario()`, `requiereLogin()` y `requiereAdmin()` para proteger páginas que requieren sesión o un rol específico.

---

## Panel de administración

`admin.html` es una interfaz privada que solo pueden acceder usuarios con rol `admin`. Al ingresar, `js/admin.js` llama a `requiereAdmin()` y redirige automáticamente si la sesión no cumple el requisito.

El panel ofrece tres secciones en pestañas:

- **Productos** — alta, edición y baja de productos. La eliminación muestra una advertencia si el producto tiene ventas asociadas.
- **Ventas** — listado con cambio de estado inline (`pendiente → pagada → enviada → cancelada`) y vista de detalle con el desglose de productos.
- **Usuarios** — listado y baja de cuentas.

---

## Credenciales de demo

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@techstore.com | Admin1234 |
| Usuario | lucas@techstore.com | Lucas1234 |

---

## Nota sobre el cold start

El back-end está desplegado en el plan gratuito de Render. Si no recibió tráfico en las últimas horas, la primera request puede tardar **hasta 60 segundos** mientras el servidor se despierta. Las siguientes responden con normalidad.
