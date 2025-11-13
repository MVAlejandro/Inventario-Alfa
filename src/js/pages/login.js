// Estilos generales
import '../../css/style.css'
import '../../css/pages/login.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';

// Servicios Supabase
import supabase from '../supabase/supabase-client.js'

// Utilidades
import { emailValidate, passValidate, inputValidate } from '../utils/form-validations.js';

// Declarar el botón de Inicio de sesión
document.getElementById("btn-login").addEventListener("click", async function () {
    const form = document.getElementById('login-form');
    // Referencias para validación
    const emailIn = document.getElementById("email-login")
    const passwordIn = document.getElementById("password-login")
    // Referencias para errores
    const emailError = document.getElementById('error-emailLog')
    const passwordError = document.getElementById('error-passwordLog')

    // Validaciones
    emailValidate(emailIn, emailError)
    passValidate(passwordIn, passwordError)

    const campos = form.querySelectorAll('input')
    if (!inputValidate(campos)) {
        alert('Datos ingresados no válidos.')
        return
    }

    try {
        this.innerHTML = 'Ingresando...';
        this.disabled = true;

        // Intentar login con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailIn.value,
            password: passwordIn.value
        });

        if (error) {
            throw error;
        }

        // Redirigir si es exitoso
        window.location.replace("index.html");
        form.reset();
        return;

    } catch (error) {
        let errorMessage = 'Error al iniciar sesión';
        if (error.message?.includes('Invalid login credentials')) {
            errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = 'Por favor confirma tu email primero';
        } else if (error.message?.includes('Too many requests')) {
            errorMessage = 'Demasiados intentos. Intenta más tarde';
        } else {
            console.error(error);
        }

        document.getElementById('error-passwordLog').textContent = errorMessage;
        emailError.classList.add('is-invalid');
        passwordError.classList.add('is-invalid');

    } finally {
        this.innerHTML = 'Ingresar';
        this.disabled = false;
    }
});
