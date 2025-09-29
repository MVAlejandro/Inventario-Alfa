
// Declaramos las expresiones regulares para validar los datos
const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Expresión regular para el nombre
const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,-]+$/; // Expresión regular para texto
const cantidadRegex = /^\d+(\.\d{1,2})?$/ // Expresión regular para las cantidades

// Función que valida que los códigos sean correctos
export function validarCodigo(data, error) {
    // Restablecer el mensaje de error y las clases antes de empezar
    error.textContent = '';
    data.classList.remove('is-invalid', 'is-valid');

    if ((data.value.length < 1) || (!textoRegex.test(data.value))) {
        error.textContent = `* Código inválido`;
        data.classList.add('is-invalid');
        return; 
    }

    data.classList.add('is-valid');
}

// Función que valida que los campos sean letras, números, "," y ".", y que haya al menos 3 caracteres
export function validarText(data, error) {
    // Restablecer el mensaje de error y las clases antes de empezar
    error.textContent = '';
    data.classList.remove('is-invalid', 'is-valid');

    if (data.value.length < 3) {
        error.textContent = `* Debe de tener al menos 3 caracteres`;
        data.classList.add('is-invalid');
        return; 
    }

    if (!textoRegex.test(data.value)) {
        error.textContent = `* No se aceptan caracteres especiales`;
        data.classList.add('is-invalid');
        return; 
    }

    data.classList.add('is-valid');
}

// Función que valida que los campos sean solo letras y que haya al menos 3 caracteres
export function validarNombre(data, error) {
    // Restablecer el mensaje de error y las clases antes de empezar
    error.textContent = '';
    data.classList.remove('is-invalid', 'is-valid');

    if (data.value.length < 3) {
        error.textContent = `* Debe de tener al menos 3 caracteres`;
        data.classList.add('is-invalid');
        return; 
    }

    if (!nombreRegex.test(data.value)) {
        error.textContent = `* No se aceptan caracteres especiales ni números`;
        data.classList.add('is-invalid');
        return; 
    }

    data.classList.add('is-valid');
}

// Función que valida que el costo sea válido
export function validarCantidad (costo, error){
    if(!cantidadRegex.test(costo.value)){
        error.textContent=`* La cantidad no es válida`;
        costo.classList.add('is-invalid');
        costo.classList.remove('is-valid');
    } else {
        error.textContent = '';
        costo.classList.remove('is-invalid');
        costo.classList.add('is-valid');
    }
}
