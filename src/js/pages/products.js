// Estilos generales
import '../../css/style.css'
import '../../css/pages/products.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';
import '../components/products/generate-form.js'

// Servicios Supabase
import { initPage } from '../utils/session-validate.js'; 
import { addManualProduct, addExcelProduct } from '../components/products/products-form.js';
import { productsFilter } from '../components/products/products-filter.js';
import { renderProductsTable } from '../components/products/products-table.js';
import { renderProductsEditModal } from '../components/products/products-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
    await renderProductsTable();
    await initPage()
});

// Declarar el botón del formulario manual
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-manual' || e.target.closest('#btn-add-manual')) {
        addManualProduct(e);
    }
});

// Declarar el botón del formulario Excel
document.addEventListener('click', function(e) {
    if (e.target.id === 'btn-add-excel' || e.target.closest('#btn-add-excel')) {
        addExcelProduct(e);
    }
});

// Declarar el botón de filtrado
document.addEventListener('click', function(e) {
    if (e.target.id === 'filter-btn' || e.target.closest('#filter-btn')) {
        productsFilter(e);
    }
});

// Declarar los botones de editar
const editModal = document.getElementById('edit-modal');

editModal.addEventListener('shown.bs.modal', event => {
    const button = event.relatedTarget;
    const productData = JSON.parse(button.getAttribute('product-data'));
    renderProductsEditModal(productData);

    // Limpiar el modal al cerrarlo
    editModal.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('#edit-modal input').forEach(input => (input.value = ''));
    });
});

// Declarar los botones de eliminar
const deleteModal = document.getElementById('delete-modal');

deleteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const idProduct = button.dataset.id;
    document.getElementById('delete-id-product').value = idProduct;

    // Limpiar información al cerrar modal
    deleteModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('delete-id-product').value = '';
    });
});