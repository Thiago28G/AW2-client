import { mostrarAlerta } from './utils.js';
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('form-registro');
  const inputEmail = document.getElementById('email');
  const errorMsg   = document.getElementById('error-registro');
  const btn        = document.getElementById('btn-registro');

  function mostrarErrorEmail(mensaje) {
    errorMsg.textContent = mensaje;
    inputEmail.classList.replace('border-gray-700', 'border-red-500');
  }

  function limpiarErrorEmail() {
    errorMsg.textContent = '';
    inputEmail.classList.replace('border-red-500', 'border-gray-700');
  }

  inputEmail.addEventListener('input', limpiarErrorEmail);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarErrorEmail();

    btn.disabled    = true;
    btn.textContent = 'Creando cuenta...';

    const body = {
      nombre:   document.getElementById('nombre').value.trim(),
      email:    inputEmail.value.trim(),
      password: document.getElementById('password').value,
    };

    try {
      await api.post('/usuarios/registro', body);
      mostrarAlerta('¡Cuenta creada! Ya podés iniciar sesión.', 'exito');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (error) {
      if (error.status === 409) {
        mostrarErrorEmail(error.message ?? 'Ya existe una cuenta con ese email.');
      } else {
        mostrarAlerta(error.message ?? 'No se pudo crear la cuenta.', 'error');
      }
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Crear cuenta';
    }
  });
});
