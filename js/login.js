
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import supabase from './supabase/supabase-client.js'

// Crear evento al dar click en botón Siguiente
document.getElementById("btn_login").addEventListener("click", async function () {
    const email = document.getElementById("email_login").value;
    const password = document.getElementById("password_login").value;
    
    // Resetear errores
    document.getElementById('error-emailLog').textContent = '';
    document.getElementById('error-passwordLog').textContent = '';
    document.getElementById('email_login').classList.remove('is-invalid');
    document.getElementById('password_login').classList.remove('is-invalid');

    // Validaciones
    if (!email) {
        document.getElementById('error-emailLog').textContent = 'Por favor, ingrese su correo';
        document.getElementById('email_login').classList.add('is-invalid');
        return;
    }

    if (!password) {
        document.getElementById('error-passwordLog').textContent = 'Por favor, ingrese su contraseña';
        document.getElementById('password_login').classList.add('is-invalid');
        return;
    }

    try {
        this.innerHTML = 'Ingresando...';
        this.disabled = true;

        // Intentar login con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        // Redirigir si es exitoso
        window.location.replace("inventario.html");

    } catch (error) {
        let errorMessage = 'Error al iniciar sesión';
        
        switch (error.message) {
            case 'Invalid login credentials':
                errorMessage = 'Email o contraseña incorrectos';
                break;
            case 'Email not confirmed':
                errorMessage = 'Por favor confirma tu email primero';
                break;
            case 'Too many requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde';
                break;
        }

        document.getElementById('error-passwordLog').textContent = errorMessage;
        document.getElementById('password_login').classList.add('is-invalid');

    } finally {
        this.innerHTML = 'Ingresar';
        this.disabled = false;
    }
});
