// Estilos generales
import '../../css/style.css'
import '../../css/pages/movements.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';
import '../components/movements/generate-form.js'

// Servicios Supabase
import { initPage } from '../utils/session-validate.js'; 
import { addManualMovement, addExcelMovement } from '../components/movements/movements-form.js'
import { movementsFilter } from '../components/movements/movements-filter.js';
import { renderMovementsTable } from '../components/movements/movements-table.js';
import { renderMovementsEditModal } from '../components/movements/movements-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
    await renderMovementsTable();
    await initPage()
});

// Declarar el botón del formulario manual
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-manual' || e.target.closest('#btn-add-manual')) {
        addManualMovement(e);
    }
});

// Declarar el botón del formulario Excel
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-excel' || e.target.closest('#btn-add-excel')) {
        addExcelMovement(e);
    }
});

// Declarar el botón de filtrado
document.addEventListener('click', function(e) {
    if (e.target.id === 'filter-btn' || e.target.closest('#filter-btn')) {
        movementsFilter(e);
    }
});

// Declarar los botones de editar
const editModal = document.getElementById('edit-modal');

editModal.addEventListener('shown.bs.modal', event => {
    const button = event.relatedTarget;
    const movementData = JSON.parse(button.getAttribute('movement-data'));
    renderMovementsEditModal(movementData);

    // Limpiar el modal al cerrarlo
    editModal.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('#edit-modal input').forEach(input => (input.value = ''));
    });
});

// Declarar los botones de eliminar
const deleteModal = document.getElementById('delete-modal');

deleteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const idMovement = button.dataset.id;
    document.getElementById('delete-id-movement').value = idMovement;

    // Limpiar información al cerrar modal
    deleteModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('delete-id-movement').value = '';
    });
});