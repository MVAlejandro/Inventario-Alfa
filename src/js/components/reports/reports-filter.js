// Servicios Supabase
import { getMovements } from '../../services/movements-service.js'; 
import { getCounts } from '../../services/counts-service.js';
import { renderStoreTable } from './reports-ind-table.js';
// Utilidades
import { loadOptions, loadOptionsFilter } from '../../utils/load-select.js';
import { obtainLastWeek } from '../../utils/last-week.js';

// Cargar valores en todos los filtros
document.addEventListener('DOMContentLoaded', async () => {
    const lastWeek = await obtainLastWeek();

    loadOptions('store-filter', 'inv_almacenes', 'id_almacen', 'nombre')
    loadOptionsFilter('week-filter', 'semana', "Seleccione...", lastWeek.semana);
    loadOptionsFilter('year-filter', 'anio', "Seleccione...", lastWeek.anio);
})

// Función de filtrado para reporte individual
export async function indReportFilter(event) {
    event.preventDefault();

    // Tomar valores de los selects
    const weekFilter = parseInt(document.getElementById('week-filter').value);
    const yearFilter = parseInt(document.getElementById('year-filter').value);
    const storeFilter = document.getElementById('store-filter').value;

    // Si no se selecciona una semana y un año generar tabla vacía
    if (!weekFilter || !yearFilter) {
        renderStoreTable([]);
        return;
    }

    // Obtener conteos
    const allCounts = await getCounts();
    if (!allCounts) return;

    // Filtrar por semana y año seleccionados
    const weeklyCounts = allCounts.filter(c => c.semana_conteo == weekFilter &&
                                               c.anio_conteo == yearFilter);
    // Si se selecciona un almacén, aplicarlo
    const filtered = weeklyCounts.filter(
        c => storeFilter === '0' || c.id_almacen == storeFilter
    );

    renderStoreTable(filtered);
}
