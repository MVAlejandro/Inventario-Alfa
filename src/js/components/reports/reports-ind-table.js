
let allCounts = [];

// Función para crear la tabla general de movimientos
export async function renderStoreTable(countsParam = null) {
    // Obtener conteos de la lista filtrada
    if (countsParam) {
        allCounts = countsParam;
    }
    
    const tbody = document.querySelector('#store-report-table tbody');
    // Limpiar tabla antes de insertar
    tbody.innerHTML = '';

    if (!allCounts || allCounts.length === 0) {
        tbody.innerHTML = `<tr><td class="text-center" colspan="8">No hay conteos registrados</td></tr>`;
        return;
    }

    // Calcular totales
    const realStockTotal = allCounts.reduce((sum, c) => sum + c.stock_real, 0);

    // Generar filas de conteos por producto
    allCounts.forEach((conteo) => {
        tbody.innerHTML += 
        `<tr data-id-producto="${conteo.id_producto}">
            <td class="p-3 ps-4">
                <p class="report-week">Semana ${conteo.semana_conteo}</p>
                <p class="report-year">${conteo.anio_conteo}</p>
            </td>
            <td class="report-product p-3">${conteo.codigo}</td>
            <td class="report-description p-3">${conteo.descripcion}</td>
            <td class="report-store p-3">${conteo.almacen}</td>
            <td class="report-amount p-3">${conteo.stock_real.toLocaleString('en-US')}</td>
        </tr>`;
    });

    // Agregar fila de totales al final
    tbody.innerHTML += 
    `<tr class="table-active fw-bold">
        <td class="text-center" colspan="4">TOTALES</td>
        <td class="p-2">${realStockTotal.toLocaleString('en-US')}</td>
    </tr>`;
}