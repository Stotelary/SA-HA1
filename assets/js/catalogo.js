// ===========================
// CATALOG PAGE JAVASCRIPT
// ===========================

;(() => {
  let allServices = []
  let filteredServices = []
  let currentPage = 1
  const servicesPerPage = 9

  // ===========================
  // LOAD SERVICES FROM JSON
  // ===========================
  async function loadServices() {
    try {
      const response = await fetch("data/servicios.json")
      allServices = await response.json()
      filteredServices = [...allServices]
      renderServices()
      updateResultsCount()
    } catch (error) {
      showError("Error al cargar los servicios. Por favor, intenta de nuevo más tarde.")
    }
  }

  // ===========================
  // RENDER SERVICES
  // ===========================
  function renderServices() {
    const grid = document.getElementById("servicesGrid")
    const startIndex = (currentPage - 1) * servicesPerPage
    const endIndex = startIndex + servicesPerPage
    const servicesToShow = filteredServices.slice(startIndex, endIndex)

    if (servicesToShow.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <svg class="no-results__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3 class="no-results__title">No se encontraron servicios</h3>
          <p class="no-results__text">Intenta ajustar los filtros para ver más resultados</p>
        </div>
      `
      document.getElementById("pagination").innerHTML = ""
      return
    }

    grid.innerHTML = servicesToShow
      .map(
        (service) => `
      <div class="catalog-service-card">
        <img src="${service.image}" alt="${service.name}" class="catalog-service-card__image">
        <div class="catalog-service-card__content">
          <div class="catalog-service-card__header">
            <span class="catalog-service-card__category">${getCategoryName(service.category)}</span>
            <div class="catalog-service-card__rating">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              ${service.rating}
            </div>
          </div>
          <h3 class="catalog-service-card__title">${service.name}</h3>
          <p class="catalog-service-card__description">${service.description}</p>
          <div class="catalog-service-card__footer">
            <span class="catalog-service-card__price">Desde $${service.price.toLocaleString("es-CL")}</span>
            <span class="catalog-service-card__type">${getTypeName(service.type)}</span>
          </div>
          <a href="servicio.html" class="btn btn--outline btn--full catalog-service-card__button">
            Ver Detalles
            <span class="btn__arrow">→</span>
          </a>
        </div>
      </div>
    `,
      )
      .join("")

    renderPagination()
  }

  // ===========================
  // PAGINATION
  // ===========================
  function renderPagination() {
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage)
    const pagination = document.getElementById("pagination")

    if (totalPages <= 1) {
      pagination.innerHTML = ""
      return
    }

    let paginationHTML = `
      <button class="pagination__button" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">
        ←
      </button>
    `

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationHTML += `
          <button class="pagination__button ${i === currentPage ? "active" : ""}" data-page="${i}">
            ${i}
          </button>
        `
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += `<span class="pagination__ellipsis">...</span>`
      }
    }

    paginationHTML += `
      <button class="pagination__button" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">
        →
      </button>
    `

    pagination.innerHTML = paginationHTML

    // Add event listeners
    pagination.querySelectorAll(".pagination__button").forEach((button) => {
      button.addEventListener("click", () => {
        const page = Number.parseInt(button.dataset.page)
        if (page && page !== currentPage) {
          currentPage = page
          renderServices()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
    })
  }

  // ===========================
  // FILTERS
  // ===========================
  function applyFilters() {
    const searchTerm = document.getElementById("searchFilter").value.toLowerCase()
    const category = document.getElementById("categoryFilter").value
    const priceRange = Number.parseInt(document.getElementById("priceRange").value)
    const rating = Number.parseFloat(document.getElementById("ratingFilter").value)

    const typeCheckboxes = document.querySelectorAll(".type-filter:checked")
    const selectedTypes = Array.from(typeCheckboxes).map((cb) => cb.value)

    filteredServices = allServices.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm) || service.description.toLowerCase().includes(searchTerm)
      const matchesCategory = !category || service.category === category
      const matchesPrice = service.price <= priceRange
      const matchesRating = service.rating >= rating
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(service.type)

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesType
    })

    currentPage = 1
    renderServices()
    updateResultsCount()
  }

  // ===========================
  // SORTING
  // ===========================
  function sortServices() {
    const sortBy = document.getElementById("sortSelect").value

    switch (sortBy) {
      case "price-asc":
        filteredServices.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredServices.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredServices.sort((a, b) => b.rating - a.rating)
        break
      case "name":
        filteredServices.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        filteredServices = [...allServices]
        applyFilters()
        return
    }

    renderServices()
  }

  // ===========================
  // HELPER FUNCTIONS
  // ===========================
  function updateResultsCount() {
    document.getElementById("resultsCount").textContent = filteredServices.length
  }

  function getCategoryName(category) {
    const categories = {
      hogar: "Hogar",
      tecnologia: "Tecnología",
      educacion: "Educación",
      entretenimiento: "Entretenimiento",
      salud: "Salud y Bienestar",
      creatividad: "Creatividad",
    }
    return categories[category] || category
  }

  function getTypeName(type) {
    const types = {
      online: "Online",
      presencial: "Presencial",
      ambos: "Online/Presencial",
    }
    return types[type] || type
  }

  function showError(message) {
    const grid = document.getElementById("servicesGrid")
    grid.innerHTML = `
      <div class="no-results">
        <h3 class="no-results__title">Error</h3>
        <p class="no-results__text">${message}</p>
      </div>
    `
  }

  // ===========================
  // PRICE RANGE DISPLAY
  // ===========================
  function updatePriceDisplay() {
    const priceRange = document.getElementById("priceRange")
    const priceValue = document.getElementById("priceValue")

    priceRange.addEventListener("input", (e) => {
      const value = Number.parseInt(e.target.value)
      priceValue.textContent = value >= 100000 ? "$100.000+" : `$${value.toLocaleString("es-CL")}`
    })
  }

  // ===========================
  // EVENT LISTENERS
  // ===========================
  function initEventListeners() {
    // Search filter
    document.getElementById("searchFilter").addEventListener("input", applyFilters)

    // Category filter
    document.getElementById("categoryFilter").addEventListener("change", applyFilters)

    // Type checkboxes
    document.querySelectorAll(".type-filter").forEach((checkbox) => {
      checkbox.addEventListener("change", applyFilters)
    })

    // Price range
    document.getElementById("priceRange").addEventListener("change", applyFilters)

    // Rating filter
    document.getElementById("ratingFilter").addEventListener("change", applyFilters)

    // Sort
    document.getElementById("sortSelect").addEventListener("change", sortServices)

    // Clear filters
    document.getElementById("clearFilters").addEventListener("click", () => {
      document.getElementById("searchFilter").value = ""
      document.getElementById("categoryFilter").value = ""
      document.getElementById("priceRange").value = 100000
      document.getElementById("priceValue").textContent = "$100.000+"
      document.getElementById("ratingFilter").value = "0"
      document.getElementById("sortSelect").value = "relevance"
      document.querySelectorAll(".type-filter").forEach((cb) => (cb.checked = false))

      filteredServices = [...allServices]
      currentPage = 1
      renderServices()
      updateResultsCount()
    })
  }

  // ===========================
  // INITIALIZE
  // ===========================
  function init() {
    updatePriceDisplay()
    initEventListeners()
    loadServices()
  }

  // Start the app
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
