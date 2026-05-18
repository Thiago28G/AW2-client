export const BASE_URL = 'http://localhost:3000/api';

export function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

export function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

export function eliminarDelCarrito(id) {
  const carrito = obtenerCarrito().filter(item => item.id !== id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

export function vaciarCarrito() {
  localStorage.removeItem('carrito');
  actualizarBadgeCarrito();
}

export function actualizarBadgeCarrito() {
  const badge = document.getElementById('badge-carrito');
  if (!badge) return;
  const total = obtenerCarrito().reduce((sum, item) => sum + item.cantidad, 0);
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

export function cargarNavbar() {
  const pagina = window.location.pathname.split('/').pop() || 'index.html';

  const activo  = 'font-semibold text-sm text-cyan-400 border-b-2 border-cyan-400 pb-0.5';
  const inactivo = 'font-semibold text-sm text-gray-400 hover:text-white transition-colors duration-200';

  const claseInicio   = pagina === 'index.html'   ? activo : inactivo;
  const claseFiltrar  = pagina === 'filtrar.html'  ? activo : inactivo;
  const claseCarrito  = pagina === 'carrito.html'
    ? 'relative text-cyan-400'
    : 'relative text-gray-400 hover:text-cyan-400 transition-colors duration-200';

  document.body.insertAdjacentHTML('afterbegin', `
    <nav class="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <a href="index.html" class="flex items-center gap-2.5 group">
            <div class="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-white font-extrabold text-xl tracking-tight group-hover:text-cyan-400 transition-colors">TechStore</span>
          </a>

          <div class="flex items-center gap-8">
            <a href="index.html"  class="${claseInicio}">Inicio</a>
            <a href="filtrar.html" class="${claseFiltrar}">Filtrar</a>
            <a href="carrito.html" class="${claseCarrito}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span
                id="badge-carrito"
                class="hidden absolute -top-2 -right-2 bg-cyan-400 text-gray-900 text-[10px] font-extrabold
                       rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md"
              ></span>
            </a>
          </div>

        </div>
      </div>
    </nav>
  `);
}

// ─── Constantes y helpers de UI compartidos ───────────────────────────────────

export const PLACEHOLDER = 'https://placehold.co/400x260/0f172a/22d3ee?text=Sin+imagen';

export function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style:                'currency',
    currency:             'ARS',
    maximumFractionDigits: 0,
  });
}

export function actualizarCantidadCarrito(id, delta) {
  const carrito = obtenerCarrito();
  const item    = carrito.find(p => p.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
  } else {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
  }
}

export function buildCard(producto) {
  const sinStock = producto.disponible === false || producto.stock === 0;
  const imagen   = producto.imagen || producto.image || PLACEHOLDER;
  const precio   = formatearPrecio(producto.precio ?? producto.price ?? 0);

  const boton = sinStock
    ? `<button
         disabled
         class="w-full mt-auto bg-gray-700 text-gray-500 font-semibold text-sm py-2.5 rounded-xl
                cursor-not-allowed flex items-center justify-center gap-2"
       >
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
         </svg>
         Sin stock
       </button>`
    : `<button
         onclick='onAgregar(${JSON.stringify(producto)})'
         class="w-full mt-auto bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-gray-900 font-bold
                text-sm py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
       >
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
         </svg>
         Agregar al carrito
       </button>`;

  return `
    <div class="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700
                hover:border-cyan-500/60 transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10
                flex flex-col group">
      <div class="overflow-hidden">
        <img
          src="${imagen}"
          alt="${producto.nombre ?? producto.name}"
          class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          onerror="this.src='${PLACEHOLDER}'"
        />
      </div>
      <div class="p-5 flex flex-col flex-1 gap-1">
        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
          ${producto.categoria ?? producto.category ?? ''}
        </span>
        <h3 class="text-white font-bold text-lg leading-snug">
          ${producto.nombre ?? producto.name}
        </h3>
        <p class="text-cyan-400 font-extrabold text-xl mt-1 mb-4">${precio}</p>
        ${boton}
      </div>
    </div>
  `;
}

export function onAgregar(producto) {
  agregarAlCarrito(producto);
  actualizarBadgeCarrito();
  mostrarAlerta(`"${producto.nombre ?? producto.name}" agregado al carrito`, 'exito');
}

export function estadoCargando() {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-400 text-sm">Cargando productos...</p>
    </div>
  `;
}

export function estadoError() {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-24 gap-3 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p class="text-gray-400 font-medium">No se pudieron cargar los productos.</p>
      <button onclick="location.reload()" class="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">
        Reintentar
      </button>
    </div>
  `;
}

export function mostrarAlerta(mensaje, tipo) {
  const estilos = {
    exito: 'bg-green-600 border-green-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    info:  'bg-blue-600 border-blue-500 text-white',
  };

  const alerta = document.createElement('div');
  alerta.className = [
    'fixed top-5 left-1/2 -translate-x-1/2 z-[9999]',
    'px-6 py-3 rounded-xl shadow-2xl border',
    'text-sm font-semibold',
    'transition-opacity duration-300',
    estilos[tipo] ?? estilos.info,
  ].join(' ');
  alerta.textContent = mensaje;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.style.opacity = '0';
    setTimeout(() => alerta.remove(), 300);
  }, 3000);
}
