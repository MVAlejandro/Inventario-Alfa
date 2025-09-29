
// IMPORTACIÓN DE FUNCIONES EXTERNAS
import { cargarAlmacenes, generarInventarioInd } from './reportes/inventario_almacen.js'
import { generarInventarioGral } from './reportes/inventario_gral.js'

// INVENTARIO POR ALMACEN
document.addEventListener('DOMContentLoaded', () => {
    cargarAlmacenes('almacenI');

    const btnGenerar = document.getElementById('btn_genI');
    btnGenerar.addEventListener('click', generarInventarioInd);
});

// INVENTARIO GENERAL
document.addEventListener('DOMContentLoaded', () => {
    const btnGenerar = document.getElementById('btn_genG');
    btnGenerar.addEventListener('click', generarInventarioGral);
});