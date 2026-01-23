// ===========================
// PROFILE PAGE JAVASCRIPT
// ===========================
// Campos de usuario en BD: id_usuario, nombre, email, direccion, telefono, password_hash, prestador, fecha_registro, rol
// Campos de contratacion en BD: id_contratacion, id_usuario, id_servicio, fecha, descripcion, estado (PENDIENTE/REALIZADO/CANCELADO)
// Campos de resena en BD: id_resena, id_contratacion, calificacion, comentario, fecha

// Verificar autenticación
console.log("perfil.js cargado");
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
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

// ===========================
// CARGAR DATOS DEL USUARIO
// ===========================
async function loadUserData() {
  const user = checkAuth();
  if (!user) return;

  try {
    const fullUser = await UsuariosAPI.getProfile();
    setCurrentUser(fullUser);
    displayUserData(fullUser);
  } catch (error) {
    console.warn("Usando datos básicos del login");
    displayUserData(user);
  }
}

// Mostrar datos del usuario en la UI
function displayUserData(user) {
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userFullName = document.getElementById('userFullName');
  const userEmailDetail = document.getElementById('userEmailDetail');
  const userPhone = document.getElementById('userPhone');
  const userAddress = document.getElementById('userAddress');
  const memberSince = document.getElementById('memberSince');
  const userRole = document.getElementById('userRole');

  if (userName) userName.textContent = user.nombre || 'Usuario';
  if (userEmail) userEmail.textContent = user.email || '';
  if (userFullName) userFullName.textContent = user.nombre || 'Usuario';
  if (userEmailDetail) userEmailDetail.textContent = user.email || '';
  if (userPhone) userPhone.textContent = user.telefono || 'No especificado';
  if (userAddress) userAddress.textContent = user.direccion || 'No especificada';
  
  // Mostrar rol si es prestador
  if (userRole) {
    userRole.textContent = user.prestador ? 'Prestador de Servicios' : 'Cliente';
  }
  
  // Mostrar fecha de registro si existe
  if (memberSince && user.fecha_registro) {
    const fecha = new Date(user.fecha_registro);
    memberSince.textContent = `Miembro desde ${fecha.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;
  }
}

// ===========================
// CARGAR SERVICIOS CONTRATADOS
// ===========================
async function loadServices() {
  const user = checkAuth();
  if (!user) return;

  const completedList = document.getElementById('completedServicesList');
  const upcomingList = document.getElementById('upcomingServicesList');

  try {
    // Obtener contrataciones del usuario desde el backend
    const contrataciones = await fetch(`/api/contrataciones/${user.id_usuario}`)
      .then(response => response.json());
    
    if (!Array.isArray(contrataciones)) {
      throw new Error('Formato de respuesta inválido');
    }

    // Separar por estado según BD: PENDIENTE, REALIZADO, CANCELADO
    const completedServices = contrataciones.filter(c => c.estado === 'REALIZADO');
    const upcomingServices = contrataciones.filter(c => c.estado === 'PENDIENTE');

    // Actualizar contadores
    const totalServices = document.getElementById('totalServices');
    if (totalServices) totalServices.textContent = contrataciones.length;

    // Obtener información adicional de servicios y reseñas
    await enrichContrataciones(completedServices);
    await enrichContrataciones(upcomingServices);

    // Renderizar servicios completados
    renderServicesList(completedList, completedServices, true);
    
    // Renderizar servicios próximos
    renderServicesList(upcomingList, upcomingServices, false);

    // Contar reseñas
    const totalReviews = document.getElementById('totalReviews');
    if (totalReviews) {
      const reviewCount = completedServices.filter(s => s.tieneResena).length;
      totalReviews.textContent = reviewCount;
    }

  } catch (error) {
    // Fallback: cargar desde archivo local
    loadServicesFromLocal();
  }
}

// Enriquecer contrataciones con datos de servicios y reseñas
async function enrichContrataciones(contrataciones) {
  for (const contratacion of contrataciones) {
    try {
      // Obtener datos del servicio
      const servicio = await fetch(`/api/servicios/${contratacion.id_servicio}`)
        .then(response => response.json());
      contratacion.servicio = servicio;
      
      // Obtener imagen del servicio
      const imagenes = await fetch(`/api/servicios/${contratacion.id_servicio}/imagenes`)
        .then(response => response.json());
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        imagenes.sort((a, b) => a.orden - b.orden);
        contratacion.imagen_url = imagenes[0].imagen_url;
      }
      
      // Verificar si tiene reseña
      if (contratacion.estado === 'REALIZADO') {
        try {
          const resena = await fetch(`/api/resenas/${contratacion.id_contratacion}`)
            .then(response => response.json());
          contratacion.tieneResena = !!resena;
          contratacion.resena = resena;
        } catch (e) {
          contratacion.tieneResena = false;
        }
      }
    } catch (e) {
      // Si falla, continuar con datos básicos
    }
  }
}

// Cargar servicios desde archivo local (fallback)
async function loadServicesFromLocal() {
  try {
    const response = await fetch('data/servicios-contratados.json');
    const data = await response.json();
    
    const completedList = document.getElementById('completedServicesList');
    const upcomingList = document.getElementById('upcomingServicesList');

    const completedServices = data.serviciosContratados.filter(s => s.estado === 'completado' || s.estado === 'REALIZADO');
    const upcomingServices = data.serviciosContratados.filter(s => s.estado === 'proximo' || s.estado === 'PENDIENTE');

    const totalServices = document.getElementById('totalServices');
    if (totalServices) totalServices.textContent = completedServices.length + upcomingServices.length;

    renderServicesList(completedList, completedServices, true);
    renderServicesList(upcomingList, upcomingServices, false);

    const totalReviews = document.getElementById('totalReviews');
    if (totalReviews) {
      const reviewCount = completedServices.filter(s => s.resenaAgregada || s.tieneResena).length;
      totalReviews.textContent = reviewCount;
    }
  } catch (error) {
    showToast('Error al cargar servicios', 'error');
  }
}

// Renderizar lista de servicios
function renderServicesList(container, services, showReviewButton) {
  if (!container) return;
  
  if (services.length === 0) {
    const emptyMessage = showReviewButton 
      ? 'No hay servicios completados' 
      : 'No hay servicios próximos';
    const emptyDescription = showReviewButton 
      ? 'Cuando contrates servicios, aparecerán aquí' 
      : 'Agenda un nuevo servicio para verlo aquí';
    
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>${emptyMessage}</h3>
        <p>${emptyDescription}</p>
        <a href="catalogo.html" class="btn btn--primary">Explorar Servicios</a>
      </div>
    `;
    return;
  }

  container.innerHTML = services.map(service => createServiceCard(service, showReviewButton)).join('');
}

// Crear tarjeta de servicio
function createServiceCard(service, showReviewButton) {
  // Estado según BD: PENDIENTE, REALIZADO, CANCELADO
  const estado = service.estado || 'PENDIENTE';
  const statusClass = estado === 'REALIZADO' ? 'completed' : 
                      estado === 'CANCELADO' ? 'cancelled' : 'upcoming';
  const statusText = estado === 'REALIZADO' ? 'Completado' : 
                     estado === 'CANCELADO' ? 'Cancelado' : 'Pendiente';
  
  // Verificar si ya tiene reseña
  const hasReview = service.tieneResena || service.resenaAgregada;
  
  // Solo mostrar botón de reseña para servicios REALIZADOS sin reseña
  const reviewButton = showReviewButton && !hasReview && estado === 'REALIZADO'
    ? `<a href="resena.html?contratacion=${service.id_contratacion}&servicio=${service.id_servicio}" class="btn-small btn-review">Agregar Reseña</a>`
    : '';

  // Formatear fecha (campo fecha de la BD)
  const fecha = service.fecha 
    ? new Date(service.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    : 'Sin fecha';
  
  // Imagen del servicio
  const imagen = service.imagen_url || service.servicio?.imagen_url || 'assets/img/placeholder-service.jpg';
  
  // Nombre del servicio
  const nombre = service.servicio?.nombre || service.nombre || 'Servicio';
  
  // Precio del servicio
  const precio = service.servicio?.precio || service.precio || 0;
  const precioFormateado = `$${precio}`;

  // Descripcion de la contratacion
  const descripcion = service.descripcion || '';

  return `
    <div class="service-card">
      <img src="${imagen}" alt="${nombre}" class="service-image" onerror="this.src='assets/img/placeholder-service.jpg'">
      <div class="service-details">
        <div class="service-header">
          <h3 class="service-title">${nombre}</h3>
          <span class="service-status ${statusClass}">${statusText}</span>
        </div>
        <div class="service-meta">
          <span class="service-date">Fecha: ${fecha}</span>
          <span class="service-price">${precioFormateado}</span>
        </div>
        ${descripcion ? `<p class="service-description">${descripcion}</p>` : ''}
        <div class="service-actions">
          ${reviewButton}
          <a href="servicio.html?id=${service.id_servicio}" class="btn-small btn-details">Ver Detalles</a>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// TABS
// ===========================
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });
}

// ===========================
// EDITAR PERFIL
// ===========================
async function updateProfile(userData) {
  const user = checkAuth();
  if (!user) return;

  try {
    const updatedUser = await fetch(`/api/users/${user.id_usuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    }).then(response => response.json());
    setCurrentUser(updatedUser);
    showToast('Perfil actualizado exitosamente', 'success');
    displayUserData(updatedUser);
  } catch (error) {
    showToast(error.message || 'Error al actualizar perfil', 'error');
  }
}

// ===========================
// LOGOUT
// ===========================
function setCurrentUser(user) {
  window.localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
  window.localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadServices();
  setupTabs();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }
});
