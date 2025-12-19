// Verificar autenticación
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return null
  }
  return currentUser
}

// Mostrar toast
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast show ${type}`
  setTimeout(() => {
    toast.className = "toast"
  }, 3000)
}

// Obtener parámetros de URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

// Cargar información del servicio
async function loadServiceInfo() {
  const servicioId = getUrlParameter("servicio")
  if (!servicioId) {
    window.location.href = "perfil.html"
    return
  }

  try {
    const response = await fetch("data/servicios-contratados.json")
    const data = await response.json()
    const servicio = data.serviciosContratados.find((s) => s.id == servicioId)

    if (servicio) {
      document.getElementById("serviceImage").src = servicio.imagen
      document.getElementById("serviceName").textContent = servicio.nombre
      document.getElementById("serviceDate").textContent = `Realizado el ${servicio.fecha}`
    }
  } catch (error) {
    console.error("Error cargando información del servicio:", error)
  }
}

// Actualizar texto de calificación
function updateRatingText() {
  const ratingInputs = document.querySelectorAll('input[name="rating"]')
  const ratingText = document.getElementById("ratingText")

  const ratingLabels = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  }

  ratingInputs.forEach((input) => {
    input.addEventListener("change", function () {
      ratingText.textContent = ratingLabels[this.value]
    })
  })
}

// Guardar reseña
async function saveReview(reviewData) {
  try {
    const reviews = JSON.parse(localStorage.getItem("resenas") || "[]")
    reviews.push(reviewData)
    localStorage.setItem("resenas", JSON.stringify(reviews))

    const serviciosResponse = await fetch("data/servicios-contratados.json")
    const serviciosData = await serviciosResponse.json()
    const servicioIndex = serviciosData.serviciosContratados.findIndex((s) => s.id == reviewData.servicioId)

    if (servicioIndex !== -1) {
      serviciosData.serviciosContratados[servicioIndex].resenaAgregada = true
      localStorage.setItem("serviciosContratados", JSON.stringify(serviciosData.serviciosContratados))
    }

    return true
  } catch (error) {
    console.error("Error guardando reseña:", error)
    return false
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  loadServiceInfo()
  updateRatingText()

  const reviewForm = document.getElementById("reviewForm")
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const user = JSON.parse(localStorage.getItem("currentUser"))
      const servicioId = getUrlParameter("servicio")
      const rating = document.querySelector('input[name="rating"]:checked')
      const reviewText = document.getElementById("reviewText").value
      const recommend = document.getElementById("recommend").checked

      if (!rating) {
        showToast("Por favor selecciona una calificación", "error")
        return
      }

      if (reviewText.length < 20) {
        showToast("La reseña debe tener al menos 20 caracteres", "error")
        return
      }

      const reviewData = {
        id: Date.now(),
        servicioId: servicioId,
        usuarioId: user.id,
        usuarioNombre: `${user.nombre} ${user.apellido}`,
        usuarioEmail: user.email,
        calificacion: Number.parseInt(rating.value),
        texto: reviewText,
        recomienda: recommend,
        fecha: new Date().toISOString(),
      }

      const success = await saveReview(reviewData)

      if (success) {
        showToast("Reseña publicada exitosamente", "success")
        setTimeout(() => {
          window.location.href = "perfil.html"
        }, 1500)
      } else {
        showToast("Error al publicar la reseña", "error")
      }
    })
  }
})
