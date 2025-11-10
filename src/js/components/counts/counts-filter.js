// Servicios Supabase
import { getCounts } from '../../services/counts-service.js'; 
import { renderCountsTable } from './counts-table.js'; 
// Utilidades
import { loadOptions } from '../../utils/load-select.js';

async function loadOptionsFilter(selectId, fields) {
    const select = document.getElementById(selectId)
    if (!select) return;
    select.innerHTML = '';
    
    // Obtener conteos
    const allCounts = await getCounts();
    if (!allCounts) return;

    const opciones = allCounts.map(c => {
        if (Array.isArray(fields)) {
            // Combinar varios campos
            return fields.map(f => c[f]).filter(Boolean).join(' - ');
        } else {
            // Solo un campo
            return c[fields];
        }
    });

    // Eliminar duplicados y valores vacíos
    const opcionesUnicas = [...new Set(opciones)].filter(v => v);

    // Agregar opciones al select
    select.innerHTML = '<option value="0">Todos</option>';
    opcionesUnicas.forEach(opcion => {
        const optionEl = document.createElement('option');
        optionEl.value = opcion;
        optionEl.textContent = opcion;
        select.appendChild(optionEl);
    });
}

// Cargar las opciones de filtrado al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    loadOptionsFilter('week-filter', ['anio_conteo', 'semana_conteo']);
    loadOptionsFilter('code-filter', 'codigo');
    loadOptions('store-filter', 'inv_almacenes', 'id_almacen', 'nombre')
})

// Función de filtrado por valores seleccionados
export async function countsFilter(event) {
    event.preventDefault();

    const weekFilter = document.getElementById('week-filter').value;
    const codeFilter = document.getElementById('code-filter').value;
    const storeFilter = document.getElementById('store-filter').value;

    // Obtener movimientos
    const allCounts = await getCounts();
    if (!allCounts) return;

    // Si no hay filtros activos, mostrar todo
    const filterClean = weekFilter === '0' && codeFilter === '0' && storeFilter === '0';

    if (filterClean) {
        renderCountsTable(allCounts);
        return;
    }

    // Aplicar filtros
    const filtered = allCounts.filter(c => {
        const weekOk = weekFilter === '0' || `${c.anio_conteo} - ${c.semana_conteo}` == weekFilter;
        const typeOk = codeFilter === '0' || c.codigo == codeFilter;
        const storeOk = storeFilter === '0' || c.id_almacen == storeFilter;
        return weekOk && typeOk && storeOk;
    });

    renderCountsTable(filtered);
}
