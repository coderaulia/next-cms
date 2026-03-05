// Vanaila Digital CMS — Modular Admin Entry Point
import { checkAuth, renderLogin } from './admin/modules/auth.js';
import { getSidebar, attachSidebarListeners } from './admin/modules/sidebar.js';
import { navigate, currentPage } from './admin/modules/router.js';
import './styles/main.css';
import './styles/admin.css';

function renderAdmin(user) {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
        <div class="admin-layout">
            ${getSidebar(user, currentPage)}
            <main class="admin-main" id="admin-main">
                <!-- Content injected by router -->
            </main>
        </div>
    `;

    // Initialize Sidebar
    attachSidebarListeners((page) => {
        navigate(page, {}, 'admin-main', () => {
            // Re-render sidebar to update active state
            const sidebarEl = document.querySelector('.admin-sidebar');
            if (sidebarEl) sidebarEl.outerHTML = getSidebar(user, currentPage);
            attachSidebarListeners((p) => navigate(p, {}, 'admin-main', updateSidebar));
        });
    });

    const updateSidebar = () => {
        const sidebarEl = document.querySelector('.admin-sidebar');
        if (sidebarEl) sidebarEl.outerHTML = getSidebar(user, currentPage);
        attachSidebarListeners((p) => navigate(p, {}, 'admin-main', updateSidebar));
    };

    // Initial Navigation
    navigate('dashboard', {}, 'admin-main', updateSidebar);
}

// Start Auth Check
checkAuth(
    (user) => renderAdmin(user),
    () => renderLogin('admin-app', (user) => renderAdmin(user))
);
