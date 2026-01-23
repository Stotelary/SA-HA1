// ===========================
// API CONFIGURATION
// ===========================

const API_CONFIG = {
  BASE_URL: 'https://four04service-backend.onrender.com',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ===========================
// HELPER FUNCTIONS
// ===========================

/*
 * Realiza una petición fetch con manejo de errores
 * @param {string} endpoint - Endpoint de la API
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers
    }
  };

  // Agregar token si existe (PERO NO en auth)
  const token = getAuthToken();
  const isAuthEndpoint = endpoint.startsWith('/api/auth/');
  if (token && !isAuthEndpoint) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parsear respuesta
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data.error || `Error ${response.status}: ${response.statusText}`,
        data: data
      };
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw { status: 408, message: 'La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.' };
    }
    throw error;
  }
}

/*
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/*
 * Guarda el token de autenticación
 * @param {string} token
 */
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/*
 * Elimina el token de autenticación
 */
function removeAuthToken() {
  localStorage.removeItem('authToken');
}

/*
 * Agrega el token de autenticación a las cabeceras
 * @returns {object}
 */
function getAuthHeaders() {
  const token = getAuthToken();
  return token 
    ? { ...API_CONFIG.HEADERS, 'Authorization': `Bearer ${token}` } 
    : API_CONFIG.HEADERS;
}

/*
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/*
 * Obtiene el usuario actual del localStorage
 * @returns {object|null}
 */
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

/*
 * Guarda el usuario actual
 * @param {object} user
 */
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

/*
 * Elimina el usuario actual
 */
function removeCurrentUser() {
  localStorage.removeItem('currentUser');
}

/*
 * Cierra sesión completamente
 */
function logout() {
  removeAuthToken();
  removeCurrentUser();
  window.location.href = 'login.html';
}

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.apiRequest = apiRequest;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.removeAuthToken = removeAuthToken;
window.getAuthHeaders = getAuthHeaders;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.removeCurrentUser = removeCurrentUser;
window.logout = logout;
