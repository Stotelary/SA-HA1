// ===========================
// SERVICE PAGE JAVASCRIPT
// ===========================

;(() => {
  // ===========================
  // IMAGE CAROUSEL
  // ===========================
  const carouselImages = document.getElementById("carouselImages")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")
  const indicators = document.querySelectorAll(".carousel__indicator")

  if (carouselImages && prevBtn && nextBtn) {
    const images = carouselImages.querySelectorAll(".carousel__image")
    let currentIndex = 0

    function showImage(index) {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index)
      })

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === index)
      })
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length
      showImage(currentIndex)
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length
      showImage(currentIndex)
    }

    prevBtn.addEventListener("click", prevImage)
    nextBtn.addEventListener("click", nextImage)

    // Indicator clicks
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        currentIndex = index
        showImage(currentIndex)
      })
    })

    // Auto-advance carousel every 5 seconds
    setInterval(nextImage, 5000)
  }

  // ===========================
  // ===========================
  function loadDynamicReviews() {
    const reviewsList = document.querySelector(".reviews__list")
    if (!reviewsList) return

    // Obtener reseñas del localStorage
    const storedReviews = JSON.parse(localStorage.getItem("resenas") || "[]")

    // Filtrar reseñas para este servicio (asumiendo ID 1 para Gasfitería)
    const serviceReviews = storedReviews.filter((review) => review.servicioId === "1")

    // Si hay reseñas dinámicas, agregarlas al final
    if (serviceReviews.length > 0) {
      serviceReviews.forEach((review) => {
        const reviewElement = createReviewElement(review)
        reviewsList.appendChild(reviewElement)
      })

      // Actualizar contador de reseñas
      const reviewsCount = document.querySelector(".reviews__count")
      if (reviewsCount) {
        const currentCount = Number.parseInt(reviewsCount.textContent)
        reviewsCount.textContent = `${currentCount + serviceReviews.length} reseñas`
      }
    }
  }

  // Crear elemento HTML para una reseña
  function createReviewElement(review) {
    const reviewDiv = document.createElement("div")
    reviewDiv.className = "review"

    // Calcular tiempo transcurrido
    const reviewDate = new Date(review.fecha)
    const now = new Date()
    const diffTime = Math.abs(now - reviewDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let timeText = "Hoy"
    if (diffDays === 1) timeText = "Ayer"
    else if (diffDays < 7) timeText = `Hace ${diffDays} días`
    else if (diffDays < 30) timeText = `Hace ${Math.floor(diffDays / 7)} semanas`
    else timeText = `Hace ${Math.floor(diffDays / 30)} meses`

    // Generar estrellas
    const starsHTML = Array(5)
      .fill(0)
      .map(
        (_, index) =>
          `<svg class="star-small" viewBox="0 0 24 24" fill="${index < review.calificacion ? "currentColor" : "none"}" stroke="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`,
      )
      .join("")

    reviewDiv.innerHTML = `
      <div class="review__header">
        <img src="./assets/img/hombre-con-lentes.jpg" alt="${review.usuarioNombre}" class="review__avatar">
        <div class="review__info">
          <div class="review__name">${review.usuarioNombre}</div>
          <div class="review__rating">
            ${starsHTML}
          </div>
        </div>
        <div class="review__date">${timeText}</div>
      </div>
      <p class="review__text">
        ${review.texto}
      </p>
      ${review.recomienda ? '<span class="review__badge">✓ Recomendado</span>' : ""}
    `

    return reviewDiv
  }

  // Cargar reseñas cuando el DOM esté listo
  loadDynamicReviews()

  // ===========================
  // BOOKING FORM SUBMISSION
  // ===========================
  const bookingForm = document.getElementById("bookingForm")
  const toast = document.getElementById("toast")

  if (bookingForm && toast) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form values
      const date = document.getElementById("bookingDate").value
      const time = document.getElementById("bookingTime").value
      const type = document.getElementById("serviceType").value

      // Show toast notification
      toast.classList.add("show")

      // Update cart badge
      const cartBadge = document.querySelector(".cart-badge")
      if (cartBadge) {
        const currentCount = Number.parseInt(cartBadge.textContent)
        cartBadge.textContent = currentCount + 1
      }

      // Reset form
      bookingForm.reset()

      // Hide toast after 5 seconds
      setTimeout(() => {
        toast.classList.remove("show")
      }, 5000)
    })
  }

  // ===========================
  // SET MINIMUM DATE FOR BOOKING
  // ===========================
  const bookingDateInput = document.getElementById("bookingDate")
  if (bookingDateInput) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0")
    const day = String(tomorrow.getDate()).padStart(2, "0")

    bookingDateInput.min = `${year}-${month}-${day}`
  }
})()
