// Servicios Supabase
import { getCounts } from '../../services/counts-service.js';
import { generateGralSummaries } from '../../services/reports-service.js';
import { renderStoreTable } from './reports-ind-table.js';
import { renderGralTable, renderDifference, renderReliability } from './reports-gral-table.js';
// Utilidades
import { loadOptions, loadOptionsFilter } from '../../utils/load-select.js';
import { obtainLastWeek, buildWeeksByYear, weekNavigation } from '../../utils/week-functions.js';

let weeksByYear = {};
// Cargar valores en todos los filtros
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar las opciones de los filtros
    const lastWeek = await obtainLastWeek();
    await loadOptions('store-filter', 'inv_almacenes', 'id_almacen', 'nombre');
    await loadOptionsFilter('week-filter', 'semana', "Seleccione...", lastWeek.semana);
    await loadOptionsFilter('year-filter', 'anio', "Seleccione...", lastWeek.anio);

    // Construir las semanas disponibles por año
    weeksByYear = await buildWeeksByYear();

    // Generar los reportes iniciales
    indReportFilter(new Event('load'));
    gralReportFilter(new Event('load'));

    // Navegación de semanas
    document.getElementById('btn-prev').addEventListener('click', () =>
        weekNavigation(-1, weeksByYear)
    );
    document.getElementById('btn-next').addEventListener('click', () =>
        weekNavigation(1, weeksByYear)
    );
});
// Función de filtrado para reporte individual
export async function indReportFilter(event) {
    event.preventDefault();

    // Tomar valores de los selects
    const yearFilter = parseInt(document.getElementById('year-filter').value);
    const weekFilter = parseInt(document.getElementById('week-filter').value);
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

// Función de filtradogral por semana y año para reporte general
export async function gralReportFilter(event) {
    event.preventDefault();

    // Tomar valores de los selects
    const weekFilter = parseInt(document.getElementById('week-filter').value);
    const yearFilter = parseInt(document.getElementById('year-filter').value);

    // Si no se selecciona una semana y un año generar tabla vacía
    if (!weekFilter || !yearFilter) {
        renderGralTable([]);
        return;
    }

    // Obtener el resumen de movimientos y conteos
    const allSummaries = await generateGralSummaries();

    // Filtrar por semana y año seleccionados
    const filtered = allSummaries.filter(s => s.semana === weekFilter && s.anio === yearFilter);

    renderGralTable(filtered[0] || {});
    renderDifference(filtered[0] || {});
    renderReliability(filtered[0] || {});
}
