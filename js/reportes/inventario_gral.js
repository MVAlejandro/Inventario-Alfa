
import supabase from '../supabase/supabase-client.js'

export async function generarInventarioGral() {
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaG').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioG').value);

    if (!semanaSeleccionada && !anioSeleccionado) {
        generarTablaInventarioGral([]);
        return;
    }

    try {
        // Obtener productos
        let productosAlmacen = [];
        const { data: productos, error: errorProd } = await supabase
            .from('productos')
            .select('id_producto');

        if (errorProd) throw errorProd;

        productosAlmacen = productos.map(p => p.id_producto);

        // Obtener movimientos
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('tipo_movimiento, cantidad, semana, anio');

        if (errorMov) throw errorMov;

        // Obtener conteos
        const { data: conteos, error: errorConteos } = await supabase
            .from('conteos')
            .select('stock_real, semana_conteo, anio_conteo, id_producto');

        if (errorConteos) throw errorConteos;

        // Ordenar movimientos cronológicamente
        const movimientosOrdenados = movimientos
            .map(m => ({
                ...m,
                semana: parseInt(m.semana),
                anio: parseInt(m.anio),
                cantidad: parseInt(m.cantidad)
            }))
            .sort((a, b) => {
                if (a.anio === b.anio) return a.semana - b.semana;
                return a.anio - b.anio;
            });

        // Inicializar totalSistema
        let totalSistema = 0;

        // Registrar los movimientos solo de la semana seleccionada para el resumen
        const movimientosSemanaSeleccionada = [];

        for (const mov of movimientosOrdenados) {
            const { tipo_movimiento, cantidad, semana, anio } = mov;

            // Saltar movimientos futuros
            if (anio > anioSeleccionado || (anio === anioSeleccionado && semana > semanaSeleccionada)) {
                break;
            }

            // Aplicar al totalSistema
            if (['ENTRADA', 'TRASPASO A MESAS'].includes(tipo_movimiento)) {
                totalSistema += cantidad;
            } else if (['SALIDA POR FACTURA', 'DESARME', 'TRASPASO A COMEP'].includes(tipo_movimiento)) {
                totalSistema -= cantidad;
            }

            // Si es la semana seleccionada, guardar para el resumen
            if (anio === anioSeleccionado && semana === semanaSeleccionada) {
                movimientosSemanaSeleccionada.push(mov);
            }
        }

        // Calcular resumen por tipo para la semana seleccionada
        const getCantidad = tipo => {
            const filtered = movimientosSemanaSeleccionada.filter(m => m.tipo_movimiento === tipo);
            return filtered.reduce((sum, m) => sum + m.cantidad, 0);
        };

        const entradas = getCantidad('ENTRADA');
        const salidasFactura = getCantidad('SALIDA POR FACTURA');
        const trasladosMesas = getCantidad('TRASPASO A MESAS');
        const desarme = getCantidad('DESARME');
        const trasladosComep = getCantidad('TRASPASO A COMEP');

        // Calcular totalContado (solo semana seleccionada)
        const conteosFiltrados = conteos.filter(c =>
            c.anio_conteo === anioSeleccionado && c.semana_conteo === semanaSeleccionada
        );

        const totalContado = conteosFiltrados.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        const diferencia = totalContado - totalSistema;
        const confiabilidad = totalSistema > 0 ? (totalContado / totalSistema) * 100 : 0;

        const resumen = {
            entradas,
            salidasFactura,
            trasladosMesas,
            desarme,
            trasladosComep,
            totalSistema,
            totalContado,
            diferencia,
            confiabilidad
        };

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
            <td class="fw-bold">ENTRADAS</td>
            <td>${resumen.entradas}</td>
        </tr>
        <tr>
            <td class="fw-bold">SALIDAS POR FACTURA</td>
            <td>${resumen.salidasFactura}</td>
        </tr>
        <tr>
            <td class="fw-bold">TRASPASOS A MESAS</td>
            <td>${resumen.trasladosMesas}</td>
        </tr>
        <tr>
            <td class="fw-bold">DESARME</td>
            <td>${resumen.desarme}</td>
        </tr>
        <tr>
            <td class="fw-bold">TRASPASO A COMEP</td>
            <td>${resumen.trasladosComep}</td>
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

export async function cargarFiltrosG(añoSel, semanaSel) {
    const { data: conteos, error } = await supabase
        .from('conteos')
        .select('semana_conteo, anio_conteo');

    if (error) {
        console.error('Error cargando semanas/años:', error);
        return;
    }

    // Agrupar semanas por año
    const semanasPorAnio = {};
    conteos.forEach(c => {
        if (!semanasPorAnio[c.anio_conteo]) {
            semanasPorAnio[c.anio_conteo] = new Set();
        }
        semanasPorAnio[c.anio_conteo].add(c.semana_conteo);
    });

    const selectAnio = document.getElementById(añoSel);
    const selectSemana = document.getElementById(semanaSel);

    // Llenar select de años
    selectAnio.innerHTML = '<option value="0">Seleccione...</option>';
    Object.keys(semanasPorAnio)
        .sort((a, b) => b - a) // orden descendente
        .forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        });

    // Escuchar cuando se selecciona un año
    selectAnio.addEventListener('change', function () {
        const anioSeleccionado = this.value;

        if (anioSeleccionado !== "0") {
            const semanas = Array.from(semanasPorAnio[anioSeleccionado]).sort((a, b) => a - b);
            selectSemana.disabled = false;
            selectSemana.innerHTML = '<option value="0">Seleccione...</option>';

            semanas.forEach(semana => {
                const option = document.createElement('option');
                option.value = semana;
                option.textContent = `Semana ${semana}`;
                selectSemana.appendChild(option);
            });
        } else {
            selectSemana.disabled = true;
            selectSemana.innerHTML = '<option value="0">Seleccione...</option>';
        }
    });
}
