
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import supabase from '../supabase/supabase-client.js'

// Función para validar sesión con Supabase
async function verificarAutenticacion() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Sesión actual:', session);

        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html') || currentPath === '/' || currentPath.endsWith('/');

        if (error) {
            console.error('Error verificando autenticación:', error);
            if (!isLoginPage) window.location.replace("login.html");
            return false;
        }

        // Si no hay sesión y no estamos en login redirigir ahí
        if (!session && !isLoginPage) {
            window.location.replace("login.html");
            return false;
        }

        // Si hay sesión y estamos en login redirigir al inicio
        if (session && isLoginPage) {
            window.location.replace("inventario.html");
            return true;
        }

        // Verificación de rol en páginas restringidas
        const paginasAdmin = ['productos.html', 'gestion.html', 'conteo.html'];
        const esPaginaAdmin = paginasAdmin.some(p => currentPath.includes(p));

        if (session && esPaginaAdmin) {
            // Obtener el perfil del usuario para ver su rol
            const { data: perfil, error: errorPerfil } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', session.user.id)
                .single();

            if (errorPerfil) {
                console.error('Error obteniendo perfil:', errorPerfil);
                window.location.replace("login.html");
                return false;
            }

            // Si no es admin, redirigir a página de acceso denegado o al menú
            if (perfil.rol !== 'admin') {
                alert('No tienes permisos para acceder a esta página.');
                window.location.replace("inventario.html");
                return false;
            }
        }

        return true;

    } catch (error) {
        console.error('Error verificando autenticación:', error);
        const isLoginPage = window.location.pathname.includes('login.html');
        if (!isLoginPage) {
            window.location.replace("login.html");
        }
        return false;
    }
}

async function ocultarContenidoParaUsuariosNormales() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: perfil, error } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return;
  }

  if (perfil.rol !== 'admin') {
    // Ocultar todos los elementos que tengan el atributo "data-admin-only"
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = 'none';
    });
    document.querySelectorAll('[data-colab-only]').forEach(el => {
      el.className = 'card col';
    });
  }
}

// Verificar al cargar cada página
document.addEventListener('DOMContentLoaded', async function () {
  if (typeof supabase !== 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 50));
    const accesoPermitido = await verificarAutenticacion();
    if (accesoPermitido) {
      await ocultarContenidoParaUsuariosNormales();
    }
  }
});
