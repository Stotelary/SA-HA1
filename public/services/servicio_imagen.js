// ===========================
// API DE IMÁGENES DE SERVICIOS
// ===========================
// Campos de la tabla servicio_imagen:
// - id_imagen (int, PK, AUTO_INCREMENT)
// - id_servicio (int, FK -> servicio)
// - imagen_url (varchar 255)
// - orden (int)

const ServicioImagenAPI = {
  async getAll() {
    return await window.apiRequest('/api/servicio-imagen', {
      method: 'GET'
    });
  },

  async getById(idImagen) {
    return await window.apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'GET'
    });
  },

  async getByServicio(idServicio) {
    return await window.apiRequest(`/api/servicio-imagen/servicio/${idServicio}`, {
      method: 'GET'
    });
  },

  async create(imagenData) {
    const payload = {
      id_servicio: parseInt(imagenData.id_servicio, 10),
      imagen_url: imagenData.imagen_url,
      orden: parseInt(imagenData.orden, 10) || 1
    };

    return await window.apiRequest('/api/servicio-imagen', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async update(idImagen, imagenData) {
    const payload = {};

    if (imagenData.imagen_url) payload.imagen_url = imagenData.imagen_url;
    if (imagenData.orden !== undefined) payload.orden = parseInt(imagenData.orden, 10);

    return await window.apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async delete(idImagen) {
    return await window.apiRequest(`/api/servicio-imagen/${idImagen}`, {
      method: 'DELETE'
    });
  },

  async getPrincipal(idServicio) {
    try {
      const imagenes = await this.getByServicio(idServicio);
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        imagenes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        return imagenes[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async getPrincipalUrl(idServicio) {
    const imagen = await this.getPrincipal(idServicio);
    return imagen ? imagen.imagen_url : 'assets/img/placeholder-service.jpg';
  }
};

window.ServicioImagenAPI = ServicioImagenAPI;