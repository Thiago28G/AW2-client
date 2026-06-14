# TechStore — Cliente Front-end

Interfaz de usuario para una tienda de tecnología. Desarrollada con HTML5, JavaScript vanilla y Tailwind CSS. Consume la API REST del back-end para listar productos, filtrarlos y registrar ventas.

## Requisitos previos

- El back-end debe estar corriendo en `http://localhost:3000` antes de abrir el cliente. Ver instrucciones en el [repositorio del back-end](https://github.com/Thiago28G/AW2TP2).
- Extensión **Live Server** instalada en Visual Studio Code (u otro servidor estático equivalente). No abrir los archivos directamente desde el sistema de archivos, ya que los módulos ES (`type="module"`) no funcionan con el protocolo `file://`.

## Cómo correr el proyecto

1. Clonar este repositorio.
2. Clonar y levantar el back-end según sus instrucciones (debe quedar escuchando en el puerto 3000).
3. Abrir la carpeta del proyecto en Visual Studio Code.
4. Hacer clic derecho sobre `index.html` y seleccionar **Open with Live Server**.
5. El sitio queda disponible en `http://127.0.0.1:5500` (o el puerto que asigne Live Server).

## Estructura del proyecto

```
AW2-client/
├── index.html        # Página de inicio: listado de productos
├── filtrar.html      # Página de filtrado avanzado
├── carrito.html      # Página del carrito de compras
└── js/
    ├── utils.js      # Funciones compartidas entre todas las páginas
    ├── index.js      # Lógica de la página de inicio
    ├── filtrar.js    # Lógica de la página de filtrado
    └── carrito.js    # Lógica del carrito y proceso de compra
```

## Páginas

### Inicio (`index.html`)

Muestra todos los productos disponibles obtenidos desde `GET /api/productos`. Cada producto se presenta en una card con imagen, nombre, categoría y precio en pesos argentinos. Si un producto tiene `disponible: false` o `stock: 0`, el botón de agregar al carrito aparece deshabilitado. Al agregar un producto se guarda en el `localStorage` y se actualiza el badge del carrito en el navbar.

### Filtrar (`filtrar.html`)

Permite buscar productos mediante un formulario con selector de categoría y rango de precio mínimo y máximo. Al enviar el formulario se hace un `POST /api/productos/filtrar` enviando únicamente los campos que el usuario completó. Los resultados se renderizan con el mismo estilo de cards que la página de inicio.

### Carrito (`carrito.html`)

Muestra los productos agregados al carrito en una tabla con nombre, precio unitario, cantidad, subtotal y opción de eliminar. Las cantidades se pueden modificar con los botones + y - y el total se actualiza en tiempo real. Al hacer clic en **Finalizar compra** se solicita el email del usuario, se consulta `GET /api/usuarios` para verificar que exista, y se registra la venta mediante `POST /api/ventas`. Si la venta se registra correctamente, el carrito se vacía y se redirige al inicio.

## Funciones compartidas (`utils.js`)

El archivo `utils.js` centraliza toda la lógica reutilizable:

- `BASE_URL` — URL base de la API (`http://localhost:3000/api`).
- `obtenerCarrito` / `agregarAlCarrito` / `eliminarDelCarrito` / `vaciarCarrito` / `actualizarCantidadCarrito` — gestión del carrito en `localStorage`.
- `actualizarBadgeCarrito` — sincroniza el contador del navbar con el estado actual del carrito.
- `cargarNavbar` — inyecta el navbar en el `<body>` de cualquier página, marcando el link activo según la URL actual.
- `buildCard` — genera el HTML de una card de producto.
- `formatearPrecio` — formatea un número como moneda argentina (ARS).
- `mostrarAlerta` — muestra una notificación temporal en la parte superior de la pantalla con estilo según el tipo (`exito`, `error`, `info`).

## Back-end

Repositorio: [https://github.com/Thiago28G/AW2TP2](https://github.com/Thiago28G/AW2TP2)
