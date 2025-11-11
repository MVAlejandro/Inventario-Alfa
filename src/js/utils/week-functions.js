import supabase from "../supabase/supabase-client.js";
// Servicios Supabase
import { getMovements } from "../services/movements-service.js";
import { indReportFilter, gralReportFilter } from "../components/reports/reports-filter.js";

// Función para obtener la última semana registrada de conteos
export async function obtainLastWeek() {
    const { data, error } = await supabase
        .from('inv_movimientos')
        .select('semana, anio')
        .order('anio', { ascending: false })
        .order('semana', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error obteniendo última semana:', error);
        return null;
    }

    return data?.[0] || null;
}

// Función para obtener las semanas disponibles por año
export async function buildWeeksByYear() {
    const allCounts = await getMovements();
    const weeksByYear = {};

    allCounts.forEach(c => {
        const { anio, semana } = c;
        if (!weeksByYear[anio]) weeksByYear[anio] = new Set();
        weeksByYear[anio].add(semana);
    });

    return weeksByYear;
}

export function weekNavigation(direction, weeksByYear) {
    const yearFilter = document.getElementById('year-filter');
    const weekFilter = document.getElementById('week-filter');

    let anio = parseInt(yearFilter.value);
    let semana = parseInt(weekFilter.value);

    if (!anio || !semana) return;

    const actualWeeks = Array.from(weeksByYear[anio]).sort((a, b) => a - b);
    const actualId = actualWeeks.indexOf(semana);
    const newId = actualId + direction;

    const updateContent = () => {
        // Simular "submit" para disparar el filtrado y renderizado
        gralReportFilter(new Event('submit')), indReportFilter(new Event('submit'))
    };

    // Movimiento dentro del mismo año
    if (newId >= 0 && newId < actualWeeks.length) {
        weekFilter.value = actualWeeks[newId];
        updateContent();
    }

    // Si retrocede más allá de la primera semana regresar al año anterior
    else if (newId < 0) {
        const orderedYears = Object.keys(weeksByYear).map(Number).sort((a, b) => a - b);
        const idxAnio = orderedYears.indexOf(anio);

        if (idxAnio > 0) {
            const newYear = orderedYears[idxAnio - 1];
            const newWeeksByYear = Array.from(weeksByYear[newYear]).sort((a, b) => a - b);

            yearFilter.value = newYear;
            setTimeout(() => {
                weekFilter.value = newWeeksByYear[newWeeksByYear.length - 1];
                updateContent();
            }, 100);
        }
    }

    // Si avanza más allá de la última semana pasar al siguiente año
    else if (newId >= actualWeeks.length) {
        const orderedYears = Object.keys(weeksByYear).map(Number).sort((a, b) => a - b);
        const idxAnio = orderedYears.indexOf(anio);

        if (idxAnio < orderedYears.length - 1) {
            const newYear = orderedYears[idxAnio + 1];
            const newWeeksByYear = Array.from(weeksByYear[newYear]).sort((a, b) => a - b);

            yearFilter.value = newYear;
            setTimeout(() => {
                weekFilter.value = newWeeksByYear[0];
                updateContent();
            }, 100);
        }
    }
}
