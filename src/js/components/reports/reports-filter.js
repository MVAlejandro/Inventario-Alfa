// Servicios Supabase
import { getCounts } from '../../services/counts-service.js';
import { generateGralSummaries } from '../../services/reports-service.js';
import { renderStoreTable } from './reports-ind-table.js';
import { renderGralTable, renderDifference, renderReliability } from './reports-gral-table.js';
import { renderGralGraphic } from './reports-graphic.js';
// Utilidades
import { loadOptions, loadOptionsFilter } from '../../utils/load-select.js';
import { obtainLastWeek, buildWeeksByYear, weekNavigation } from '../../utils/week-functions.js';

let weeksByYear = {};
// Cargar valores en todos los filtros
document.addEventListener('DOMContentLoaded', async () => {
    const lastWeek = await obtainLastWeek();
    // Verificar que existen los elementos
    const storeFilterEl = document.getElementById('store-filter');
    const weekFilterEl = document.getElementById('week-filter');
    const yearFilterEl = document.getElementById('year-filter');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    // Cargar las opciones de los filtros
    if (storeFilterEl) await loadOptions('store-filter', 'inv_almacenes', 'id_almacen', 'nombre');
    if (weekFilterEl) await loadOptionsFilter('week-filter', 'semana', "Seleccione...", lastWeek.semana);
    if (yearFilterEl) await loadOptionsFilter('year-filter', 'anio', "Seleccione...", lastWeek.anio);
    
    // Construir las semanas disponibles por año
    weeksByYear = await buildWeeksByYear();

    // Generar los reportes iniciales
    if (storeFilterEl || weekFilterEl || yearFilterEl) {
        indReportFilter(new Event('load'));
        gralReportFilter(new Event('load'));
        renderGralGraphic(new Event('load'));
    }

    // Navegación de semanas si existen los elementos
    if (btnPrev) btnPrev.addEventListener('click', () => weekNavigation(-1, weeksByYear));
    if (btnNext) btnNext.addEventListener('click', () => weekNavigation(1, weeksByYear));
});
// Función de filtrado para reporte individual
export async function indReportFilter(event) {
    event.preventDefault();

    // Verificar que existen los elementos
    const yearFilterEl = document.getElementById('year-filter');
    const weekFilterEl = document.getElementById('week-filter');
    const storeFilterEl = document.getElementById('store-filter');

    if (!yearFilterEl || !weekFilterEl || !storeFilterEl) return;

    // Tomar valores de los selects
    const yearFilter = parseInt(yearFilterEl.value);
    const weekFilter = parseInt(weekFilterEl.value);
    const storeFilter = storeFilterEl.value;

    // Si no se selecciona una semana y un año generar tabla vacía
    if (!weekFilter || !yearFilter) {
        renderStoreTable([]);
        return;
    }

    // Obtener conteos
    const allCounts = await getCounts();
    if (!allCounts) return;

    // Filtrar por semana y año seleccionados
    const weeklyCounts = allCounts.filter(c => c.semana_conteo == weekFilter && c.anio_conteo == yearFilter);
    // Si se selecciona un almacén, aplicarlo
    const filtered = weeklyCounts.filter(c => storeFilter === '0' || c.id_almacen == storeFilter);

    renderStoreTable(filtered);
}

// Función de filtradogral por semana y año para reporte general
export async function gralReportFilter(event) {
    event.preventDefault();

    // Verificar que existen los elementos
    const weekFilterEl = document.getElementById('week-filter');
    const yearFilterEl = document.getElementById('year-filter');

    if (!weekFilterEl || !yearFilterEl) return;

    // Tomar valores de los selects
    const weekFilter = parseInt(weekFilterEl.value);
    const yearFilter = parseInt(yearFilterEl.value);

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
