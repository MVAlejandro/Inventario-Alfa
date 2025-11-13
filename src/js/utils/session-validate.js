// Servicios supabase
import { getSession, getUserRole } from "../services/login-service";

// Función para validar sesión con Supabase con expiración por tiempo
async function validateAuth() {
    try {
        const session = await getSession();
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const isLoginPage = currentPath === 'login.html';

        // Sin sesión → redirigir a login si no estamos en login
        if (!session && !isLoginPage) {
            console.log("No hay sesión, redirigiendo a login...");
            window.location.href = "./login.html"; // ruta absoluta con extensión
            return false;
        }

        // Sesión expirada
        const SESSION_DURATION_HOURS = 16;
        const loginTimestamp = localStorage.getItem('loginTimestamp');
        if (loginTimestamp) {
            const elapsed = Date.now() - parseInt(loginTimestamp, 10);
            const hoursElapsed = elapsed / (1000 * 60 * 60);
            if (hoursElapsed > SESSION_DURATION_HOURS) {
                console.log("Sesión expirada automáticamente.");
                await supabase.auth.signOut();
                localStorage.removeItem('loginTimestamp');

                if (!isLoginPage) {
                    window.location.href = "./login.html";
                }
                return false;
            }
        }

        // Con sesión → redirigir a index si estamos en login
        if (session && isLoginPage) {
            console.log("Sesión activa, redirigiendo a index...");
            window.location.href = "./index.html";
            return true;
        }

        return true;

    } catch (error) {
        console.error('Error verificando autenticación:', error);
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath !== 'login.html') {
            window.location.href = "./login.html";
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