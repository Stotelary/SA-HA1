// ===========================
// API DE SERVICIOS
// ===========================
// Campos de la tabla servicio:
// - id_servicio (int, PK, AUTO_INCREMENT)
// - id_usuario (int, FK -> usuario)
// - nombre (varchar 150)
// - descripcion (text)
// - precio (decimal 10,2)
// - modalidad (tinyint: 1=presencial, 2=online, 3=ambos)
// - fecha_creacion (timestamp)

const apiRequest = require('./apiRequest'); // Assuming apiRequest is a module that needs to be imported

const ServiciosAPI = {
  // Constantes para modalidad
  MODALIDAD: {
    PRESENCIAL: 1,
    ONLINE: 2,
    AMBOS: 3
  },

  /*
   * Obtener texto de modalidad
   * @param {number} modalidad
   * @returns {string}
   */
  getModalidadTexto(modalidad) {
    switch (parseInt(modalidad)) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      case 3: return 'Presencial y Online';
      default: return 'No especificado';
    }
  },

  /*
   * Listar todos los servicios
   * @returns {Promise<array>}
   */
  async getAll() {
    return await apiRequest('/api/servicios', {
      method: 'GET'
    });
  },

  /*
   * Obtener un servicio por ID
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<object>}
   */
  async getById(idServicio) {
    return await apiRequest(`/api/servicios/${idServicio}`, {
      method: 'GET'
    });
  },

  /*
   * Crear un nuevo servicio
   * @param {object} servicioData - Datos del servicio
   * @returns {Promise<object>}
   */
  async create(servicioData) {
    const payload = {
      id_usuario: parseInt(servicioData.id_usuario),
      nombre: servicioData.nombre,
      descripcion: servicioData.descripcion,
      precio: parseFloat(servicioData.precio),
      modalidad: parseInt(servicioData.modalidad)
    };

    return await apiRequest('/api/servicios', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Actualizar un servicio
   * @param {number} idServicio - ID del servicio
   * @param {object} servicioData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idServicio, servicioData) {
    const payload = {};
    
    if (servicioData.nombre) payload.nombre = servicioData.nombre;
    if (servicioData.descripcion) payload.descripcion = servicioData.descripcion;
    if (servicioData.precio !== undefined) payload.precio = parseFloat(servicioData.precio);
    if (servicioData.modalidad !== undefined) payload.modalidad = parseInt(servicioData.modalidad);

    return await apiRequest(`/api/servicios/${idServicio}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Eliminar un servicio
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<object>}
   */
  async delete(idServicio) {
    return await apiRequest(`/api/servicios/${idServicio}`, {
      method: 'DELETE'
    });
  },

  /*
   * Buscar servicios con filtros
   * @param {object} filtros - Filtros de búsqueda
   * @returns {Promise<array>}
   */
  async search(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
    if (filtros.busqueda) params.append('q', filtros.busqueda);
    if (filtros.orden) params.append('orden', filtros.orden);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/servicios?${queryString}` : '/api/servicios';
    
    return await apiRequest(endpoint, {
      method: 'GET'
    });
  },

  /*
   * Obtener servicios por modalidad
   * @param {number} modalidad
   * @returns {Promise<array>}
   */
  async getByModalidad(modalidad) {
    return await apiRequest(`/api/servicios?modalidad=${modalidad}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener servicios de un usuario/prestador
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<array>}
   */
  async getByUsuario(idUsuario) {
    return await apiRequest(`/api/servicios/usuario/${idUsuario}`, {
      method: 'GET'
    });
  },

  /*
   * Formatear precio a moneda chilena
   * @param {number} precio
   * @returns {string}
   */
  formatPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
  }
};

// Exportar para uso global
window.ServiciosAPI = ServiciosAPI;
