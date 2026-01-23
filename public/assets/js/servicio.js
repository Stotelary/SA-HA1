// ===========================
// SERVICE PAGE JAVASCRIPT
// ===========================
// Campos de servicio en BD: id_servicio, id_usuario, nombre, descripcion, precio, modalidad (1,2,3), fecha_creacion
// Campos de contratacion en BD: id_contratacion, id_usuario, id_servicio, fecha, descripcion, estado

;(() => {
  // Obtener ID del servicio de la URL


  
  function getServiceId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  function resolveImageUrl(url) {
  if (!url) return "assets/img/placeholder-service.jpg";

  // Si ya es absoluta, la devolvemos tal cual
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Si es relativa, la armamos con el backend (API_CONFIG.BASE_URL)
  const base = window.API_CONFIG?.BASE_URL || "";
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${base}${clean}`;
}

  // ===========================
  // CARGAR DATOS DEL SERVICIO
  // ===========================
  const ServiciosAPI = window.ServiciosAPI;
  const ServicioImagenAPI = window.ServicioImagenAPI;
  const ServicioDisponibilidadAPI = window.ServicioDisponibilidadAPI;
  const ResenasAPI = window.ResenasAPI;
  const ContratacionesAPI = window.ContratacionesAPI;
  const getCurrentUser = window.getCurrentUser;

  // Si falta algo, lo avisamos en consola (y evitamos crashear)
  const missing = [];
  if (!ServiciosAPI) missing.push("ServiciosAPI");
  if (!ServicioImagenAPI) missing.push("ServicioImagenAPI");
  if (!ServicioDisponibilidadAPI) missing.push("ServicioDisponibilidadAPI");
  if (!ResenasAPI) missing.push("ResenasAPI");
  if (!ContratacionesAPI) missing.push("ContratacionesAPI");
  if (!getCurrentUser) missing.push("getCurrentUser");

  if (missing.length) {
    console.error("Faltan scripts/API en window:", missing);
  }

 

  async function loadServiceData() {
    const serviceId = getServiceId();
    if (!serviceId) return;

    try {
      // Obtener datos del servicio desde el backend
      const servicio = await ServiciosAPI.getById(serviceId);
      displayServiceData(servicio);

      // Cargar imágenes del servicio
      const imagenes = await ServicioImagenAPI.getById(serviceId);
      if (imagenes && imagenes.length > 0) {
        displayCarouselImages(imagenes);
      }

      // Cargar disponibilidad
      const disponibilidad = await ServicioDisponibilidadAPI.getByServicio(serviceId);
      if (disponibilidad && disponibilidad.length > 0) {
        displayAvailability(disponibilidad);
      }
    } catch (error) {
      // Si falla, mantener los datos estáticos del HTML
    }
  }

  // Mostrar datos del servicio en la UI
  function displayServiceData(servicio) {
    const titleEl = document.querySelector('.service__title');
    const priceEl = document.querySelector('.service__price');
    const descriptionEl = document.querySelector('.service__description p');
    const modalidadEl = document.querySelector('.service__modalidad');

    if (titleEl) titleEl.textContent = servicio.nombre;
    if (priceEl) priceEl.textContent = ServiciosAPI.formatPrecio(servicio.precio);
    if (descriptionEl) descriptionEl.textContent = servicio.descripcion;
    if (modalidadEl) modalidadEl.textContent = ServiciosAPI.getModalidadTexto(servicio.modalidad);
  }

  // Mostrar imágenes en el carrusel
  function displayCarouselImages(imagenes) {
    const carouselImages = document.getElementById('carouselImages');
    if (!carouselImages) return;

    // Ordenar por orden
    imagenes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    carouselImages.innerHTML = imagenes.map((img, index) => {
      const src = resolveImageUrl(img.imagen_url);

      return `
        <img 
          src="${src}"
          alt="Imagen del servicio"
          class="carousel__image ${index === 0 ? 'active' : ''}"
          onerror="this.src='assets/img/placeholder-service.jpg'"
        >
      `;
    }).join('');
  }


  // Mostrar disponibilidad
  function displayAvailability(disponibilidades) {
    const availabilityContainer = document.querySelector('.service__availability');
    if (!availabilityContainer) return;

    const agrupado = ServicioDisponibilidadAPI.agruparPorDia(disponibilidades);
    
    let html = '<h3>Horarios Disponibles</h3><ul class="availability-list">';
    
    for (let dia = 1; dia <= 7; dia++) {
      if (agrupado[dia]) {
        const nombreDia = ServicioDisponibilidadAPI.getDiaNombre(dia);
        const horarios = agrupado[dia].map(h => 
          `${ServicioDisponibilidadAPI.formatHora(h.hora_inicio)} - ${ServicioDisponibilidadAPI.formatHora(h.hora_fin)}`
        ).join(', ');
        html += `<li><strong>${nombreDia}:</strong> ${horarios}</li>`;
      }
    }
    
    html += '</ul>';
    availabilityContainer.innerHTML = html;
  }

  // ===========================
  // IMAGE CAROUSEL
  // ===========================
  const carouselImages = document.getElementById('carouselImages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicators = document.querySelectorAll('.carousel__indicator');

  if (carouselImages && prevBtn && nextBtn) {
    let currentIndex = 0;

    function getImages() {
      return carouselImages.querySelectorAll('.carousel__image');
    }

    function showImage(index) {
      const images = getImages();
      images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
    }

    function nextImage() {
      const images = getImages();
      if (images.length === 0) return;
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }

    function prevImage() {
      const images = getImages();
      if (images.length === 0) return;
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    }

    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentIndex = index;
        showImage(currentIndex);
      });
    });

    setInterval(nextImage, 5000);
  }

  // ===========================
  // CARGAR RESEÑAS
  // ===========================
  async function loadDynamicReviews() {
    const reviewsList = document.querySelector('.reviews__list');
    if (!reviewsList) return;

    const serviceId = getServiceId();
    if (!serviceId) return;

    try {
      // Intentar cargar reseñas desde el backend
      const reviews = await ResenasAPI.getByServicio(serviceId);
      
      if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
          const reviewElement = createReviewElement(review);
          reviewsList.appendChild(reviewElement);
        });

        updateReviewsStats(reviews);
      }
    } catch (error) {
      // Fallback: cargar desde localStorage
      loadReviewsFromLocalStorage(serviceId);
    }
  }

  // Cargar reseñas desde localStorage (fallback)
  function loadReviewsFromLocalStorage(serviceId) {
    const reviewsList = document.querySelector('.reviews__list');
    if (!reviewsList) return;

    const storedReviews = JSON.parse(localStorage.getItem('resenas') || '[]');
    const serviceReviews = storedReviews.filter(review => 
      review.id_servicio == serviceId || review.servicioId == serviceId
    );

    if (serviceReviews.length > 0) {
      serviceReviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
      });

      updateReviewsStats(serviceReviews);
    }
  }

  // Actualizar estadísticas de reseñas
  function updateReviewsStats(reviews) {
    const reviewsCount = document.querySelector('.reviews__count');
    const reviewsAvg = document.querySelector('.reviews__average');
    
    if (reviewsCount) {
      reviewsCount.textContent = `${reviews.length} reseñas`;
    }
    
    if (reviewsAvg && reviews.length > 0) {
      const promedio = ResenasAPI.calcularPromedio(reviews);
      reviewsAvg.textContent = promedio;
    }
  }

  // Crear elemento HTML para una reseña
  function createReviewElement(review) {
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review';

    // Calcular tiempo transcurrido usando la función de la API
    const timeText = ResenasAPI.formatFecha(review.fecha);

    // Generar estrellas
    const calificacion = review.calificacion || 5;
    const starsHTML = ResenasAPI.generarEstrellas(calificacion);

    // Nombre del usuario (puede venir de diferentes campos según el origen)
    const nombreUsuario = review.usuario?.nombre || review.usuarioNombre || review.usuario_nombre || 'Usuario';

    reviewDiv.innerHTML = `
      <div class="review__header">
        <img src="assets/img/avatar-default.jpg" alt="${nombreUsuario}" class="review__avatar" onerror="this.src='assets/img/avatar-default.jpg'">
        <div class="review__info">
          <div class="review__name">${nombreUsuario}</div>
          <div class="review__rating">
            ${starsHTML}
          </div>
        </div>
        <div class="review__date">${timeText}</div>
      </div>
      <p class="review__text">
        ${review.comentario || review.texto || ''}
      </p>
    `;

    return reviewDiv;
  }

  // ===========================
  // BOOKING FORM SUBMISSION
  // ===========================
  const bookingForm = document.getElementById('bookingForm');
  const toast = document.getElementById('toast');

  if (bookingForm && toast) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = getCurrentUser();
      
      if (!user) {
        toast.textContent = 'Debes iniciar sesión para contratar un servicio';
        toast.classList.add('show', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
        return;
      }

      // Get form values
      const date = document.getElementById('bookingDate').value;
      const descripcion = document.getElementById('bookingDescription')?.value || '';
      const serviceId = getServiceId();

      if (!serviceId) {
        toast.textContent = 'Error: Servicio no encontrado';
        toast.classList.add('show', 'error');
        return;
      }

      try {
        // Crear contratación en el backend con campos correctos de la BD
        await ContratacionesAPI.create({
          id_usuario: user.id_usuario,
          id_servicio: parseInt(serviceId),
          fecha: date,
          descripcion: descripcion,
          estado: 'PENDIENTE'
        });

        toast.textContent = 'Servicio agendado exitosamente';
        toast.classList.add('show');
        toast.classList.remove('error');

      } catch (error) {
        // Fallback: guardar en localStorage
        const contrataciones = JSON.parse(localStorage.getItem('contrataciones') || '[]');
        contrataciones.push({
          id_contratacion: Date.now(),
          id_usuario: user.id_usuario,
          id_servicio: parseInt(serviceId),
          fecha: date,
          descripcion: descripcion,
          estado: 'PENDIENTE'
        });
        localStorage.setItem('contrataciones', JSON.stringify(contrataciones));

        toast.textContent = 'Servicio agendado exitosamente';
        toast.classList.add('show');
        toast.classList.remove('error');
      }

      // Update cart badge
      const cartBadge = document.querySelector('.cart-badge');
      if (cartBadge) {
        const currentCount = parseInt(cartBadge.textContent) || 0;
        cartBadge.textContent = currentCount + 1;
      }

      // Reset form
      bookingForm.reset();

      setTimeout(() => {
        toast.classList.remove('show');
      }, 5000);
    });
  }

  // ===========================
  // SET MINIMUM DATE FOR BOOKING
  // ===========================
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    bookingDateInput.min = `${year}-${month}-${day}`;
  }

  // ===========================
  // INITIALIZE
  // ===========================
  loadServiceData();
  loadDynamicReviews();
})();
