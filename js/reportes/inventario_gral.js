
import supabase from '../supabase/supabase-client.js'

export async function generarInventarioGral() {
    // Tomar valores de los selects
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaG').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioG').value);
    const filtroAlmacen = document.getElementById('almacenG').value;

    // Verificar si los filtros están vacíos
    if (!semanaSeleccionada && !anioSeleccionado) {
        generarTablaInventarioGral([]);
        return;
    }

    try {
        // Obtener productos del almacén seleccionado (si hay filtro)
        let productosAlmacen = [];
        if (filtroAlmacen && filtroAlmacen !== "0") {
            const { data: productos, error: errorProd } = await supabase
                .from('productos')
                .select('id_producto')
                .eq('id_almacen', parseInt(filtroAlmacen));
            
            if (errorProd) throw errorProd;
            productosAlmacen = productos.map(p => p.id_producto);
        }

        // Obtener todos los movimientos
        let queryMovs = supabase
            .from('movimientos')
            .select('tipo_movimiento, nombre_movimiento, cantidad, semana, anio, id_producto');

        const { data: movimientos, error: errorMov } = await queryMovs;
        if (errorMov) throw errorMov;

        // Obtener todos los conteos
        let queryConteos = supabase
            .from('conteos')
            .select('stock_real, semana_conteo, anio_conteo, id_producto');

        const { data: conteos, error: errorConteos } = await queryConteos;
        if (errorConteos) throw errorConteos;

        // Filtrar movimientos acumulados hasta la semana seleccionada y por almacén
        const movimientosAcumulados = movimientos.filter(m => {
            const semanaMov = parseInt(m.semana);
            const anioMov = parseInt(m.anio);
            
            // Filtro por fecha
            const cumpleFecha = anioMov < anioSeleccionado || 
                              (anioMov === anioSeleccionado && semanaMov <= semanaSeleccionada);
            
            // Filtro por almacén (si aplica)
            const cumpleAlmacen = productosAlmacen.length === 0 || 
                                productosAlmacen.includes(m.id_producto);
            
            return cumpleFecha && cumpleAlmacen;
        });

        // Filtrar conteos por semana y almacén
        const conteosFiltrados = conteos.filter(c => {
            const cumpleSemana = c.anio_conteo === anioSeleccionado && 
                               c.semana_conteo === semanaSeleccionada;
            
            const cumpleAlmacen = productosAlmacen.length === 0 || 
                                productosAlmacen.includes(c.id_producto);
            
            return cumpleSemana && cumpleAlmacen;
        });

        // Calcular sumatorias por tipo de movimiento
        const entradaAjuste = movimientosAcumulados
            .filter(m => m.nombre_movimiento === 'Entrada por ajuste')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const entradaCancelacion = movimientosAcumulados
            .filter(m => m.nombre_movimiento === 'Entrada por cancelacion')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const salidaNota = movimientosAcumulados
            .filter(m => m.nombre_movimiento === 'Salida por nota de venta')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const salidaAjuste = movimientosAcumulados
            .filter(m => m.nombre_movimiento === 'Salida por ajuste')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        // Total en sistema acumulado
        const totalSistema = (entradaAjuste + entradaCancelacion) - (salidaNota + salidaAjuste);

        // Total contado solo de la semana seleccionada
        const totalContado = conteosFiltrados.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        // Diferencia
        const diferencia = totalContado - totalSistema;

        // Calcular confiabilidad
        const confiabilidad = totalSistema > 0 ? (totalContado / totalSistema) * 100 : 0;

        // Crear el objeto de resumen
        const resumen = {
            entradaAjuste,
            entradaCancelacion,
            salidaNota,
            salidaAjuste,
            totalSistema,
            totalContado,
            diferencia,
            confiabilidad
        };

        // Generar tabla con el resumen
        generarTablaInventarioGral(resumen);

    } catch (error) {
        console.error('Error generando inventario:', error);
        generarTablaInventarioGral([]);
    }
}

function generarTablaInventarioGral(resumen) {
    const tbody = document.querySelector("#reporteGral_tabla tbody");
    tbody.innerHTML = "";

    // Si no hay datos
    if (!resumen || Object.keys(resumen).length === 0) {
        tbody.innerHTML = `<tr><td colspan="2">No hay datos en este rango</td></tr>`;
        return;
    }

    // Determinar clase CSS para la diferencia
    let claseDiferencia = '';
    if (resumen.diferencia > 0) {
        claseDiferencia = 'text-success'; // Verde para positivo
    } else if (resumen.diferencia < 0) {
        claseDiferencia = 'text-danger';  // Rojo para negativo
    } else {
        claseDiferencia = 'text-muted';   // Gris para cero
    }

    // Determinar clase CSS para la confiabilidad
    let claseConfiabilidad = '';
    if (resumen.confiabilidad >= 95) {
        claseConfiabilidad = 'text-success'; // Excelente (95-100%)
    } else if (resumen.confiabilidad >= 85) {
        claseConfiabilidad = 'text-warning'; // Bueno (85-94%)
    } else {
        claseConfiabilidad = 'text-danger';  // Bajo (<85%)
    }

    // Generar la tabla con el resumen por tipo de movimiento
    tbody.innerHTML = 
        `<tr>
            <td class="fw-bold">ENTRADAS POR AJUSTE</td>
            <td>${resumen.entradaAjuste}</td>
        </tr>
        <tr>
            <td class="fw-bold">ENTRADAS POR CANCELACIÓN</td>
            <td>${resumen.entradaCancelacion}</td>
        </tr>
        <tr>
            <td class="fw-bold">SALIDAS POR NOTA DE VENTA</td>
            <td>${resumen.salidaNota}</td>
        </tr>
        <tr>
            <td class="fw-bold">SALIDAS POR AJUSTE</td>
            <td>${resumen.salidaAjuste}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">TOTAL EN SISTEMA</td>
            <td class="fw-bold">${resumen.totalSistema}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">TOTAL CONTADO</td>
            <td class="fw-bold">${resumen.totalContado}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">DIFERENCIA</td>
            <td class="fw-bold ${claseDiferencia}">${resumen.diferencia}</td>
        </tr>
        <tr class="table-info">
            <td class="fw-bold">CONFIABILIDAD</td>
            <td class="fw-bold ${claseConfiabilidad}">${resumen.confiabilidad.toFixed(2)}%</td>
        </tr>`;
}
