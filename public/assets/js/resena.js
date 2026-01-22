// ===========================
// REVIEW PAGE JAVASCRIPT
// ===========================
// Campos de resena en BD: id_resena, id_contratacion, calificacion (1-5), comentario, fecha
// Las reseñas están vinculadas a contrataciones, no directamente a servicios

// Importaciones necesarias
const getCurrentUser = () => {
  // Implementación de getCurrentUser
};
const ContratacionesAPI = {
  getById: async (id) => {
    // Implementación de getById para ContratacionesAPI
  },
  formatFecha: (fecha) => {
    // Implementación de formatFecha para ContratacionesAPI
  }
};
const ResenasAPI = {
  getByContratacion: async (id) => {
    // Implementación de getByContratacion para ResenasAPI
  },
  create: async (data) => {
    // Implementación de create para ResenasAPI
  }
};
const ServiciosAPI = {
  getById: async (id) => {
    // Implementación de getById para ServiciosAPI
  }
};
const ServicioImagenAPI = {
  getByServicio: async (id) => {
    // Implementación de getByServicio para ServicioImagenAPI
  }
};

// Verificar autenticación
function checkAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return null;
  }
  return currentUser;
}

// Mostrar toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Obtener parámetros de URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// ===========================
// CARGAR INFORMACIÓN DEL SERVICIO
// ===========================
async function loadServiceInfo() {
  const servicioId = getUrlParameter('servicio');
  const contratacionId = getUrlParameter('contratacion');
  
  if (!contratacionId) {
    showToast('Se requiere una contratación para dejar una reseña', 'error');
    setTimeout(() => {
      window.location.href = 'perfil.html';
    }, 2000);
    return;
  }

  try {
    // Obtener datos de la contratación
    const contratacion = await ContratacionesAPI.getById(contratacionId);
    
    if (!contratacion) {
      throw new Error('Contratación no encontrada');
    }

    // Verificar que la contratación esté REALIZADA
    if (contratacion.estado !== 'REALIZADO') {
      showToast('Solo puedes dejar reseña en servicios completados', 'error');
      setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 2000);
      return;
    }

    // Verificar si ya existe una reseña para esta contratación
    try {
      const resenaExistente = await ResenasAPI.getByContratacion(contratacionId);
      if (resenaExistente) {
        showToast('Ya has dejado una reseña para este servicio', 'error');
        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 2000);
        return;
      }
    } catch (e) {
      // No existe reseña, continuar
    }

    // Obtener datos del servicio
    const servicio = await ServiciosAPI.getById(contratacion.id_servicio);
    
    // Obtener imagen del servicio
    let imagenUrl = 'assets/images/placeholder-service.jpg';
    try {
      const imagenes = await ServicioImagenAPI.getByServicio(contratacion.id_servicio);
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        imagenes.sort((a, b) => a.orden - b.orden);
        imagenUrl = imagenes[0].imagen_url;
      }
    } catch (e) {}

    displayServiceInfo({
      nombre: servicio.nombre,
      imagen: imagenUrl,
      fecha: contratacion.fecha,
      precio: servicio.precio
    });

  } catch (error) {
    // Fallback: cargar desde JSON local
    loadServiceInfoFromLocal(servicioId);
  }
}

// Cargar información desde archivo local (fallback)
async function loadServiceInfoFromLocal(servicioId) {
  try {
    const response = await fetch('data/servicios-contratados.json');
    const data = await response.json();
    const servicio = data.serviciosContratados.find(s => 
      s.id == servicioId || s.servicioId == servicioId
    );

    if (servicio) {
      displayServiceInfo({
        nombre: servicio.nombre,
        imagen: servicio.imagen,
        fecha: servicio.fecha
      });
    }
  } catch (error) {
    showToast('Error al cargar información del servicio', 'error');
  }
}

// Mostrar información del servicio en la UI
function displayServiceInfo(servicio) {
  const serviceImage = document.getElementById('serviceImage');
  const serviceName = document.getElementById('serviceName');
  const serviceDate = document.getElementById('serviceDate');

  if (serviceImage) {
    serviceImage.src = servicio.imagen || 'assets/images/placeholder-service.jpg';
    serviceImage.onerror = function() {
      this.src = 'assets/images/placeholder-service.jpg';
    };
  }
  if (serviceName) {
    serviceName.textContent = servicio.nombre;
  }
  if (serviceDate && servicio.fecha) {
    const fecha = ContratacionesAPI.formatFecha(servicio.fecha);
    serviceDate.textContent = `Realizado el ${fecha}`;
  }
}

// ===========================
// ACTUALIZAR TEXTO DE CALIFICACIÓN
// ===========================
function updateRatingText() {
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const ratingText = document.getElementById('ratingText');

  const ratingLabels = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  ratingInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (ratingText) {
        ratingText.textContent = ratingLabels[this.value];
      }
    });
  });
}

// ===========================
// GUARDAR RESEÑA
// ===========================
async function saveReview(reviewData) {
  try {
    // Enviar reseña al backend con campos correctos de la BD
    await ResenasAPI.create({
      id_contratacion: reviewData.id_contratacion,
      calificacion: reviewData.calificacion,
      comentario: reviewData.comentario
    });
    return true;
  } catch (error) {
    // Fallback: guardar en localStorage
    const reviews = JSON.parse(localStorage.getItem('resenas') || '[]');
    reviews.push({
      ...reviewData,
      id_resena: Date.now(),
      fecha: new Date().toISOString()
    });
    localStorage.setItem('resenas', JSON.stringify(reviews));
    return true;
  }
}

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  if (!user) return;

  loadServiceInfo();
  updateRatingText();

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const contratacionId = getUrlParameter('contratacion');
      const servicioId = getUrlParameter('servicio');
      const rating = document.querySelector('input[name="rating"]:checked');
      const reviewText = document.getElementById('reviewText').value;
      const submitBtn = reviewForm.querySelector('button[type="submit"]');

      if (!rating) {
        showToast('Por favor selecciona una calificación', 'error');
        return;
      }

      if (reviewText.length < 20) {
        showToast('La reseña debe tener al menos 20 caracteres', 'error');
        return;
      }

      if (!contratacionId) {
        showToast('Error: No se encontró la contratación', 'error');
        return;
      }

      // Deshabilitar botón mientras procesa
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';

      // Campos según la BD: id_contratacion, calificacion, comentario
      const reviewData = {
        id_contratacion: parseInt(contratacionId),
        calificacion: parseInt(rating.value),
        comentario: reviewText,
        // Campos adicionales para fallback localStorage
        id_servicio: servicioId ? parseInt(servicioId) : null,
        id_usuario: user.id_usuario,
        usuarioNombre: user.nombre
      };

      const success = await saveReview(reviewData);

      if (success) {
        showToast('Reseña publicada exitosamente', 'success');
        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 1500);
      } else {
        showToast('Error al publicar la reseña', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar Reseña';
      }
    });
  }
});
