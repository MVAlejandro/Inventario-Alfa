// Servicios Supabase
import { getProducts } from '../../services/product-service.js';
import { renderProductsTable } from './products-table.js';
// Utilidades
import { loadOptions } from '../../utils/load-select.js';

let allProducts = [];

// Cargar las opciones de filtrado al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    loadOptions('store-filter', 'inv_almacenes', 'id_almacen', 'nombre')
})

// Función de filtrado por valores seleccionados
export async function productsFilter(event) {
    event.preventDefault();

    const storeFilter = document.getElementById('store-filter').value;
    const searchText = document.getElementById('search-filter').value.trim().toLowerCase();

    // Obtener productos
    allProducts = await getProducts();
        if (!allProducts) return;

    // Si no hay filtros activos, mostrar todo
    const filterClean = storeFilter === '0' && searchText === '';

    if (filterClean) {
        renderProductsTable(allProducts);
        return;
    }

    // Aplicar filtros
    const filtered = allProducts.filter(p => {
        const searchOk =
            searchText === '' ||
            Object.values(p).some(valor => valor?.toString().toLowerCase().includes(searchText));

        const storeOk = storeFilter === '0' || p.id_almacen == storeFilter;
        return storeOk && searchOk;
    });

    renderProductsTable(filtered);
}
