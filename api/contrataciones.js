// ===========================
// API DE CONTRATACIONES
// ===========================
// Campos de la tabla contratacion:
// - id_contratacion (int, PK, AUTO_INCREMENT)
// - id_usuario (int, FK -> usuario)
// - id_servicio (int, FK -> servicio)
// - fecha (date)
// - descripcion (text)
// - estado (varchar 20: 'PENDIENTE', 'REALIZADO', 'CANCELADO')
// UNIQUE KEY (id_usuario, id_servicio, fecha)

const ContratacionesAPI = {
  // Estados posibles
  ESTADOS: {
    PENDIENTE: 'PENDIENTE',
    REALIZADO: 'REALIZADO',
    CANCELADO: 'CANCELADO'
  },

  /**
   * Obtener clase CSS para el estado
   * @param {string} estado
   * @returns {string}
   */
  getEstadoClase(estado) {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'REALIZADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'secondary';
    }
  },

  /**
   * Listar todas las contrataciones
   * @returns {Promise<array>}
   */
  async getAll() {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest('/api/contrataciones', {
      method: 'GET'
    });
  },

  /**
   * Obtener contratación por ID
   * @param {number} idContratacion - ID de la contratación
   * @returns {Promise<object>}
   */
  async getById(idContratacion) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest(`/api/contrataciones/${idContratacion}`, {
      method: 'GET'
    });
  },

  /**
   * Obtener contrataciones de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<array>}
   */
  async getByUsuario(idUsuario) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest(`/api/contrataciones/usuario/${idUsuario}`, {
      method: 'GET'
    });
  },

  /**
   * Obtener contrataciones de un servicio
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<array>}
   */
  async getByServicio(idServicio) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest(`/api/contrataciones/servicio/${idServicio}`, {
      method: 'GET'
    });
  },

  /**
   * Crear una nueva contratación
   * @param {object} contratacionData - Datos de la contratación
   * @returns {Promise<object>}
   */
  async create(contratacionData) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    const payload = {
      id_usuario: parseInt(contratacionData.id_usuario),
      id_servicio: parseInt(contratacionData.id_servicio),
      fecha: contratacionData.fecha,
      descripcion: contratacionData.descripcion || '',
      estado: contratacionData.estado || 'PENDIENTE'
    };

    return await apiRequest('/api/contrataciones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Actualizar una contratación
   * @param {number} idContratacion - ID de la contratación
   * @param {object} contratacionData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idContratacion, contratacionData) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    const payload = {};
    
    if (contratacionData.fecha) payload.fecha = contratacionData.fecha;
    if (contratacionData.descripcion !== undefined) payload.descripcion = contratacionData.descripcion;
    if (contratacionData.estado) payload.estado = contratacionData.estado;

    return await apiRequest(`/api/contrataciones/${idContratacion}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Eliminar una contratación
   * @param {number} idContratacion - ID de la contratación
   * @returns {Promise<object>}
   */
  async delete(idContratacion) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest(`/api/contrataciones/${idContratacion}`, {
      method: 'DELETE'
    });
  },

  /**
   * Cambiar estado de una contratación
   * @param {number} idContratacion
   * @param {string} nuevoEstado
   * @returns {Promise<object>}
   */
  async cambiarEstado(idContratacion, nuevoEstado) {
    return await this.update(idContratacion, { estado: nuevoEstado });
  },

  /**
   * Obtener contrataciones por estado
   * @param {string} estado
   * @returns {Promise<array>}
   */
  async getByEstado(estado) {
    const apiRequest = window.apiRequest; // Declare apiRequest variable
    return await apiRequest(`/api/contrataciones/estado/${estado}`, {
      method: 'GET'
    });
  },

  /**
   * Obtener contrataciones realizadas de un usuario
   * @param {number} idUsuario
   * @returns {Promise<array>}
   */
  async getRealizadasByUsuario(idUsuario) {
    try {
      const contrataciones = await this.getByUsuario(idUsuario);
      if (!Array.isArray(contrataciones)) return [];
      return contrataciones.filter(c => c.estado === 'REALIZADO');
    } catch (error) {
      return [];
    }
  },

  /**
   * Obtener contrataciones pendientes (próximas) de un usuario
   * @param {number} idUsuario
   * @returns {Promise<array>}
   */
  async getPendientesByUsuario(idUsuario) {
    try {
      const contrataciones = await this.getByUsuario(idUsuario);
      if (!Array.isArray(contrataciones)) return [];
      return contrataciones.filter(c => c.estado === 'PENDIENTE');
    } catch (error) {
      return [];
    }
  },

  /**
   * Verificar si el usuario puede dejar reseña (solo si estado = REALIZADO)
   * @param {number} idContratacion
   * @returns {Promise<boolean>}
   */
  async puedeDejarResena(idContratacion) {
    try {
      const contratacion = await this.getById(idContratacion);
      return contratacion && contratacion.estado === 'REALIZADO';
    } catch (error) {
      return false;
    }
  },

  /**
   * Formatear fecha
   * @param {string} fecha
   * @returns {string}
   */
  formatFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Verificar si la fecha es futura
   * @param {string} fecha
   * @returns {boolean}
   */
  esFechaFutura(fecha) {
    const date = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return date >= hoy;
  }
};

// Exportar para uso global
window.ContratacionesAPI = ContratacionesAPI;
