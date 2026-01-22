// ===========================
// AUTHENTICATION JAVASCRIPT
// ===========================
// Campos de usuario en BD:
// - id_usuario, nombre, email, direccion, telefono, password_hash, prestador, fecha_registro, rol

// Utilidades
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Toggle password visibility
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.password-toggle');

  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = `
          <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        input.type = 'password';
        this.innerHTML = `
          <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  });

  // ===========================
  // LOGIN FORM
  // ===========================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password_hash = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      console.log(email, password_hash);
      // Deshabilitar botón mientras procesa
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesión...';

      try {
        // Llamada a la API de login
        const response = await UsuariosAPI.login(email, password_hash);
        console.log(response);
        showToast('Inicio de sesión exitoso', 'success');
        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 1500);

      } catch (error) {
        showToast(error.message || 'Credenciales incorrectas', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
      }
    });
  }

  // ===========================
  // REGISTRO FORM
  // ===========================
  const registroForm = document.getElementById('registroForm');
  if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nombre = document.getElementById('nombre').value;
      const apellido = document.getElementById('apellido').value;
      const email = document.getElementById('email').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;
      const password_hash = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const prestador = document.getElementById('prestador')?.checked || false;
      const submitBtn = registroForm.querySelector('button[type="submit"]');

      // Validar contraseñas
      if (password_hash !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
      }

      // Validar longitud de contraseña
      if (password_hash.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      // Deshabilitar botón mientras procesa
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registrando...';

      try {
        // Llamada a la API de registro con campos correctos de la BD
        await window.UsuariosAPI.register({
          nombre: `${nombre} ${apellido}`.trim(),
          email: email,
          telefono: telefono || '',
          direccion: direccion || '',
          password_hash: password_hash,
          prestador: prestador
        });

        showToast('Registro exitoso. Redirigiendo...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);

      } catch (error) {
        showToast(error.message || 'Error al registrar usuario', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Cuenta';
      }
    });
  }
});
