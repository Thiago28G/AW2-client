import { BASE_URL, mostrarAlerta } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btn-registro');
    btn.disabled    = true;
    btn.textContent = 'Creando cuenta...';

    const body = {
      nombre:     document.getElementById('nombre').value.trim(),
      apellido:   document.getElementById('apellido').value.trim(),
      email:      document.getElementById('email').value.trim(),
      contraseña: document.getElementById('contrasena').value,
      telefono:   document.getElementById('telefono').value.trim(),
      edad:       Number(document.getElementById('edad').value),
    };

    try {
      const res = await fetch(`${BASE_URL}/usuarios`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (res.status === 201) {
        mostrarAlerta('¡Cuenta creada! Ya podés iniciar sesión.', 'exito');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        mostrarAlerta(data.mensaje ?? 'No se pudo crear la cuenta.', 'error');
      }
    } catch {
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Crear cuenta';
    }
  });
});
