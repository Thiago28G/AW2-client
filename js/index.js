import {
  actualizarBadgeCarrito,
  cargarNavbar,
  mostrarAlerta,
  buildCard,
  onAgregar,
  estadoCargando,
  estadoError,
} from './utils.js';
import { api } from './api.js';

await cargarNavbar();
await actualizarBadgeCarrito();
cargarProductos();

async function cargarProductos() {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = estadoCargando();

  try {
    const productos = await api.get('/productos');

    if (!productos.length) {
      contenedor.innerHTML = estadoVacio();
      return;
    }

    contenedor.innerHTML = productos.map(buildCard).join('');

    const contador = document.getElementById('contador-productos');
    if (contador) contador.textContent = `${productos.length} productos`;

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
