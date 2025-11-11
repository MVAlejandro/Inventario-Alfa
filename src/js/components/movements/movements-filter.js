// Servicios Supabase
import { getMovements } from '../../services/movements-service.js'; 
import { renderMovementsTable } from './movements-table.js';
// Utilidades
import { loadOptionsFilter } from '../../utils/load-select.js';

// Cargar las opciones de filtrado al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    loadOptionsFilter('week-filter', ['anio', 'semana'], "Todas");
    loadOptionsFilter('movement-filter', 'tipo_movimiento', "Todos");
})

// Función de filtrado por valores seleccionados
export async function movementsFilter(event) {
    event.preventDefault();

    const weekFilter = document.getElementById('week-filter').value;
    const movementFilter = document.getElementById('movement-filter').value;

    // Obtener movimientos
    const allMovements = await getMovements();
    if (!allMovements) return;

    // Si no hay filtros activos, mostrar todo
    const filterClean = weekFilter === '0' && movementFilter === '0';

    if (filterClean) {
        renderMovementsTable(allMovements);
        return;
    }

    // Aplicar filtros
    const filtered = allMovements.filter(m => {
        const weekOk = weekFilter === '0' || `${m.anio} - ${m.semana}` == weekFilter;
        const typeOk = movementFilter === '0' || m.tipo_movimiento == movementFilter;
        return weekOk && typeOk;
    });

    renderMovementsTable(filtered);
}
