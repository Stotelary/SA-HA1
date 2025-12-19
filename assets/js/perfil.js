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

// Cargar datos del usuario
function loadUserData() {
  const user = checkAuth()
  if (!user) return

  document.getElementById("userName").textContent = `${user.nombre} ${user.apellido}`
  document.getElementById("userEmail").textContent = user.email
  document.getElementById("userFullName").textContent = `${user.nombre} ${user.apellido}`
  document.getElementById("userEmailDetail").textContent = user.email
  document.getElementById("userPhone").textContent = user.telefono
  document.getElementById("userAddress").textContent = user.direccion
}

// Cargar servicios contratados
async function loadServices() {
  try {
    const response = await fetch("data/servicios-contratados.json")
    const data = await response.json()

    const completedList = document.getElementById("completedServicesList")
    const upcomingList = document.getElementById("upcomingServicesList")

    const completedServices = data.serviciosContratados.filter((s) => s.estado === "completado")
    const upcomingServices = data.serviciosContratados.filter((s) => s.estado === "proximo")

    document.getElementById("totalServices").textContent = completedServices.length + upcomingServices.length

    if (completedServices.length === 0) {
      completedList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>No hay servicios completados</h3>
                    <p>Cuando contrates servicios, aparecerán aquí</p>
                    <a href="catalogo.html" class="btn btn--primary">Explorar Servicios</a>
                </div>
            `
    } else {
      completedList.innerHTML = completedServices.map((service) => createServiceCard(service, true)).join("")
    }

    if (upcomingServices.length === 0) {
      upcomingList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <h3>No hay servicios próximos</h3>
                    <p>Agenda un nuevo servicio para verlo aquí</p>
                    <a href="catalogo.html" class="btn btn--primary">Explorar Servicios</a>
                </div>
            `
    } else {
      upcomingList.innerHTML = upcomingServices.map((service) => createServiceCard(service, false)).join("")
    }

    const reviewCount = completedServices.filter((s) => s.resenaAgregada).length
    document.getElementById("totalReviews").textContent = reviewCount
  } catch (error) {
    console.error("Error cargando servicios:", error)
  }
}

// Crear tarjeta de servicio
function createServiceCard(service, showReviewButton) {
  const statusClass = service.estado === "completado" ? "completed" : "upcoming"
  const statusText = service.estado === "completado" ? "Completado" : "Próximo"

  const reviewButton =
    showReviewButton && !service.resenaAgregada
      ? `<a href="resena.html?servicio=${service.id}" class="btn-small btn-review">Agregar Reseña</a>`
      : ""

  return `
        <div class="service-card">
            <img src="${service.imagen}" alt="${service.nombre}" class="service-image">
            <div class="service-details">
                <div class="service-header">
                    <h3 class="service-title">${service.nombre}</h3>
                    <span class="service-status ${statusClass}">${statusText}</span>
                </div>
                <div class="service-meta">
                    <span class="service-date">📅 ${service.fecha}</span>
                    <span class="service-price">💰 ${service.precio}</span>
                </div>
                <p class="service-description">${service.descripcion}</p>
                <div class="service-actions">
                    ${reviewButton}
                    <a href="servicio.html?id=${service.servicioId}" class="btn-small btn-details">Ver Detalles</a>
                </div>
            </div>
        </div>
    `
}

// Tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab")

      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      button.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

// Logout
document.addEventListener("DOMContentLoaded", () => {
  loadUserData()
  loadServices()
  setupTabs()

  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      showToast("Sesión cerrada", "success")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    })
  }
})
