import {
  BASE_URL,
  obtenerCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  actualizarBadgeCarrito,
  actualizarCantidadCarrito,
  cargarNavbar,
  mostrarAlerta,
  formatearPrecio,
} from './utils.js';

cargarNavbar();
actualizarBadgeCarrito();

document.addEventListener('DOMContentLoaded', renderizarCarrito);

// ─── Renderizado ─────────────────────────────────────────────────────────────

function renderizarCarrito() {
  const carrito        = obtenerCarrito();
  const divVacio       = document.getElementById('carrito-vacio');
  const divContenido   = document.getElementById('carrito-contenido');
  const listaCarrito   = document.getElementById('lista-carrito');
  const totalEl        = document.getElementById('total-carrito');

  if (!carrito.length) {
    divVacio.classList.replace('hidden', 'flex');
    divContenido.classList.add('hidden');
    return;
  }

  divVacio.classList.replace('flex', 'hidden');
  divContenido.classList.replace('hidden', 'flex');

  listaCarrito.innerHTML = buildTabla(carrito);
  totalEl.textContent    = formatearPrecio(calcularTotal(carrito));
  actualizarBadgeCarrito();
}

function buildTabla(carrito) {
  const filas = carrito.map(item => {
    const precio    = item.precio ?? item.price ?? 0;
    const subtotal  = precio * item.cantidad;
    const nombre    = item.nombre ?? item.name ?? '—';

    return `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
        <td class="py-4 pr-4">
          <span class="text-white font-semibold">${nombre}</span>
        </td>
        <td class="py-4 px-4 text-gray-400 text-sm whitespace-nowrap">
          ${formatearPrecio(precio)}
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-2">
            <button
              onclick="cambiarCantidad(${item.id}, -1)"
              class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold
                     flex items-center justify-center transition-colors active:scale-90"
            >−</button>
            <span class="text-white font-bold w-6 text-center">${item.cantidad}</span>
            <button
              onclick="cambiarCantidad(${item.id}, 1)"
              class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold
                     flex items-center justify-center transition-colors active:scale-90"
            >+</button>
          </div>
        </td>
        <td class="py-4 px-4 text-white font-extrabold whitespace-nowrap">
          ${formatearPrecio(subtotal)}
        </td>
        <td class="py-4 pl-4 text-right">
          <button
            onclick="eliminarProducto(${item.id})"
            class="text-gray-600 hover:text-red-400 transition-colors"
            title="Eliminar producto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-700">
          <th class="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pr-4">Producto</th>
          <th class="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Precio unit.</th>
          <th class="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Cantidad</th>
          <th class="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Subtotal</th>
          <th class="pb-3"></th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ─── Acciones de carrito ──────────────────────────────────────────────────────

function cambiarCantidad(id, delta) {
  actualizarCantidadCarrito(id, delta);
  renderizarCarrito();
}

function eliminarProducto(id) {
  eliminarDelCarrito(id);
  renderizarCarrito();
}

function vaciarYRenderizar() {
  vaciarCarrito();
  renderizarCarrito();
}

// ─── Finalizar compra ─────────────────────────────────────────────────────────

async function finalizarCompra() {
  const carrito = obtenerCarrito();

  if (!carrito.length) {
    mostrarAlerta('Tu carrito está vacío. Agregá productos antes de comprar.', 'error');
    return;
  }

  const email = prompt('Ingresá tu email:');
  if (!email || !email.trim()) return;

  const btnFinalizar = document.getElementById('btn-finalizar');
  btnFinalizar.disabled    = true;
  btnFinalizar.textContent = 'Procesando...';

  try {
    // 1. Buscar usuario por email
    const resUsuarios = await fetch(`${BASE_URL}/usuarios`);
    if (!resUsuarios.ok) throw new Error(`Error al obtener usuarios: ${resUsuarios.status}`);

    const usuarios = await resUsuarios.json();
    const usuario  = usuarios.find(u => u.email === email.trim());

    if (!usuario) {
      mostrarAlerta('No encontramos una cuenta con ese email. Verificá e intentá de nuevo.', 'error');
      return;
    }

    // 2. Registrar la venta
    const totalCalculado = calcularTotal(carrito);

    const bodyVenta = {
      id_usuario: usuario.id,
      productos:  carrito.map(p => ({
        id_producto:     p.id,
        cantidad:        p.cantidad,
        precio_unitario: p.precio ?? p.price ?? 0,
      })),
      total: totalCalculado,
    };

    const resVenta = await fetch(`${BASE_URL}/ventas`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(bodyVenta),
    });

    if (resVenta.status === 201) {
      vaciarCarrito();
      mostrarAlerta('¡Compra realizada con éxito! Gracias por tu pedido.', 'exito');
      setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    } else {
      const errorData = await resVenta.json().catch(() => ({}));
      throw new Error(errorData.mensaje ?? `Error al registrar la venta: ${resVenta.status}`);
    }

  } catch (error) {
    mostrarAlerta(`No se pudo completar la compra. ${error.message}`, 'error');
  } finally {
    btnFinalizar.disabled    = false;
    btnFinalizar.textContent = 'Finalizar compra';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularTotal(carrito) {
  return carrito.reduce((sum, item) => sum + (item.precio ?? item.price ?? 0) * item.cantidad, 0);
}

// Expuestas al scope global para los onclick del HTML generado dinámicamente
window.cambiarCantidad  = cambiarCantidad;
window.eliminarProducto = eliminarProducto;
window.vaciarYRenderizar = vaciarYRenderizar;
window.finalizarCompra  = finalizarCompra;
