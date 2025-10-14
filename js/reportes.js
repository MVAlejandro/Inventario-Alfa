
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import { cargarFiltros, generarInventarioInd } from './reportes/inventario_almacen.js'
import { cargarFiltrosG, generarInventarioGral } from './reportes/inventario_gral.js'
import { cargarFiltrosE, generarEstadisticas } from './reportes/inventario_grafico.js'

// INVENTARIO POR ALMACEN
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltros('filtro_anioI', 'filtro_semanaI', 'almacenI')

    document.getElementById('btn_genI').addEventListener('click', function() {
        generarInventarioInd()
    });

    document.getElementById('btn_printI').addEventListener('click', function() {
        window.print();
    });
});

// INVENTARIO GENERAL
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosG('filtro_anioG', 'filtro_semanaG', 'almacenG')

    document.getElementById('btn_genG').addEventListener('click', function() {
        generarInventarioGral()
    });

    document.getElementById('btn_printG').addEventListener('click', function() {
        window.print();
    });
});

// GRÁFICO DE REPORTE
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosE('filtro_anioE', 'almacenE')

    document.getElementById('btn_genE').addEventListener('click', function() {
        generarEstadisticas()
    });

    document.getElementById('btn_printE').addEventListener('click', function() {
        window.print();
    });
});
