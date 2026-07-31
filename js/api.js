import { BASE_URL } from './config.js';

async function request(endpoint, opciones = {}) {
  const config = {
    credentials: 'include',
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers,
    },
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (err) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    res = await fetch(`${BASE_URL}${endpoint}`, config);
  }

  const datos = await res.json();

  if (!res.ok) {
    // Los endpoints de auth devuelven 401 por credenciales incorrectas, no por sesión vencida.
    // Disparar 'sesion-expirada' ahí causaría un redirect a login.html desde la propia página de login.
    const esEndpointAuth = endpoint === '/usuarios/login' || endpoint === '/usuarios/registro';
    if (res.status === 401 && !esEndpointAuth) {
      window.dispatchEvent(new CustomEvent('sesion-expirada'));
    }
    const error = new Error(datos.mensaje ?? 'Error en la solicitud');
    error.status = res.status;
    error.detalle = datos.detalle;
    throw error;
  }

  return datos;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, datos) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(datos) }),
  put: (endpoint, datos) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(datos) }),
  del: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
