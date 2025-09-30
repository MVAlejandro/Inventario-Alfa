
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import { cargarFiltrosI, generarInventarioInd } from './reportes/inventario_almacen.js'
import { cargarFiltrosG, generarInventarioGral } from './reportes/inventario_gral.js'

// INVENTARIO POR ALMACEN
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosI()

    const btnGenerar = document.getElementById('btn_genI');
    btnGenerar.addEventListener('click', generarInventarioInd);
});

// INVENTARIO GENERAL
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosG()

    const btnGenerar = document.getElementById('btn_genG');
    btnGenerar.addEventListener('click', generarInventarioGral);
});