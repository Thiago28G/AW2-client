import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form          = document.getElementById('form-login');
  const inputEmail    = document.getElementById('email');
  const inputPassword = document.getElementById('password');
  const errorMsg      = document.getElementById('error-login');
  const btn           = document.getElementById('btn-login');

  function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    inputEmail.classList.replace('border-gray-700', 'border-red-500');
    inputPassword.classList.replace('border-gray-700', 'border-red-500');
  }

  function limpiarError() {
    errorMsg.textContent = '';
    inputEmail.classList.replace('border-red-500', 'border-gray-700');
    inputPassword.classList.replace('border-red-500', 'border-gray-700');
  }

  inputEmail.addEventListener('input', limpiarError);
  inputPassword.addEventListener('input', limpiarError);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarError();

    btn.disabled    = true;
    btn.textContent = 'Ingresando...';

    try {
      await api.post('/usuarios/login', {
        email:    inputEmail.value.trim(),
        password: inputPassword.value,
      });

      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('next') || 'index.html';
    } catch (error) {
      mostrarError(error.message ?? 'Email o contraseña incorrectos.');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Iniciar sesión';
    }
  });
});
