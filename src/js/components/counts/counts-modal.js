import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { updateCount, deleteCount } from '../../services/counts-service.js'; 
import { renderCountsTable } from './counts-table.js'; 
// Utilidades
import { textValidate, amountValidate, inputValidate } from '../../utils/form-validations.js';

// Función para cargar datos en el modal
export async function renderCountsEditModal(conteo) {
    // Insertar valores en los inputs
    document.getElementById('edit-id-count').value = conteo.id_conteo;
    document.getElementById('edit-date').value = conteo.fecha_conteo;
    document.getElementById('edit-code').value = conteo.codigo;
    document.getElementById('edit-store').value = conteo.almacen;
    document.getElementById('edit-amount').value = conteo.stock_real;
    document.getElementById('edit-observations').value = conteo.observaciones;
}

// Función para guardar cambios
document.getElementById('btn-edit-entry').addEventListener('click', async function() {
    // Referencias para validación
    const cantidadIn = document.getElementById('edit-amount');
    const observacionesIn = document.getElementById('edit-observations');

    const cantidadError = document.getElementById('error-editAmount');
    const observacionesError = document.getElementById('error-editObservations');

    // Validaciones
    amountValidate(cantidadIn, cantidadError)
    textValidate(observacionesIn, observacionesError)

    const campos = document.querySelectorAll('input')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    const id_conteo = document.getElementById('edit-id-count').value;
    const updatedData = {
        stock_real: cantidadIn.value,
        observaciones: observacionesIn.value
    };

    try {
        await updateCount(id_conteo, updatedData);

        // Cerrar el modal y mostrar alerta
        bootstrap.Modal.getInstance(document.getElementById('edit-modal')).hide();
        alert('Conteo actualizado correctamente.');

        // Recarga la tabla con los datos actualizados
        await renderCountsTable();
    } catch (err) {
        console.error('Error al actualizar conteo:', err);
        alert('Ocurrió un error al actualizar el conteo.');
    }
});

// Eliminar entrada al dar click en el botón del modal
document.getElementById('btn-delete-entry').addEventListener('click', async () => {
    const idCount = document.getElementById('delete-id-count').value;
    await deleteCount(idCount);

    // Cerrar el modal y mostrar alerta
    bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
    alert('Conteo eliminado correctamente.');

    // Recarga la tabla con los datos actualizados
    await renderCountsTable();
});