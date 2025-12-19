// Utilidades
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast show ${type}`
  setTimeout(() => {
    toast.className = "toast"
  }, 3000)
}

// Cargar usuarios desde el archivo JSON
async function loadUsers() {
  try {
    const response = await fetch("data/usuarios.json")
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.usuarios || []
  } catch (error) {
    return []
  }
}

// Guardar usuarios en localStorage (simulación de guardado en JSON)
function saveUsers(users) {
  localStorage.setItem("usuarios", JSON.stringify(users))
}

// Toggle password visibility
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".password-toggle")

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const input = this.previousElementSibling
      if (input.type === "password") {
        input.type = "text"
        this.innerHTML = `
                    <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `
      } else {
        input.type = "password"
        this.innerHTML = `
                    <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `
      }
    })
  })

  // Login Form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      const users = JSON.parse(localStorage.getItem("usuarios") || "[]")
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        showToast("Inicio de sesión exitoso", "success")
        setTimeout(() => {
          window.location.href = "perfil.html"
        }, 1500)
      } else {
        showToast("Credenciales incorrectas", "error")
      }
    })
  }

  // Registro Form
  const registroForm = document.getElementById("registroForm")
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const nombre = document.getElementById("nombre").value
      const apellido = document.getElementById("apellido").value
      const email = document.getElementById("email").value
      const telefono = document.getElementById("telefono").value
      const direccion = document.getElementById("direccion").value
      const password = document.getElementById("password").value
      const confirmPassword = document.getElementById("confirmPassword").value

      if (password !== confirmPassword) {
        showToast("Las contraseñas no coinciden", "error")
        return
      }

      const users = JSON.parse(localStorage.getItem("usuarios") || "[]")

      if (users.find((u) => u.email === email)) {
        showToast("El correo ya está registrado", "error")
        return
      }

      const newUser = {
        id: Date.now(),
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        password,
        fechaRegistro: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("usuarios", JSON.stringify(users))

      showToast("Registro exitoso. Redirigiendo...", "success")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1500)
    })
  }
})
