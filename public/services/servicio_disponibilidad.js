// ===========================
// API DE DISPONIBILIDAD DE SERVICIOS
// ===========================
// Campos de la tabla servicio_disponibilidad:
// - id_disponibilidad (int, PK, AUTO_INCREMENT)
// - id_servicio (int, FK -> servicio)
// - dia_semana (tinyint 1-7, donde 1=Lunes, 7=Domingo)
// - hora_inicio (time)
// - hora_fin (time)
// UNIQUE KEY (id_servicio, dia_semana, hora_inicio, hora_fin)

const apiRequest = require('./apiRequest'); // Assuming apiRequest is imported from another module

const ServicioDisponibilidadAPI = {
  // Constantes para días de la semana
  DIAS_SEMANA: {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  },

  /*
   * Obtener nombre del día
   * @param {number} diaSemana
   * @returns {string}
   */
  getDiaNombre(diaSemana) {
    return this.DIAS_SEMANA[diaSemana] || 'Desconocido';
  },

  /*
   * Listar todas las disponibilidades
   * @returns {Promise<array>}
   */
  async getAll() {
    return await apiRequest('/api/servicio-disponibilidad', {
      method: 'GET'
    });
  },

  /*
   * Obtener disponibilidad por ID
   * @param {number} idDisponibilidad - ID de la disponibilidad
   * @returns {Promise<object>}
   */
  async getById(idDisponibilidad) {
    return await apiRequest(`/api/servicio-disponibilidad/${idDisponibilidad}`, {
      method: 'GET'
    });
  },

  /*
   * Obtener disponibilidades de un servicio
   * @param {number} idServicio - ID del servicio
   * @returns {Promise<array>}
   */
  async getByServicio(idServicio) {
    return await apiRequest(`/api/servicio-disponibilidad/servicio/${idServicio}`, {
      method: 'GET'
    });
  },

  /*
   * Crear una nueva disponibilidad
   * @param {object} disponibilidadData - Datos de disponibilidad
   * @returns {Promise<object>}
   */
  async create(disponibilidadData) {
    const payload = {
      id_servicio: parseInt(disponibilidadData.id_servicio),
      dia_semana: parseInt(disponibilidadData.dia_semana),
      hora_inicio: disponibilidadData.hora_inicio,
      hora_fin: disponibilidadData.hora_fin
    };

    return await apiRequest('/api/servicio-disponibilidad', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Actualizar una disponibilidad
   * @param {number} idDisponibilidad - ID de la disponibilidad
   * @param {object} disponibilidadData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idDisponibilidad, disponibilidadData) {
    const payload = {};
    
    if (disponibilidadData.dia_semana !== undefined) {
      payload.dia_semana = parseInt(disponibilidadData.dia_semana);
    }
    if (disponibilidadData.hora_inicio) {
      payload.hora_inicio = disponibilidadData.hora_inicio;
    }
    if (disponibilidadData.hora_fin) {
      payload.hora_fin = disponibilidadData.hora_fin;
    }

    return await apiRequest(`/api/servicio-disponibilidad/${idDisponibilidad}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /*
   * Eliminar una disponibilidad
   * @param {number} idDisponibilidad - ID de la disponibilidad
   * @returns {Promise<object>}
   */
  async delete(idDisponibilidad) {
    return await apiRequest(`/api/servicio-disponibilidad/${idDisponibilidad}`, {
      method: 'DELETE'
    });
  },

  /*
   * Formatear hora (HH:MM:SS -> HH:MM)
   * @param {string} hora
   * @returns {string}
   */
  formatHora(hora) {
    if (!hora) return '';
    return hora.substring(0, 5);
  },

  /*
   * Formatear disponibilidad para mostrar
   * @param {object} disponibilidad
   * @returns {string}
   */
  formatDisponibilidad(disponibilidad) {
    const dia = this.getDiaNombre(disponibilidad.dia_semana);
    const horaInicio = this.formatHora(disponibilidad.hora_inicio);
    const horaFin = this.formatHora(disponibilidad.hora_fin);
    return `${dia}: ${horaInicio} - ${horaFin}`;
  },

  /*
   * Agrupar disponibilidad por día
   * @param {array} disponibilidades
   * @returns {object}
   */
  agruparPorDia(disponibilidades) {
    const agrupado = {};
    
    if (!Array.isArray(disponibilidades)) return agrupado;
    
    disponibilidades.forEach(disp => {
      const dia = disp.dia_semana;
      if (!agrupado[dia]) {
        agrupado[dia] = [];
      }
      agrupado[dia].push({
        id_disponibilidad: disp.id_disponibilidad,
        hora_inicio: disp.hora_inicio,
        hora_fin: disp.hora_fin
      });
    });

    return agrupado;
  }
};

// Exportar para uso global
window.ServicioDisponibilidadAPI = ServicioDisponibilidadAPI;
