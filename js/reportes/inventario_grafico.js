
import supabase from '../supabase/supabase-client.js'
import { cargarAlmacenes } from './inventario_almacen.js';

export async function generarEstadisticas() {
    // Tomar valores de los selects
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioE').value);
    const tipoVisualizacion = document.getElementById('tipo_visualizacion').value;

    // Obtener todos los movimientos y conteos que hay
    let queryConteos = supabase.from('conteos').select('semana_conteo, anio_conteo, stock_real, id_producto');
    let queryMovs = supabase.from('movimientos').select('tipo_movimiento, cantidad, semana, anio');

    if (anioSeleccionado) {
        queryConteos = queryConteos.eq('anio_conteo', anioSeleccionado);
        queryMovs = queryMovs.eq('anio', anioSeleccionado);
    }

    const { data: conteos, error: errorConteos } = await queryConteos;
    if (errorConteos) throw errorConteos;

    const { data: movimientos, error: errorMov } = await queryMovs;
    if (errorMov) throw errorMov;

    let labels = [];
    let confiabilidadData = [];

    if (tipoVisualizacion === 'semanas') {
        // Agrupar por semana
        const semanasMap = {};
        
        // Primero, calcular el stock del sistema acumulado por semana
        const movimientosPorSemana = {};
        
        // Ordenar movimientos por semana
        movimientos.sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.semana - b.semana;
        });

        // Calcular stock acumulado del sistema
        let stockSistemaAcumulado = 0;
        const semanasUnicas = new Set();
        
        movimientos.forEach(m => {
            // Ya no filtramos por almacén, mostramos todo

            const key = `${m.anio}-${m.semana}`;
            semanasUnicas.add(key);
            
            if (!movimientosPorSemana[key]) {
                movimientosPorSemana[key] = 0;
            }
            
            let val = parseInt(m.cantidad);
            switch (m.tipo_movimiento) {
                case 'ENTRADA': 
                case 'TRASPASO A MESAS':
                    movimientosPorSemana[key] += val;
                    break;
                case 'SALIDA POR FACTURA':
                case 'DESARME':
                case 'TRASPASO A COMEP':
                    movimientosPorSemana[key] -= val;
                    break;
            }
        });

        // Ahora procesar conteos y calcular confiabilidad
        conteos.forEach(c => {
            // Sin filtro por almacén
            const key = `${c.anio_conteo}-${c.semana_conteo}`;
            if (!semanasMap[key]) semanasMap[key] = { totalContado: 0, totalSistema: 0 };
            semanasMap[key].totalContado += parseInt(c.stock_real);
        });

        // Calcular stock del sistema acumulado para cada semana
        const semanasOrdenadas = Array.from(semanasUnicas).sort();
        let acumuladoSistema = 0;
        const sistemaPorSemana = {};
        
        semanasOrdenadas.forEach(semanaKey => {
            acumuladoSistema += movimientosPorSemana[semanaKey];
            sistemaPorSemana[semanaKey] = acumuladoSistema;
        });

        // Combinar conteos con sistema acumulado
        Object.keys(semanasMap).forEach(key => {
            if (sistemaPorSemana[key]) {
                semanasMap[key].totalSistema = sistemaPorSemana[key];
            }
        });

        // Preparar datos para gráfico por semanas
        Object.keys(semanasMap).sort().forEach(k => {
            labels.push(`Semana ${k.split('-')[1]}`);
            const { totalContado, totalSistema } = semanasMap[k];
            const valor = totalSistema ? (totalContado / totalSistema) * 100 : 0;
            confiabilidadData.push(parseFloat(valor.toFixed(2)));
        });
    } else if (tipoVisualizacion === 'meses') {
        // Agrupar por mes - usando aproximación basada en semanas
        const mesesMap = {};

        // Función para aproximar mes basado en semana (1-4: mes 1, 5-8: mes 2, etc.)
        const obtenerMesDeSemana = (semana) => {
            return Math.ceil(semana / 4.33); // Aproximación: ~4.33 semanas por mes
        };

        // Primero calcular movimientos acumulados por mes
        const movimientosPorMes = {};
        let stockSistemaAcumulado = 0;

        // Ordenar movimientos por fecha (año y semana)
        movimientos.sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.semana - b.semana;
        });

        // Calcular stock del sistema acumulado por mes
        movimientos.forEach(m => {
            const mes = obtenerMesDeSemana(m.semana);
            const key = `${m.anio}-${mes.toString().padStart(2, '0')}`;

            if (!movimientosPorMes[key]) {
                movimientosPorMes[key] = 0;
            }

            let val = parseInt(m.cantidad);
            switch (m.tipo_movimiento) {
                case 'ENTRADA': 
                case 'TRASPASO A MESAS':
                    movimientosPorMes[key] += val;
                    break;
                case 'SALIDA POR FACTURA':
                case 'DESARME':
                case 'TRASPASO A COMEP':
                    movimientosPorMes[key] -= val;
                    break;
            }
        });

        // Calcular acumulado por mes
        const mesesOrdenados = Object.keys(movimientosPorMes).sort();
        let acumuladoSistema = 0;
        const sistemaPorMes = {};

        mesesOrdenados.forEach(mesKey => {
            acumuladoSistema += movimientosPorMes[mesKey];
            sistemaPorMes[mesKey] = acumuladoSistema;
        });

        // Procesar conteos por mes
        conteos.forEach(c => {
            // Ya no filtramos por almacén
            const mes = obtenerMesDeSemana(c.semana_conteo);
            const key = `${c.anio_conteo}-${mes.toString().padStart(2, '0')}`;
            if (!mesesMap[key]) mesesMap[key] = { totalContado: 0, totalSistema: 0 };
            mesesMap[key].totalContado += parseInt(c.stock_real);
            
            // Asignar el sistema acumulado para este mes
            if (sistemaPorMes[key]) {
                mesesMap[key].totalSistema = sistemaPorMes[key];
            }
        });

        // Nombres de meses para las etiquetas
        const nombresMeses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        // Preparar datos para gráfico por meses
        Object.keys(mesesMap).sort().forEach(k => {
            const [anio, mes] = k.split('-');
            const mesNumero = parseInt(mes);
            if (mesNumero >= 1 && mesNumero <= 12) {
                labels.push(`${nombresMeses[mesNumero - 1]} ${anio}`);
                const { totalContado, totalSistema } = mesesMap[k];
                const valor = totalSistema ? (totalContado / totalSistema) * 100 : 0;
                confiabilidadData.push(parseFloat(valor.toFixed(2)));
            }
        });
    }

    // Si no hay datos, mostrar mensaje
    if (labels.length === 0) {
        const container = document.querySelector('#estadistica-container .canvas-container');
        container.innerHTML = 
        '<div class="alert alert-info">No hay datos para mostrar con los filtros seleccionados</div>';
        return;
    }

    // Dibujar chart
    const container = document.querySelector('#estadistica-container .canvas-container');
    container.innerHTML = '<canvas id="graficoLineas"></canvas>';
    const ctx = document.getElementById('graficoLineas').getContext('2d');

    const tituloEjeX = tipoVisualizacion === 'semanas' ? 'Semanas' : 'Meses';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confiabilidad',
                data: confiabilidadData,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 120,
                    title: { display: true, text: 'Confiabilidad (%)' }
                },
                x: {
                    title: { display: true, text: tituloEjeX }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%`
                    }
                }
            }
        }
    });
}

export async function cargarFiltrosE(añoSel, almacenSel) {
    const { data: conteos, error } = await supabase
        .from('conteos')
        .select('anio_conteo');

    if (error) {
        console.error('Error cargando años:', error);
        return;
    }

    // Obtener años únicos
    const añosUnicos = [...new Set(conteos.map(c => c.anio_conteo))];
    const selectAnio = document.getElementById(añoSel);

    // Llenar select de años
    selectAnio.innerHTML = '<option value="0">Seleccione...</option>';
    añosUnicos
        .sort((a, b) => b - a) // orden descendente
        .forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        });
}
