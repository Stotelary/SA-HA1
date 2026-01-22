// ===========================
// API DE RESEÑAS
// ===========================
// Campos de la tabla resena:
// - id_resena (int, PK, AUTO_INCREMENT)
// - id_contratacion (int, FK -> contratacion, UNIQUE)
// - calificacion (tinyint 1-5)
// - comentario (text)
// - fecha (timestamp)
// 
// NOTA: Las reseñas están vinculadas a contrataciones, no directamente a servicios

const apiRequest = async (url, options) => {
  // Implementación de apiRequest aquí
  // Esto es un ejemplo ficticio y debe ser reemplazado con la implementación real
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const ResenasAPI = {
  /*
   * Listar todas las reseñas
   * @returns {Promise<array>}
   */
  async getAll() {
    return await apiRequest('/api/resenas', {
      method: 'GET'
    });
  },

  /*
   * Obtener reseña por ID
   * @param {number} idResena - ID de la reseña
   * @returns {Promise<object>}
   */
  async getById(idResena) {
    return await apiRequest(`/api/resenas/${idResena}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener reseña por ID de contratación
   * @param {number} idContratacion
   * @returns {Promise<object>}
   */
  async getByContratacion(idContratacion) {
    return await apiRequest(`/api/resenas/contratacion/${idContratacion}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener reseñas de un servicio (a través de contrataciones)
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<array>}
   */
  async getByServicio(idServicio) {
    return await apiRequest(`/api/resenas/servicio/${idServicio}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener reseñas de un usuario (a través de contrataciones)
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<array>}
   */
  async getByUsuario(idUsuario) {
    return await apiRequest(`/api/resenas/usuario/${idUsuario}`, {
      method: 'GET'
    });
  },

  /*
   * Crear una nueva reseña
   * @param {object} resenaData - Datos de la reseña
   * @returns {Promise<object>}
   */
  async create(resenaData) {
    const payload = {
      id_contratacion: parseInt(resenaData.id_contratacion),
      calificacion: parseInt(resenaData.calificacion),
      comentario: resenaData.comentario || ''
    };

    // Validar calificación entre 1 y 5
    if (payload.calificacion < 1 || payload.calificacion > 5) {
      throw { status: 400, message: 'La calificación debe estar entre 1 y 5' };
    }

    return await apiRequest('/api/resenas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Actualizar una reseña
   * @param {number} idResena - ID de la reseña
   * @param {object} resenaData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idResena, resenaData) {
    const payload = {};
    
    if (resenaData.calificacion !== undefined) {
      payload.calificacion = parseInt(resenaData.calificacion);
      if (payload.calificacion < 1 || payload.calificacion > 5) {
        throw { status: 400, message: 'La calificación debe estar entre 1 y 5' };
      }
    }
    if (resenaData.comentario !== undefined) {
      payload.comentario = resenaData.comentario;
    }

    return await apiRequest(`/api/resenas/${idResena}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Eliminar una reseña
   * @param {number} idResena - ID de la reseña
   * @returns {Promise<object>}
   */
  async delete(idResena) {
    return await apiRequest(`/api/resenas/${idResena}`, {
      method: 'DELETE'
    });
  },

  /*
   * Obtener estadísticas de reseñas de un servicio
   * @param {number} idServicio
   * @returns {Promise<object>}
   */
  async getEstadisticasServicio(idServicio) {
    return await apiRequest(`/api/resenas/servicio/${idServicio}/stats`, {
      method: 'GET'
    });
  },

  /*
   * Generar HTML de estrellas para mostrar calificación
   * @param {number} calificacion
   * @returns {string}
   */
  generarEstrellas(calificacion) {
    let html = '';
    const cal = parseInt(calificacion) || 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= cal) {
        html += '<i class="bi bi-star-fill text-warning"></i>';
      } else {
        html += '<i class="bi bi-star text-muted"></i>';
      }
    }
    
    return html;
  },

  /*
   * Calcular promedio de calificaciones
   * @param {array} resenas
   * @returns {number}
   */
  calcularPromedio(resenas) {
    if (!resenas || resenas.length === 0) return 0;
    
    const suma = resenas.reduce((acc, r) => acc + (parseInt(r.calificacion) || 0), 0);
    return (suma / resenas.length).toFixed(1);
  },

  /*
   * Formatear fecha de reseña
   * @param {string} fecha
   * @returns {string}
   */
  formatFecha(fecha) {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora - date;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
  }
};

// Exportar para uso global
window.ResenasAPI = ResenasAPI;
