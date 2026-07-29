import { api } from './api.js';
import { requiereAdmin } from './auth.js';
import {
  cargarNavbar,
  actualizarBadgeCarrito,
  formatearPrecio,
  PLACEHOLDER,
} from './utils.js';

// ─── Guard de acceso ──────────────────────────────────────────────────────────
const usuario = await requiereAdmin();
if (usuario) init();

// ─── Estado de módulo ─────────────────────────────────────────────────────────
const productosMap = new Map();
const ventasMap    = new Map();
const usuariosMap  = new Map();

// ═════════════════════════════════════════════════════════════════════════════
//  ALERTAS
// ═════════════════════════════════════════════════════════════════════════════

function alerta(mensaje, tipo = 'error') {
  const ESTILOS = {
    exito:       'bg-green-700 border-green-600 text-white',
    error:       'bg-red-700   border-red-600   text-white',
    advertencia: 'bg-yellow-500 border-yellow-400 text-gray-900',
  };

  const div = document.createElement('div');
  div.className = [
    'pointer-events-auto px-5 py-3 rounded-xl shadow-2xl border',
    'text-sm font-semibold transition-opacity duration-300',
    ESTILOS[tipo] ?? ESTILOS.error,
  ].join(' ');
  div.textContent = mensaje;
  document.getElementById('alertas').appendChild(div);

  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 300);
  }, 5000);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PESTAÑAS
// ═════════════════════════════════════════════════════════════════════════════

function initTabs() {
  const SECCIONES = ['seccion-productos', 'seccion-ventas', 'seccion-usuarios'];
  const botones   = document.querySelectorAll('[id^="tab-btn-"]');

  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      botones.forEach(b => {
        const activo = b === btn;
        b.classList.toggle('text-cyan-400',      activo);
        b.classList.toggle('border-cyan-400',    activo);
        b.classList.toggle('text-gray-400',     !activo);
        b.classList.toggle('border-transparent',!activo);
        b.setAttribute('aria-selected', String(activo));
      });

      SECCIONES.forEach(id =>
        document.getElementById(id).classList.toggle('hidden', id !== target)
      );
    });
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  PRODUCTOS
// ═════════════════════════════════════════════════════════════════════════════

async function cargarProductos() {
  try {
    const productos = await api.get('/productos');
    productosMap.clear();
    productos.forEach(p => productosMap.set(p._id, p));

    document.getElementById('cuerpo-productos').innerHTML =
      productos.length ? productos.map(filaProducto).join('') : filaSinDatos(7, 'No hay productos cargados.');

    document.getElementById('productos-cargando').classList.add('hidden');
    document.getElementById('tabla-productos').classList.remove('hidden');
    document.getElementById('contador-productos').textContent =
      `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
  } catch (error) {
    alerta(`Error al cargar productos: ${error.message}`, 'error');
  }
}

function filaProducto(p) {
  const imagen     = resolverImagen(p.imagen);
  const disponible = p.disponible !== false && (p.stock ?? 0) > 0;

  return `
    <tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
      <td class="py-3 px-5">
        <img src="${imagen}" alt="${esc(p.nombre)}"
             class="w-12 h-12 object-contain rounded-lg bg-white p-1"
             onerror="this.src='${PLACEHOLDER}'" />
      </td>
      <td class="py-3 px-4 text-white font-semibold">${esc(p.nombre)}</td>
      <td class="py-3 px-4 text-gray-400 text-sm">${esc(p.categoria ?? '—')}</td>
      <td class="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">${formatearPrecio(p.precio ?? 0)}</td>
      <td class="py-3 px-4 text-gray-300">${p.stock ?? 0}</td>
      <td class="py-3 px-4">
        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                     ${disponible ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}">
          ${disponible ? 'Sí' : 'No'}
        </span>
      </td>
      <td class="py-3 px-5">
        <div class="flex items-center justify-end gap-2">
          <button data-action="editar" data-id="${p._id}"
                  class="text-xs font-semibold text-cyan-400 hover:text-cyan-300
                         px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Editar
          </button>
          <button data-action="eliminar" data-id="${p._id}"
                  class="text-xs font-semibold text-red-400 hover:text-red-300
                         px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-400/60
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Eliminar
          </button>
        </div>
      </td>
    </tr>`;
}

function initEventosProductos() {
  document.getElementById('btn-nuevo-producto')
    .addEventListener('click', () => abrirModalProducto());

  document.getElementById('cuerpo-productos').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled) return;
    const { action, id } = btn.dataset;
    btn.disabled = true;
    try {
      if (action === 'editar')   abrirModalProducto(productosMap.get(id));
      if (action === 'eliminar') await eliminarProducto(id);
    } finally {
      btn.disabled = false;
    }
  });
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  try {
    await api.del(`/productos/${id}`);
    alerta('Producto eliminado.', 'exito');
    await cargarProductos();
  } catch (error) {
    alerta(error.message ?? 'Error al eliminar el producto.',
           error.status === 409 ? 'advertencia' : 'error');
  }
}

// ─── Modal producto ───────────────────────────────────────────────────────────

function initModalProducto() {
  const modal = document.getElementById('modal-producto');
  const form  = document.getElementById('form-producto');

  document.getElementById('modal-producto-cerrar')
    .addEventListener('click', cerrarModalProducto);
  document.getElementById('modal-producto-cancelar')
    .addEventListener('click', cerrarModalProducto);
  modal.addEventListener('click', e => { if (e.target === modal) cerrarModalProducto(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try { await guardarProducto(); }
    finally { btn.disabled = false; }
  });
}

function abrirModalProducto(p = null) {
  document.getElementById('modal-producto-titulo').textContent =
    p ? 'Editar producto' : 'Nuevo producto';

  if (p) {
    document.getElementById('producto-id').value          = p._id;
    document.getElementById('producto-nombre').value      = p.nombre       ?? '';
    document.getElementById('producto-descripcion').value = p.descripcion  ?? '';
    document.getElementById('producto-categoria').value   = p.categoria    ?? '';
    document.getElementById('producto-precio').value      = p.precio       ?? '';
    document.getElementById('producto-stock').value       = p.stock        ?? '';
    document.getElementById('producto-imagen').value      = p.imagen       ?? '';
    document.getElementById('producto-disponible').checked = p.disponible !== false;
  } else {
    document.getElementById('form-producto').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('producto-disponible').checked = true;
  }

  document.getElementById('modal-producto').classList.remove('hidden');
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.add('hidden');
}

async function guardarProducto() {
  const id = document.getElementById('producto-id').value;

  const datos = {
    nombre:      document.getElementById('producto-nombre').value.trim(),
    descripcion: document.getElementById('producto-descripcion').value.trim(),
    categoria:   document.getElementById('producto-categoria').value,
    precio:      Number(document.getElementById('producto-precio').value),
    stock:       Number(document.getElementById('producto-stock').value),
    imagen:      document.getElementById('producto-imagen').value.trim(),
    disponible:  document.getElementById('producto-disponible').checked,
  };

  try {
    if (id) {
      await api.put(`/productos/${id}`, datos);
      alerta('Producto actualizado.', 'exito');
    } else {
      await api.post('/productos', datos);
      alerta('Producto creado.', 'exito');
    }
    cerrarModalProducto();
    await cargarProductos();
  } catch (error) {
    alerta(error.message ?? 'Error al guardar el producto.', 'error');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  VENTAS
// ═════════════════════════════════════════════════════════════════════════════

const ESTADOS_VENTA = ['pendiente', 'pagada', 'enviada', 'cancelada'];

async function cargarVentas() {
  try {
    const ventas = await api.get('/ventas');
    ventasMap.clear();
    ventas.forEach(v => ventasMap.set(v._id, v));

    document.getElementById('cuerpo-ventas').innerHTML =
      ventas.length ? ventas.map(filaVenta).join('') : filaSinDatos(6, 'No hay ventas registradas.');

    document.getElementById('ventas-cargando').classList.add('hidden');
    document.getElementById('tabla-ventas').classList.remove('hidden');
    document.getElementById('contador-ventas').textContent =
      `${ventas.length} venta${ventas.length !== 1 ? 's' : ''}`;
  } catch (error) {
    alerta(`Error al cargar ventas: ${error.message}`, 'error');
  }
}

function filaVenta(v) {
  const fecha     = v.createdAt
    ? new Date(v.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';
  const cantItems = (v.productos ?? []).reduce((s, i) => s + (i.cantidad ?? 0), 0);
  const opciones  = ESTADOS_VENTA.map(e =>
    `<option value="${e}" ${v.estado === e ? 'selected' : ''}>${capitalizar(e)}</option>`
  ).join('');

  return `
    <tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
      <td class="py-3 px-5 text-gray-400 text-sm whitespace-nowrap">${fecha}</td>
      <td class="py-3 px-4">
        <div class="text-white font-semibold text-sm">${esc(v.usuario?.nombre ?? '—')}</div>
        <div class="text-gray-500 text-xs">${esc(v.usuario?.email ?? '')}</div>
      </td>
      <td class="py-3 px-4 text-gray-300 text-sm">${cantItems}</td>
      <td class="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">${formatearPrecio(v.total ?? 0)}</td>
      <td class="py-3 px-4">
        <select data-venta-id="${v._id}"
                class="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs
                       focus:outline-none focus:border-cyan-500 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed">
          ${opciones}
        </select>
      </td>
      <td class="py-3 px-5">
        <div class="flex items-center justify-end gap-2">
          <button data-action="ver-detalle" data-id="${v._id}"
                  class="text-xs font-semibold text-cyan-400 hover:text-cyan-300
                         px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Detalle
          </button>
          <button data-action="eliminar-venta" data-id="${v._id}"
                  class="text-xs font-semibold text-red-400 hover:text-red-300
                         px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-400/60
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Eliminar
          </button>
        </div>
      </td>
    </tr>`;
}

function initEventosVentas() {
  const tbody = document.getElementById('cuerpo-ventas');

  tbody.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled) return;
    const { action, id } = btn.dataset;
    btn.disabled = true;
    try {
      if (action === 'ver-detalle')    verDetalleVenta(id);
      if (action === 'eliminar-venta') await eliminarVenta(id);
    } finally {
      btn.disabled = false;
    }
  });

  tbody.addEventListener('change', async e => {
    const sel = e.target.closest('select[data-venta-id]');
    if (!sel) return;
    sel.disabled = true;
    try {
      await cambiarEstadoVenta(sel.dataset.ventaId, sel.value);
    } finally {
      sel.disabled = false;
    }
  });
}

async function cambiarEstadoVenta(id, estado) {
  try {
    await api.put(`/ventas/${id}`, { estado });
    // Actualizar el mapa local para que el modal de detalle refleje el cambio
    const v = ventasMap.get(id);
    if (v) v.estado = estado;
    alerta(`Estado actualizado a "${estado}".`, 'exito');
  } catch (error) {
    alerta(error.message ?? 'Error al cambiar el estado.', 'error');
    // Restaurar el valor previo recargando la tabla
    await cargarVentas();
  }
}

async function eliminarVenta(id) {
  if (!confirm('¿Eliminar esta venta? El stock de los productos será repuesto automáticamente.')) return;
  try {
    await api.del(`/ventas/${id}`);
    alerta('Venta eliminada y stock repuesto.', 'exito');
    await cargarVentas();
  } catch (error) {
    alerta(error.message ?? 'Error al eliminar la venta.',
           error.status === 409 ? 'advertencia' : 'error');
  }
}

// ─── Modal detalle de venta ───────────────────────────────────────────────────

function initModalDetalle() {
  const modal = document.getElementById('modal-detalle-venta');
  document.getElementById('modal-detalle-cerrar')
    .addEventListener('click', cerrarModalDetalle);
  modal.addEventListener('click', e => { if (e.target === modal) cerrarModalDetalle(); });
}

function verDetalleVenta(id) {
  const v = ventasMap.get(id);
  if (!v) return;

  const items = (v.productos ?? []).map(item => {
    const nombre   = item.producto?.nombre ?? '(producto eliminado)';
    const unitario = item.precioUnitario ?? 0;
    const subtotal = unitario * (item.cantidad ?? 0);
    return `
      <div class="flex justify-between items-start py-2.5 border-b border-gray-800 last:border-0 gap-4">
        <div>
          <p class="text-white font-semibold text-sm">${esc(nombre)}</p>
          <p class="text-gray-500 text-xs mt-0.5">${formatearPrecio(unitario)} × ${item.cantidad ?? 0}</p>
        </div>
        <span class="text-white font-bold text-sm whitespace-nowrap">${formatearPrecio(subtotal)}</span>
      </div>`;
  }).join('');

  document.getElementById('detalle-venta-contenido').innerHTML = `
    ${items || '<p class="text-gray-500 text-sm py-2">Sin productos registrados.</p>'}
    <div class="flex justify-between items-center pt-3 mt-1 border-t border-gray-700">
      <span class="text-gray-400 font-semibold text-sm">Total</span>
      <span class="text-cyan-400 font-extrabold text-lg">${formatearPrecio(v.total ?? 0)}</span>
    </div>`;

  document.getElementById('modal-detalle-venta').classList.remove('hidden');
}

function cerrarModalDetalle() {
  document.getElementById('modal-detalle-venta').classList.add('hidden');
}

// ═════════════════════════════════════════════════════════════════════════════
//  USUARIOS
// ═════════════════════════════════════════════════════════════════════════════

async function cargarUsuarios() {
  try {
    const usuarios = await api.get('/usuarios');
    usuariosMap.clear();
    usuarios.forEach(u => usuariosMap.set(u._id, u));

    document.getElementById('cuerpo-usuarios').innerHTML =
      usuarios.length ? usuarios.map(filaUsuario).join('') : filaSinDatos(6, 'No hay usuarios registrados.');

    document.getElementById('usuarios-cargando').classList.add('hidden');
    document.getElementById('tabla-usuarios').classList.remove('hidden');
    document.getElementById('contador-usuarios').textContent =
      `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''}`;
  } catch (error) {
    alerta(`Error al cargar usuarios: ${error.message}`, 'error');
  }
}

function filaUsuario(u) {
  const fecha   = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';
  const esAdmin = u.rol === 'admin';

  return `
    <tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
      <td class="py-3 px-5 text-white font-semibold">${esc(u.nombre ?? '—')}</td>
      <td class="py-3 px-4 text-gray-400 text-sm">${esc(u.email ?? '—')}</td>
      <td class="py-3 px-4">
        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                     ${esAdmin ? 'bg-cyan-900/50 text-cyan-400' : 'bg-gray-700/50 text-gray-400'}">
          ${u.rol ?? '—'}
        </span>
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                     ${u.activo ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}">
          ${u.activo ? 'Sí' : 'No'}
        </span>
      </td>
      <td class="py-3 px-4 text-gray-500 text-sm whitespace-nowrap">${fecha}</td>
      <td class="py-3 px-5">
        <div class="flex justify-end">
          <button data-action="eliminar-usuario" data-id="${u._id}"
                  class="text-xs font-semibold text-red-400 hover:text-red-300
                         px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-400/60
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Eliminar
          </button>
        </div>
      </td>
    </tr>`;
}

function initEventosUsuarios() {
  document.getElementById('cuerpo-usuarios').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled) return;
    const { action, id } = btn.dataset;
    btn.disabled = true;
    try {
      if (action === 'eliminar-usuario') await eliminarUsuario(id);
    } finally {
      btn.disabled = false;
    }
  });
}

async function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
  try {
    await api.del(`/usuarios/${id}`);
    alerta('Usuario eliminado.', 'exito');
    await cargarUsuarios();
  } catch (error) {
    alerta(error.message ?? 'Error al eliminar el usuario.',
           error.status === 409 ? 'advertencia' : 'error');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function resolverImagen(imagen) {
  if (!imagen) return PLACEHOLDER;
  if (imagen.startsWith('http') || imagen.startsWith('/')) return imagen;
  return `img/productos/${imagen}`;
}

// Evita XSS en datos del backend inyectados en innerHTML
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filaSinDatos(cols, mensaje) {
  return `
    <tr>
      <td colspan="${cols}" class="py-16 text-center text-gray-500 text-sm">${mensaje}</td>
    </tr>`;
}

// ═════════════════════════════════════════════════════════════════════════════
//  INIT
// ═════════════════════════════════════════════════════════════════════════════

async function init() {
  await cargarNavbar();
  actualizarBadgeCarrito();

  initTabs();
  initModalProducto();
  initModalDetalle();
  initEventosProductos();
  initEventosVentas();
  initEventosUsuarios();

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    cerrarModalProducto();
    cerrarModalDetalle();
  });

  await Promise.all([cargarProductos(), cargarVentas(), cargarUsuarios()]);
}
