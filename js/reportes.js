
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import { cargarFiltrosI, generarInventarioInd } from './reportes/inventario_almacen.js'
import { cargarFiltrosG, generarInventarioGral } from './reportes/inventario_gral.js'
import { cargarFiltrosE, generargraficoLineasstadisticas } from './reportes/inventario_grafico.js'

// INVENTARIO POR ALMACEN
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosI('filtro_anioI', 'filtro_semanaI', 'almacenI')

    const btnGenerar = document.getElementById('btn_genI');
    btnGenerar.addEventListener('click', generarInventarioInd);
});

// INVENTARIO GENERAL
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosG()

    const btnGenerar = document.getElementById('btn_genG');
    btnGenerar.addEventListener('click', generarInventarioGral);
});

// GRÁFICO DE REPORTE
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosE('filtro_anioE', 'almacenE')

    const btnGenerar = document.getElementById('btn_genE');
    btnGenerar.addEventListener('click', generargraficoLineasstadisticas);
});
