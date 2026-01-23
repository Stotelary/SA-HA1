// ===========================
// CATALOG PAGE JAVASCRIPT
// ===========================
// Campos de servicio en BD: id_servicio, id_usuario, nombre, descripcion, precio, modalidad (1=presencial, 2=online, 3=ambos), fecha_creacion

const ServiciosAPI = window.ServiciosAPI;
const ServicioImagenAPI = window.ServicioImagenAPI;

const ResenasAPI = window.ResenasAPI || {
  getByServicio: async () => [],
  calcularPromedio: () => 0
};
console.log("catalogo.js cargado ✅");
;(() => {
  let allServices = [];
  let filteredServices = [];
  let currentPage = 1;
  const servicesPerPage = 9;

  // ===========================
  // LOAD SERVICES FROM API
  // ===========================
  async function loadServices() {
    console.log("loadServices() corriendo ✅");

    try {
      // Intentar cargar desde el backend
      const serviciosBackend = await ServiciosAPI.getAll();
      console.log("serviciosBackend:", serviciosBackend);

      
      // Mapear campos del backend a los esperados por el frontend
      allServices = await Promise.all(serviciosBackend.map(async (service) => {
        // Obtener imagen del servicio
        let imagenUrl = 'assets/img/placeholder-service.jpg';
        try {
          const imagenes = await ServicioImagenAPI.getByServicio(service.id_servicio);
          if (Array.isArray(imagenes) && imagenes.length > 0) {
            imagenes.sort((a, b) => a.orden - b.orden);
            imagenUrl = imagenes[0].imagen_url;
          }
        } catch (e) {}

        // Obtener calificación promedio
        let rating = 4.5;
        try {
          const resenas = await ResenasAPI.getByServicio(service.id_servicio);
          if (Array.isArray(resenas) && resenas.length > 0) {
            rating = parseFloat(ResenasAPI.calcularPromedio(resenas));
          }
        } catch (e) {}

        return {
          id: service.id_servicio,
          name: service.nombre,
          description: service.descripcion,
          price: parseFloat(service.precio),
          // Modalidad: 1=presencial, 2=online, 3=ambos
          type: getTypeFromModalidad(service.modalidad),
          modalidad: service.modalidad,
          rating: rating,
          image: imagenUrl,
          id_usuario: service.id_usuario
        };
      }));

      filteredServices = [...allServices];
      renderServices();
      updateResultsCount();
    } catch (error) {
  console.error("Error cargando servicios desde backend:", error);
  showError("No se pudieron cargar servicios desde el backend. Revisa Network → /api/servicios");
  // si quieres fallback, déjalo pero con log:
  // await loadServicesFromLocal();
}
  }

  // Convertir modalidad numérica a texto
  function getTypeFromModalidad(modalidad) {
    switch (parseInt(modalidad)) {
      case 1: return 'presencial';
      case 2: return 'online';
      case 3: return 'ambos';
      default: return 'online';
    }
  }

  // Cargar servicios desde archivo local (fallback)
  async function loadServicesFromLocal() {
    try {
      const response = await fetch('data/servicios.json');
      const serviciosLocal = await response.json();
      
      allServices = serviciosLocal.map(service => ({
        id: service.id || service.id_servicio,
        name: service.nombre || service.name,
        description: service.descripcion || service.description,
        price: parseFloat(service.precio || service.price),
        type: service.tipo || service.type || getTypeFromModalidad(service.modalidad),
        category: service.categoria || service.category,
        rating: service.calificacion || service.rating || 4.5,
        image: service.imagen || service.image || 'assets/img/placeholder-service.jpg'
      }));

      filteredServices = [...allServices];
      renderServices();
      updateResultsCount();
    } catch (error) {
      showError('Error al cargar los servicios. Por favor, intenta de nuevo más tarde.');
    }
  }

  // ===========================
  // RENDER SERVICES
  // ===========================
  function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    const servicesToShow = filteredServices.slice(startIndex, endIndex);

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
      `;
      const pagination = document.getElementById('pagination');
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = servicesToShow.map(service => `
      <div class="catalog-service-card">
        <img src="${service.image}" alt="${service.name}" class="catalog-service-card__image" onerror="this.src='assets/img/placeholder-service.jpg'">
        <div class="catalog-service-card__content">
          <div class="catalog-service-card__header">
            <span class="catalog-service-card__category">${getTypeName(service.type)}</span>
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
            <span class="catalog-service-card__price">${ServiciosAPI.formatPrecio(service.price)}</span>
            <span class="catalog-service-card__type">${getTypeName(service.type)}</span>
          </div>
          <a href="servicio.html?id=${service.id}" class="btn btn--outline btn--full catalog-service-card__button">
            Ver Detalles
            <span class="btn__arrow">→</span>
          </a>
        </div>
      </div>
    `).join('');

    renderPagination();
  }

  // ===========================
  // PAGINATION
  // ===========================
  function renderPagination() {
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = `
      <button class="pagination__button" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        ←
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationHTML += `
          <button class="pagination__button ${i === currentPage ? 'active' : ''}" data-page="${i}">
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += `<span class="pagination__ellipsis">...</span>`;
      }
    }

    paginationHTML += `
      <button class="pagination__button" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
        →
      </button>
    `;

    pagination.innerHTML = paginationHTML;

    pagination.querySelectorAll('.pagination__button').forEach(button => {
      button.addEventListener('click', () => {
        const page = parseInt(button.dataset.page);
        if (page && page !== currentPage) {
          currentPage = page;
          renderServices();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ===========================
  // FILTERS
  // ===========================
  function applyFilters() {
    const searchEl = document.getElementById('searchFilter');
    const categoryEl = document.getElementById('categoryFilter');
    const priceRangeEl = document.getElementById('priceRange');
    const ratingEl = document.getElementById('ratingFilter');

    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    const category = categoryEl ? categoryEl.value : '';
    const priceRange = priceRangeEl ? parseInt(priceRangeEl.value) : 100000;
    const rating = ratingEl ? parseFloat(ratingEl.value) : 0;

    const typeCheckboxes = document.querySelectorAll('.type-filter:checked');
    const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);

    filteredServices = allServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm) || 
                           service.description.toLowerCase().includes(searchTerm);
      const matchesCategory = !category || service.category === category;
      const matchesPrice = service.price <= priceRange;
      const matchesRating = service.rating >= rating;
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(service.type);

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesType;
    });

    currentPage = 1;
    renderServices();
    updateResultsCount();
  }

  // ===========================
  // SORTING
  // ===========================
  function sortServices() {
    const sortEl = document.getElementById('sortSelect');
    const sortBy = sortEl ? sortEl.value : 'relevance';

    switch (sortBy) {
      case 'price-asc':
        filteredServices.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredServices.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredServices.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filteredServices.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filteredServices = [...allServices];
        applyFilters();
        return;
    }

    renderServices();
  }

  // ===========================
  // HELPER FUNCTIONS
  // ===========================
  function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
      resultsCount.textContent = filteredServices.length;
    }
  }

  function getTypeName(type) {
    const types = {
      'online': 'Online',
      'presencial': 'Presencial',
      'ambos': 'Online/Presencial'
    };
    return types[type] || type || 'Online';
  }

  function showError(message) {
    const grid = document.getElementById('servicesGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="no-results">
          <h3 class="no-results__title">Error</h3>
          <p class="no-results__text">${message}</p>
        </div>
      `;
    }
  }

  // ===========================
  // PRICE RANGE DISPLAY
  // ===========================
  function updatePriceDisplay() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    if (priceRange && priceValue) {
      priceRange.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        priceValue.textContent = value >= 100000 ? '$100.000+' : `$${value.toLocaleString('es-CL')}`;
      });
    }
  }

  // ===========================
  // EVENT LISTENERS
  // ===========================
  function initEventListeners() {
    const searchFilter = document.getElementById('searchFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceRange = document.getElementById('priceRange');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortSelect = document.getElementById('sortSelect');
    const clearFilters = document.getElementById('clearFilters');

    if (searchFilter) searchFilter.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceRange) priceRange.addEventListener('change', applyFilters);
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', sortServices);

    document.querySelectorAll('.type-filter').forEach(checkbox => {
      checkbox.addEventListener('change', applyFilters);
    });

    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        if (searchFilter) searchFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (priceRange) priceRange.value = 100000;
        const priceValue = document.getElementById('priceValue');
        if (priceValue) priceValue.textContent = '$100.000+';
        if (ratingFilter) ratingFilter.value = '0';
        if (sortSelect) sortSelect.value = 'relevance';
        document.querySelectorAll('.type-filter').forEach(cb => cb.checked = false);

        filteredServices = [...allServices];
        currentPage = 1;
        renderServices();
        updateResultsCount();
      });
    }
  }

  // ===========================
  // INITIALIZE
  // ===========================
  function init() {
    console.log("init() corriendo ✅");
    updatePriceDisplay();
    initEventListeners();
    loadServices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
