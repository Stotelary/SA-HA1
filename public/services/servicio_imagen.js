// ===========================
// API DE IMÁGENES DE SERVICIOS
// ===========================
// Campos de la tabla servicio_imagen:
// - id_imagen (int, PK, AUTO_INCREMENT)
// - id_servicio (int, FK -> servicio)
// - imagen_url (varchar 255)
// - orden (int)
// UNIQUE KEY (id_servicio, orden)

const apiRequest = require('./apiRequest'); // Assuming apiRequest is imported from another module

const ServicioImagenAPI = {
  /*
   * Listar todas las imágenes
   * @returns {Promise<array>}
   */
  async getAll() {
    return await apiRequest('/api/servicio-imagen', {
      method: 'GET'
    });
  },

  /*
   * Obtener imagen por ID
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<object>}
   */
  async getById(idImagen) {
    return await apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener imágenes de un servicio
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<array>}
   */
  async getByServicio(idServicio) {
    return await apiRequest(`/api/servicio-imagen/servicio/${idServicio}`, {
      method: 'GET'
    });
  },

  /*
   * Crear una nueva imagen
   * @param {object} imagenData - Datos de la imagen
   * @returns {Promise<object>}
   */
  async create(imagenData) {
    const payload = {
      id_servicio: parseInt(imagenData.id_servicio),
      imagen_url: imagenData.imagen_url,
      orden: parseInt(imagenData.orden) || 1
    };

    return await apiRequest('/api/servicio-imagen', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Actualizar una imagen
   * @param {number} idImagen - ID de la imagen
   * @param {object} imagenData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idImagen, imagenData) {
    const payload = {};
    
    if (imagenData.imagen_url) payload.imagen_url = imagenData.imagen_url;
    if (imagenData.orden !== undefined) payload.orden = parseInt(imagenData.orden);

    return await apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Eliminar una imagen
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<object>}
   */
  async delete(idImagen) {
    return await apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'DELETE'
    });
  },

  /*
   * Obtener imagen principal de un servicio (orden = 1)
   * @param {number} idServicio
   * @returns {Promise<object|null>}
   */
  async getPrincipal(idServicio) {
    try {
      const imagenes = await this.getByServicio(idServicio);
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        // Ordenar por orden y devolver la primera
        imagenes.sort((a, b) => a.orden - b.orden);
        return imagenes[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /*
   * Obtener URL de imagen principal o placeholder
   * @param {number} idServicio
   * @returns {Promise<string>}
   */
  async getPrincipalUrl(idServicio) {
    const imagen = await this.getPrincipal(idServicio);
    return imagen ? imagen.imagen_url : 'assets/img/placeholder-service.jpg';
  }
};

// Exportar para uso global
window.ServicioImagenAPI = ServicioImagenAPI;
