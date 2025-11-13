// Servicios supabase
import { getSession, getUserRole } from "../services/login-service";

// Función para validar sesión con Supabase
async function validateAuth() {
    try {
        const session = await getSession();
        console.log('Sesión actual:', session);

        const currentPath = window.location.pathname.split('/').pop();
        const isLoginPage = currentPath === 'login.html' || currentPath === ''; 

        // Si no hay sesión y la ruta no es el login redirigir ahí
        if (!session && !isLoginPage) {
            window.location.replace("/src/pages/login.html");
            return false;
        }

        // Si hay sesión y la ruta es login redirigir al inicio
        if (session && isLoginPage) {
            window.location.replace("/index.html");
            return true;
        }

        return true;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        const currentPath = window.location.pathname.split('/').pop();
        const isLoginPage = currentPath === 'login.html';

        if (!isLoginPage) {
            window.location.replace("/src/pages/login.html");
        }
        return false;
    }
}

// Función para validar el rol del usuario
async function validateUserRole() {
    try {
        // Si no hay sesión, no hacer nada
        const session = await getSession();
        if (!session) return;

        // Obtener el rol "admin", "colab", etc.
        const rol = await getUserRole(session);
        if (!rol) return;

        if (rol !== 'admin') {
            // Ocultar todos los elementos que tengan el atributo "data-admin-only"
            document.querySelectorAll('[data-admin-only]').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });

            // Mostrar los elementos "data-colab-only"
            document.querySelectorAll('[data-colab-only]').forEach(el => {
                el.style.setProperty('display', 'block', 'important');
            });
        }

    } catch (error) {
        console.error('Error validando rol del usuario:', error);
    }
}

// Verificar al cargar cada página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Espera a que Supabase esté listo
        if (typeof supabase !== 'undefined') {
            // Validar autenticación
            const accessOk = await validateAuth();

            // Validar rol solo si hay acceso
            if (accessOk) {
                await validateUserRole();
            }
        }
    } catch (error) {
        console.error('Error al inicializar la página:', error);
    }
});

// Función para validar todo
export async function initPage() {
    const accessOk = await validateAuth();
    if (accessOk) await validateUserRole();
}