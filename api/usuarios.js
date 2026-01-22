// ===========================
// API DE USUARIOS
// ===========================
// Campos de la tabla usuario:
// - id_usuario (int, PK, AUTO_INCREMENT)
// - nombre (varchar 100)
// - email (varchar 150, UNIQUE)
// - direccion (varchar 100)
// - telefono (varchar 100)
// - password_hash (varchar 255)
// - prestador (tinyint 0/1)
// - fecha_registro (timestamp)
// - rol (varchar 30, default 'USUARIO')

/*const apiRequest = async (url, options) => {
  // Implementación de apiRequest
};

const setAuthToken = (token) => {
  // Implementación de setAuthToken
};*/

const setCurrentUser = (user) => {
  // Implementación de setCurrentUser
};

/*const getCurrentUser = () => {
  // Implementación de getCurrentUser
};*/

const UsuariosAPI = {
  /**
   * Registrar un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise<object>}
   */
  async register(userData) {
    const payload = {
      nombre: userData.nombre,
      email: userData.email,
      direccion: userData.direccion || '',
      telefono: userData.telefono || '',
      password: userData.password,
      prestador: userData.prestador ? 1 : 0
    };

    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Iniciar sesión
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>}
   */
  async login(email, password) {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Si el login es exitoso, guardar token y usuario
    if (response.token) {
      setAuthToken(response.token);
    }
    if (response.usuario) {
      setCurrentUser(response.usuario);
    }

    return response;
  },

  /**
   * Listar todos los usuarios
   * @returns {Promise<array>}
   */
  async getAll() {
    return await apiRequest('/api/usuarios', {
      method: 'GET'
    });
  },

  /**
   * Obtener un usuario por ID
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object>}
   */
  async getById(idUsuario) {
    return await apiRequest(`/api/usuarios/${idUsuario}`, {
      method: 'GET'
    });
  },

  /**
   * Actualizar un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {object} userData - Datos actualizados
   * @returns {Promise<object>}
   */
  async update(idUsuario, userData) {
    const payload = {};
    
    if (userData.nombre) payload.nombre = userData.nombre;
    if (userData.email) payload.email = userData.email;
    if (userData.direccion !== undefined) payload.direccion = userData.direccion;
    if (userData.telefono !== undefined) payload.telefono = userData.telefono;
    if (userData.password) payload.password = userData.password;
    if (userData.prestador !== undefined) payload.prestador = userData.prestador ? 1 : 0;

    const response = await apiRequest(`/api/usuarios/${idUsuario}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    // Actualizar usuario en localStorage si es el usuario actual
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id_usuario === idUsuario) {
      setCurrentUser({ ...currentUser, ...payload });
    }

    return response;
  },

  /**
   * Eliminar un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object>}
   */
  async delete(idUsuario) {
    return await apiRequest(`/api/usuarios/${idUsuario}`, {
      method: 'DELETE'
    });
  },

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<object>}
   */
  async getProfile() {
    return await apiRequest('/api/usuarios/profile', {
      method: 'GET'
    });
  },

  /**
   * Obtener usuarios prestadores de servicios
   * @returns {Promise<array>}
   */
  async getPrestadores() {
    return await apiRequest('/api/usuarios/prestadores', {
      method: 'GET'
    });
  }
};

// Exportar para uso global
window.UsuariosAPI = UsuariosAPI;
