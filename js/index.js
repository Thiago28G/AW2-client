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

document.addEventListener('DOMContentLoaded', cargarProductos);

async function cargarProductos() {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = estadoCargando();

  try {
    const respuesta = await fetch(`${BASE_URL}/productos`);
    if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);

    const productos = await respuesta.json();

    if (!productos.length) {
      contenedor.innerHTML = estadoVacio();
      return;
    }

    contenedor.innerHTML = productos.map(buildCard).join('');

  } catch (error) {
    contenedor.innerHTML = estadoError();
    mostrarAlerta(`No se pudieron cargar los productos. ${error.message}`, 'error');
  }
}

function estadoVacio() {
  return `
    <p class="col-span-full text-center text-gray-500 py-20 text-lg">
      No hay productos disponibles.
    </p>
  `;
}

window.onAgregar = onAgregar;
