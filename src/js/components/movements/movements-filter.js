// Servicios Supabase
import { getMovements } from '../../services/movements-service.js'; 
import { renderMovementsTable } from './movements-table.js';

async function loadOptionsFilter(selectId, fields) {
    const select = document.getElementById(selectId)
    if (!select) return;
    select.innerHTML = '';
    
    // Obtener movimientos
    const allMovements = await getMovements();
    if (!allMovements) return;

    const opciones = allMovements.map(m => {
        if (Array.isArray(fields)) {
            // Combinar varios campos
            return fields.map(f => m[f]).filter(Boolean).join(' - ');
        } else {
            // Solo un campo
            return m[fields];
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
    loadOptionsFilter('week-filter', ['anio', 'semana']);
    loadOptionsFilter('movement-filter', 'tipo_movimiento');
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
