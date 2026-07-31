const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// En desarrollo usamos el MISMO hostname desde el que sirve Live Server (localhost o 127.0.0.1).
// NO hardcodear 'localhost' aquí: si la página se abre en 127.0.0.1:5500 y la API apunta a
// localhost:3000, el navegador los trata como orígenes distintos y bloquea la cookie httpOnly
// (sameSite: 'lax' no viaja en requests cross-site). El origen debe coincidir en ambos lados.
//
// En producción la URL es relativa ('/api') en vez de apuntar directo a Render. El back-end
// (techstore-api-326a.onrender.com) y el front (aw-2-client.vercel.app) son dominios distintos,
// así que la cookie httpOnly del JWT sería de terceros y Safari, Brave y Firefox la bloquean o
// la aíslan por defecto. vercel.json reenvía /api/* a Render por detrás, de modo que para el
// navegador la cookie queda seteada en el propio origen del front y ningún navegador la bloquea.
export const BASE_URL = esLocal
  ? `http://${window.location.hostname}:3000/api`
  : '/api';
