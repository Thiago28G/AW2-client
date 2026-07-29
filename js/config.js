const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// En desarrollo usamos el MISMO hostname desde el que sirve Live Server (localhost o 127.0.0.1).
// NO hardcodear 'localhost' aquí: si la página se abre en 127.0.0.1:5500 y la API apunta a
// localhost:3000, el navegador los trata como orígenes distintos y bloquea la cookie httpOnly
// (sameSite: 'lax' no viaja en requests cross-site). El origen debe coincidir en ambos lados.
// Reemplazá TU-BACKEND con el nombre de tu servicio en Render antes de hacer el deploy.
export const BASE_URL = esLocal
  ? `http://${window.location.hostname}:3000/api`
  : 'https://techstore-api-326a.onrender.com/api';
