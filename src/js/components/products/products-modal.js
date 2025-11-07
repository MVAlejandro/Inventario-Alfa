import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { updateProduct, deleteProduct } from '../../services/products-service.js'; 
import { renderProductsTable } from './products-table.js'; 
// Utilidades
import { loadOptions } from '../../utils/load-select.js';
import { textValidate, codeValidate, inputValidate, selectValidate } from '../../utils/form-validations.js';

// Función para cargar datos en el modal
export async function renderProductsEditModal(producto) {
    // Insertar valores en los inputs
    document.getElementById('edit-id-product').value = producto.id_producto;
    document.getElementById('edit-code').value = producto.codigo;
    document.getElementById('edit-name').value = producto.nombre;
    loadOptions('edit-store', 'inv_almacenes', 'id_almacen', 'nombre', producto.id_almacen)
    document.getElementById('edit-description').value = producto.descripcion;
}

// Función para guardar cambios
document.getElementById('btn-edit-entry').addEventListener('click', async function() {
    // Referencias para validación
    const nombreIn = document.getElementById('edit-name');
    const codigoIn = document.getElementById('edit-code');
    const id_almacenIn = document.getElementById('edit-store');
    const descripcionIn = document.getElementById('edit-description');

    const nombreError = document.getElementById('error-editName');
    const codigoError = document.getElementById('error-editCode');
    const almacenError = document.getElementById('error-editStore');
    const descripcionError = document.getElementById('error-editDescription');

    // Validaciones
    textValidate(nombreIn, nombreError)
    codeValidate(codigoIn, codigoError)
    selectValidate(id_almacenIn, almacenError)
    textValidate(descripcionIn, descripcionError)

    const campos = document.querySelectorAll('input, select')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    const id_producto = document.getElementById('edit-id-product').value;
    const updatedData = {
        nombre: nombreIn.value,
        codigo: codigoIn.value,
        id_almacen: id_almacenIn.value,
        descripcion: descripcionIn.value
    };

    try {
        await updateProduct(id_producto, updatedData);

        // Cerrar el modal y mostrar alerta
        bootstrap.Modal.getInstance(document.getElementById('edit-modal')).hide();
        alert('Producto actualizado correctamente.');

        // Recarga la tabla con los datos actualizados
        await renderProductsTable();
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        alert('Ocurrió un error al actualizar el producto.');
    }
});

// Eliminar entrada al dar click en el botón del modal
document.getElementById('btn-delete-entry').addEventListener('click', async () => {
    const idProduct = document.getElementById('delete-id-product').value;
    await deleteProduct(idProduct);

    // Cerrar el modal y mostrar alerta
    bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
    alert('producto eliminado correctamente.');

    // Recarga la tabla con los datos actualizados
    await renderProductsTable();
});