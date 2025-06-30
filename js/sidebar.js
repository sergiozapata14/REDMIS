import loginService from '../API/services/login.js';


document.addEventListener("DOMContentLoaded", function() {

    const userRole = loginService.getUserRole(); // Obtener el rol del usuario desde el servicio de autenticación
    const sidebarUser = 'sidebar.html';
    const sidebarAdmin = 'SidebarAdmin.html';

    if (userRole === 1) { 
        loadSidebar(sidebarAdmin);
    } else if (userRole === 2) { 
        loadSidebar(sidebarUser);
    } 
});

const loadSidebar = (sidebarPath) => {
  fetch(sidebarPath)
      .then(res => res.text())
      .then(html => {
          document.getElementById('sidebar').innerHTML = html;
          const path = window.location.pathname.split('/').pop();
          const links = document.querySelectorAll('.sidebar-menu-item');
          
          // Marcar enlaces normales como activos
          links.forEach(link => {
              if (link.getAttribute('href') === path) {
                  link.classList.add('active');
              }
          });

          // Verificar si estamos en una página del submenú Agregar
          const agregarPages = ['AgregarPais.html', 'AgregarEstado.html', 'AgregarUniversidad.html'];
          if (agregarPages.includes(path)) {
              const agregarMenu = document.querySelector('.sidebar-menu-with-submenu');
              if (agregarMenu) {
                  agregarMenu.classList.add('active');
              }
          }

          // Bloque de cierre de sesión
          const logout_btn = document.getElementById("logout-button");
          if (logout_btn) {
              logout_btn.addEventListener('click', async () => {
                  try {
                      const confirmation = confirm("¿Estás seguro de que deseas cerrar sesión?");
                      if (!confirmation) {
                          return; 
                      }
                      await loginService.logout();   
                      window.location.href = 'login.html';
                  } catch (error) {
                      console.error('Error al cerrar sesión:', error);
                  }
              });
          }

          // Script para el botón hamburguesa (modo responsivo)
            const hamburgerBtn = document.getElementById('hamburger-btn');
            const sidebar = document.querySelector('.sidebar');
            if (hamburgerBtn && sidebar) {
                hamburgerBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
            }
      })
      .catch(error => {
          console.error('Error loading sidebar:', error);
      });
}