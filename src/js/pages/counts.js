// Estilos generales
import '../../css/style.css'
import '../../css/pages/counts.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';
import '../components/counts/generate-form.js'

// Servicios Supabase
import { initPage } from '../utils/session-validate.js'; 
import { addManualCount, addExcelCount } from '../components/counts/counts-form.js'
import { countsFilter } from '../components/counts/counts-filter.js';
import { renderCountsTable } from '../components/counts/counts-table.js';
import { renderCountsEditModal } from '../components/counts/counts-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
    await renderCountsTable();
    await initPage()
});

// Declarar el botón del formulario manual
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-manual' || e.target.closest('#btn-add-manual')) {
        addManualCount(e);
    }
});

// Declarar el botón del formulario Excel
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-excel' || e.target.closest('#btn-add-excel')) {
        addExcelCount(e);
    }
});

// Declarar el botón de filtrado
document.addEventListener('click', function(e) {
    if (e.target.id === 'filter-btn' || e.target.closest('#filter-btn')) {
        countsFilter(e);
    }
});

// Declarar los botones de editar
const editModal = document.getElementById('edit-modal');

editModal.addEventListener('shown.bs.modal', event => {
    const button = event.relatedTarget;
    const countData = JSON.parse(button.getAttribute('count-data'));
    renderCountsEditModal(countData);

    // Limpiar el modal al cerrarlo
    editModal.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('#edit-modal input').forEach(input => (input.value = ''));
    });
});

// Declarar los botones de eliminar
const deleteModal = document.getElementById('delete-modal');

deleteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const idCount = button.dataset.id;
    document.getElementById('delete-id-count').value = idCount;

    // Limpiar información al cerrar modal
    deleteModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('delete-id-count').value = '';
    });
});