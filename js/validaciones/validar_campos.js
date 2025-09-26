
// Función para validar que ningún input es inválido
  // PONER EN CADA ARCHIVO QUE LA OCUPE =>    const campos = document.querySelectorAll('input');
export function validarCamposInvalidos(campos) {
    for (let campo of campos) {
        if (campo.classList.contains('is-invalid')) {
        return false;
        }
    }
    return true;
} 

// Validar que los inputs no vayan vacios
export function validarSelect(selectElement, errorElement) {
    const valor = selectElement.value;

    if (valor === '0') {
        selectElement.classList.add('is-invalid');
        selectElement.classList.remove('is-valid');
        if (errorElement) {
            errorElement.textContent = 'Se debe seleccionar una opción';
        }
        return false;
    } else {
        selectElement.classList.remove('is-invalid');
        selectElement.classList.add('is-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
        return true;
    }
}
