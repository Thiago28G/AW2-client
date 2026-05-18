import {
  BASE_URL,
  actualizarBadgeCarrito,
  cargarNavbar,
  mostrarAlerta,
  buildCard,
  onAgregar,
  estadoCargando,
  estadoError,
} from './utils.js';

cargarNavbar();
actualizarBadgeCarrito();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-filtrado').addEventListener('submit', manejarFiltro);
});

async function manejarFiltro(evento) {
  evento.preventDefault();

  const form      = evento.target;
  const categoria = form.categoria.value.trim();
  const minRaw    = form.precioMin.value.trim();
  const maxRaw    = form.precioMax.value.trim();

  const body = {};
  if (categoria)     body.categoria = categoria;
  if (minRaw !== '') body.precioMin = Number(minRaw);
  if (maxRaw !== '') body.precioMax = Number(maxRaw);

  const contenedor = document.getElementById('resultados-filtrado');
  const btnFiltrar = document.getElementById('btn-filtrar');

  contenedor.innerHTML = estadoCargando();
  btnFiltrar.disabled  = true;

  try {
    const respuesta = await fetch(`${BASE_URL}/productos/filtrar`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);

    const productos = await respuesta.json();

    if (!productos.length) {
      contenedor.innerHTML = estadoSinResultados();
      return;
    }

    contenedor.innerHTML = productos.map(buildCard).join('');

  } catch (error) {
    contenedor.innerHTML = estadoError();
    mostrarAlerta(`No se pudo aplicar el filtro. ${error.message}`, 'error');
  } finally {
    btnFiltrar.disabled = false;
  }
}

function estadoSinResultados() {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-24 gap-3 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-400 font-medium">No se encontraron productos con esos filtros.</p>
      <p class="text-gray-600 text-sm">Probá con una categoría diferente o un rango de precio más amplio.</p>
    </div>
  `;
}

window.onAgregar = onAgregar;
