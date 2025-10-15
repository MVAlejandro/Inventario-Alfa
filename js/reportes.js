
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import { cargarFiltros, generarInventarioInd } from './reportes/inventario_almacen.js'
import { cargarFiltrosG, generarInventarioGral, cambiarSemana } from './reportes/inventario_gral.js'
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
let semanasPorAnioGlobal = {};

document.addEventListener('DOMContentLoaded', async () => {
    semanasPorAnioGlobal = await cargarFiltrosG('filtro_anioG', 'filtro_semanaG', 'almacenG');

    document.getElementById('btn_genG').addEventListener('click', function() {
        generarInventarioGral();
    });

    document.getElementById('btn_printG').addEventListener('click', function() {
        window.print();
    });

    // Botones de navegación de semana
    document.getElementById('btn_prev').addEventListener('click', () => cambiarSemana(-1, semanasPorAnioGlobal));
    document.getElementById('btn_next').addEventListener('click', () => cambiarSemana(1, semanasPorAnioGlobal));
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
