import { BASE_URL, guardarSesion, mostrarAlerta } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email      = document.getElementById('email').value.trim();
    const contraseña = document.getElementById('contrasena').value;
    const btn        = document.getElementById('btn-login');

    btn.disabled    = true;
    btn.textContent = 'Ingresando...';

    try {
      const res = await fetch(`${BASE_URL}/usuarios/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, contraseña }),
      });

      if (res.ok) {
        const data = await res.json();
        guardarSesion(data.usuario);

        const params = new URLSearchParams(window.location.search);
        window.location.href = params.get('next') || 'index.html';
      } else {
        const data = await res.json().catch(() => ({}));
        mostrarAlerta(data.mensaje ?? 'Email o contraseña incorrectos.', 'error');
      }
    } catch {
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Iniciar sesión';
    }
  });
});
