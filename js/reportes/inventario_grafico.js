
import supabase from '../supabase/supabase-client.js'
import { generarResumenInventarios } from './inventario_gral.js';

export async function generarEstadisticas() {
    try {
        // Obtener todos los resúmenes de inventarios
        const resumenes = await generarResumenInventarios();

        if (!resumenes.length) {
            const container = document.querySelector('#estadistica-container .canvas-container');
            container.innerHTML = '<div class="alert alert-info">No hay datos para mostrar con los filtros seleccionados</div>';
            return;
        }

        // Filtrar por año si se seleccionó alguno
        const anioSeleccionado = parseInt(document.getElementById('filtro_anioE').value);
        const datosFiltrados = anioSeleccionado
            ? resumenes.filter(r => r.anio === anioSeleccionado)
            : resumenes;

        // Ordenar por año y semana
        datosFiltrados.sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.semana - b.semana);

        // Preparar labels y datos para gráfico
        const labels = datosFiltrados.map(r => `Semana ${r.semana} / ${r.anio}`);
        const confiabilidadData = datosFiltrados.map(r => r.confiabilidad);

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
    }catch (error) {
        console.error('Error generando estadísticas:', error);
    }
}

export async function cargarFiltrosE(añoSel) {
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
