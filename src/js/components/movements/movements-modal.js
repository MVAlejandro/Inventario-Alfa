import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { updateMovement, deleteMovement } from '../../services/movements-service.js'; 
import { renderMovementsTable } from './movements-table.js'; 
// Utilidades
import { textValidate, amountValidate, inputValidate } from '../../utils/form-validations.js';

// Función para cargar datos en el modal
export async function renderMovementsEditModal(movimiento) {
    // Insertar valores en los inputs
    document.getElementById('edit-id-movement').value = movimiento.id_movimiento;
    document.getElementById('edit-date').value = movimiento.fecha;
    document.getElementById('edit-type').value = movimiento.tipo_movimiento;
    document.getElementById('edit-amount').value = movimiento.cantidad;
    document.getElementById('edit-observations').value = movimiento.observaciones;
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

    const id_movimiento = document.getElementById('edit-id-movement').value;
    const updatedData = {
        cantidad: cantidadIn.value,
        observaciones: observacionesIn.value
    };

    try {
        await updateMovement(id_movimiento, updatedData);

        // Cerrar el modal y mostrar alerta
        bootstrap.Modal.getInstance(document.getElementById('edit-modal')).hide();
        alert('Movimiento actualizado correctamente.');

        // Recarga la tabla con los datos actualizados
        await renderMovementsTable();
    } catch (err) {
        console.error('Error al actualizar movimiento:', err);
        alert('Ocurrió un error al actualizar el movimiento.');
    }
});

// Eliminar entrada al dar click en el botón del modal
document.getElementById('btn-delete-entry').addEventListener('click', async () => {
    const idMovement = document.getElementById('delete-id-movement').value;
    await deleteMovement(idMovement);

    // Cerrar el modal y mostrar alerta
    bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
    alert('Movimiento eliminado correctamente.');

    // Recarga la tabla con los datos actualizados
    await renderMovementsTable();
});