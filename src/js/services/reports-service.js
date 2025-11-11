// Servicios Supabase
import { getMovements } from '../services/movements-service.js'; 
import { getCounts } from '../services/counts-service.js';

// Función para generar todos los resúmenes de movimientos y conteos
export async function generateGralSummaries() {
    // Obtener movimientos y conteos
    const allMovements = await getMovements();
        if (!allMovements) return;
    const allCounts = await getCounts();
        if (!allCounts) return;

    // Aplicar filtro de almacén para omitir la materia prima
    const countsFiltered = allCounts.filter(c => c.id_almacen !== 5);

    // Crear mapas por semana y año para agrupación de movimientos y conteos
    const countsMap = {};
    countsFiltered.forEach(c => {
        const key = `${c.anio_conteo}-${c.semana_conteo}`;
        if (!countsMap[key]) countsMap[key] = [];
        countsMap[key].push(c);
    });

    const movementsMap = {};
    allMovements.forEach(m => {
        const key = `${m.anio}-${m.semana}`;
        if (!movementsMap[key]) movementsMap[key] = [];
        movementsMap[key].push(m);
    });

    // Obtener lista de semanas únicas combinando conteos y movimientos
    const weeksSet = new Set();
    allMovements.forEach(m => weeksSet.add(`${m.anio}-${m.semana}`));
    allCounts.forEach(c => weeksSet.add(`${c.anio_conteo}-${c.semana_conteo}`));

    // Convertir string a objeto para su procesamiento por semana y año separado
    const weeksArray = Array.from(weeksSet)
        .map(s => {
            const [anio, semana] = s.split('-').map(Number);
            return { anio, semana };
        })
        .sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.semana - b.semana);

    // Función auxiliar para obtener la semana anterior
    const getPreviousWeek = (semana, anio) => {
        if (semana > 1) {
            return { semana: semana - 1, anio };
        } else {
            return { semana: 52, anio: anio - 1 };
        }  
    };

    const summaries = [];

    for (const { anio, semana } of weeksArray) {
        // Inventario inicial = suma de stock_real de la semana anterior
        const { semana: prevWeek, anio: prevYear } = getPreviousWeek(semana, anio);
        const previousCounts = countsMap[`${prevYear}-${prevWeek}`] || [];
        const initialInventory = previousCounts.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        // Movimientos de la semana actual y calcular total en sistema empezando con inventario inicial
        const weekMovements = movementsMap[`${anio}-${semana}`] || [];
        let totalSystem = initialInventory;

        weekMovements.forEach(m => {
            const qty = parseInt(m.cantidad);
            switch (m.tipo_movimiento) {
                case 'ENTRADA':
                case 'TRASPASO A MESAS':
                    totalSystem += qty;
                    break;
                case 'SALIDA POR FACTURA':
                case 'DESARME':
                case 'TRASPASO A COMEP':
                    totalSystem -= qty;
                    break;
            }
        });

        // Cantidades por tipo de movimiento
        const getQty = tipo => weekMovements
            .filter(m => m.tipo_movimiento === tipo)
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const entradas = getQty('ENTRADA');
        const salidasFactura = getQty('SALIDA POR FACTURA');
        const trasladosMesas = getQty('TRASPASO A MESAS');
        const desarme = getQty('DESARME');
        const trasladosComep = getQty('TRASPASO A COMEP');

        // Conteo real semana actual
        const currentCounts = countsMap[`${anio}-${semana}`] || [];
        const totalCounted = currentCounts.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        // Diferencia y confiabilidad
        const difference = totalCounted - totalSystem;
        const reliability = totalSystem > 0 ? (1 - Math.abs(difference) / totalSystem) * 100 : 0;

        // Guardar resumen
        summaries.push({
            anio,
            semana,
            inventarioInicial: initialInventory,
            entradas,
            salidasFactura,
            trasladosMesas,
            desarme,
            trasladosComep,
            totalSistema: totalSystem,
            totalContado: totalCounted,
            diferencia: difference,
            confiabilidad: parseFloat(reliability.toFixed(2))
        });
    }

    return summaries;
}
