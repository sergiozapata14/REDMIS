import loginService from '../API/services/login.js';

document.addEventListener('DOMContentLoaded', () => {
    const userRole = loginService.getUserRole(); 

    const tokenIsValid = loginService.validateToken();

    if (!tokenIsValid) {
        // Si el token no es válido, redirigir a la página de inicio de sesión
        window.location.href = 'login.html';
    }

    const adminRoutes = [
        'perfil_admin.html',
        'membresia.html',
        'solicitudes_membresias.html',
        'alta_admin.html',
        'estadisticas.html',
        'miembros.html',
        'visualizarCV.html',
        'visualizarMiembro.html',
        'alta_admin.html',
        'AgregarEstado.html',
        'AgregarPais.html',
        'AgregarUniversidad.html'
    ];

    const userRoutes = [
        'Perfil.html',
        'application_membership.html',
    ];

    const currentPath = window.location.pathname.split('/').pop(); 

    const isAdmin = userRole === 1
    const isUser = userRole === 2;

    // Verificar si el usuario es un administrador y redirigir a la página de administración si intenta acceder a una página de usuario
    if (isAdmin && userRoutes.includes(currentPath)) {
        // Pantalla en blanco para evitar el parpadeo
        document.body.innerHTML = ''; // Limpiar el contenido de la página
        window.location.href = 'miembros.html';
    }
    // Verificar si el usuario es un usuario y redirigir a la página de perfil si intenta acceder a una página de administración
    if (isUser && adminRoutes.includes(currentPath)) {
        // Pantalla en blanco para evitar el parpadeo
        document.body.innerHTML = ''; // Limpiar el contenido de la página
        window.location.href = 'Perfil.html';
    }

    // Verificar si el usuario está autenticado, de lo contrario redirigir a la página de inicio de sesión
    if(!loginService.isAuthenticated()) {
        window.location.href = 'login.html';
    } 

});