
import supabase from '../supabase/supabase-client.js'

export async function generarEstadisticas() {
    // Tomar valores de los selects
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioE').value);

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

    // Agrupar por semana
    const semanasMap = {};
        
    // Calcular el stock del sistema acumulado por semana
    const movimientosPorSemana = {};
        
    // Ordenar movimientos por semana
    movimientos.sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return a.semana - b.semana;
    });

    // Calcular stock acumulado del sistema
    const semanasUnicas = new Set();
        
    movimientos.forEach(m => {

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

    // Procesar conteos y calcular confiabilidad
    conteos.forEach(c => {
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

    const tituloEjeX = 'Semanas'

    // Registrar el plugin si es necesario
    Chart.register(ChartDataLabels);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confiabilidad',
                data: confiabilidadData,
                borderColor: '#8FC74A',
                backgroundColor: '#7B7B7B',
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    color: '#000',
                    align: 'top',
                    anchor: 'end',
                    formatter: (value) => `${value}%`
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 140,
                    title: { display: true, text: 'Confiabilidad (%)' }
                },
                x: {
                    title: { display: true, text: tituloEjeX }
                }
            }
        },
        plugins: [ChartDataLabels]
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
