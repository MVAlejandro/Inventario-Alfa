// Servicios Supabase
import { getProducts } from '../../services/product-service.js';

const perPage = 15;
let currentPage = 1;
let allProducts = [];

// Función para crear la tabla y la paginación
export async function renderProductsTable(productsParam = null) {
    // Obtener productos si no se pasa una lista filtrada
    if (productsParam) {
        allProducts = productsParam;
    } else {
        allProducts = await getProducts();
    }
    
    const tbody = document.querySelector('#products-table tbody');
    const pagination = document.querySelector('#products-pages .pagination');
    const resultsText = document.getElementById('products-pages-results');

    // Calcular productos de la página actual
    const pageStart = (currentPage - 1) * perPage;
    const pageEnd = pageStart + perPage;
    const products = allProducts.slice(pageStart, pageEnd);

    // Limpiar tabla antes de insertar
    tbody.innerHTML = '';

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td class="text-center" colspan="8">No hay productos registrados</td></tr>`;
        resultsText.textContent = `Mostrando 0 de ${allProducts.length} resultados`;
        pagination.innerHTML = '';
        return;
    }

    products.forEach(producto => {
        tbody.innerHTML += 
        `<tr>
            <td class="p-3 ps-4">
                <p class="product-name">${producto.nombre}</p>
                <p class="product-description">${producto.descripcion}</p>
            </td>
            <td class="product-code p-3">${producto.codigo}</td>
            <td class="product-store p-3">${producto.almacen}</td>
            <td class="product-controls text-pageEnd p-3 pe-4">
                <div class="action-buttons">
                    <button class="btn btn-edit" 
                        data-bs-target="#edit-modal" 
                        data-bs-toggle="modal"
                        product-data='${JSON.stringify(producto)}'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                        </svg>
                    </button>
                    <button class="btn btn-delete" 
                        data-bs-target="#delete-modal" 
                        data-bs-toggle="modal"
                        data-id='${producto.id_producto}'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    // Actualizar texto de resultados
    const total = allProducts.length;
    resultsText.textContent = `Mostrando ${Math.min(pageStart + 1, total)} a ${Math.min(pageEnd, total)} de ${total} resultados`;

    // Crear paginación
    const totalPages = Math.ceil(total / perPage);
    pagination.innerHTML = '';

    // Botón Anterior
    pagination.innerHTML += 
        `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}" data-page="prev">
            <a class="page-link" href="#">&laquo;</a>
        </li>`;

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += 
        `<li class="page-item ${i === currentPage ? 'active' : ''}" data-page="${i}">
            <a class="page-link" href="#">${i}</a>
        </li>`;
    }

    // Botón Siguiente
    pagination.innerHTML += 
        `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="next">
            <a class="page-link" href="#">&raquo;</a>
        </li>`;

    // Añadir los eventos de clic a la paginación
    pagination.querySelectorAll('.page-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const type = item.dataset.page;

            if (type === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (type === 'next' && currentPage < totalPages) {
                currentPage++;
            } else if (!isNaN(parseInt(type))) {
                currentPage = parseInt(type);
            }

            renderProductsTable();
        });
    });
}