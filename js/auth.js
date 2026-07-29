import { api } from './api.js';

// undefined = sin chequear, null = sin sesión, objeto = usuario logueado
let usuarioCache = undefined;

// Mientras obtenerUsuario() está corriendo, el 401 es esperado (visitante en página pública).
// Este flag evita que el listener de 'sesion-expirada' redirija en ese caso.
let verificandoSesion = false;

export async function obtenerUsuario() {
  if (usuarioCache !== undefined) return usuarioCache;

  verificandoSesion = true;
  try {
    usuarioCache = await api.get('/usuarios/perfil');
    return usuarioCache;
  } catch (error) {
    if (error.status === 401) {
      usuarioCache = null;
      return null;
    }
    throw error;
  } finally {
    verificandoSesion = false;
  }
}

export async function estaLogueado() {
  return (await obtenerUsuario()) !== null;
}

export async function esAdmin() {
  const usuario = await obtenerUsuario();
  return usuario?.rol === 'admin';
}

export async function requiereLogin() {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'login.html';
    return null;
  }
  return usuario;
}

export async function requiereAdmin() {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'login.html';
    return null;
  }
  if (usuario.rol !== 'admin') {
    alert('Acceso denegado: no tenés permisos para ver esta página.');
    window.location.href = 'index.html';
    return null;
  }
  return usuario;
}

export async function cerrarSesion() {
  try {
    await api.post('/usuarios/logout');
  } finally {
    usuarioCache = undefined;
    window.location.href = 'index.html';
  }
}

window.addEventListener('sesion-expirada', () => {
  if (verificandoSesion) return;
  alert('Tu sesión expiró. Por favor, volvé a iniciar sesión.');
  window.location.href = 'login.html';
});
