// Servicios Supabase
import { generateGralSummaries } from '../../services/reports-service.js';

let allSummaries = [];

// Función para crear el gráfico de confiabilidad
export async function renderGralGraphic() {
    // Obtener allSummarieses de la lista filtrada
    allSummaries = await generateGralSummaries();
    
    const container = document.getElementById("canvas-container");
    // Limpiar antes de insertar
    container.innerHTML = "";

    if (!allSummaries || Object.keys(allSummaries).length === 0) {
        container.innerHTML = `<div class="alert alert-info">No hay datos para mostrar con los filtros seleccionados</div>`;
        return;
    }

    // Preparar labels y datos para gráfico
    const labels = allSummaries.map(s => `Semana ${s.semana}`);
    const reliabilityData = allSummaries.map(s => s.confiabilidad);

    // Generar el gráfico con la información del reporte
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
                data: reliabilityData,
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