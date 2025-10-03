
import supabase from './supabase/supabase-client.js'
import { validarCamposInvalidos, validarSelect } from "../js/validaciones/validar_campos.js"
import { validarText, validarCantidad } from "./validaciones/regex.js"
import { cargarOpciones } from './funciones/cargar_select.js';

// Función para cargar productos en el select del formulario
async function cargarProductos(idAlmacen) {
    const { data, error } = await supabase
        .from('productos')
        .select('id_producto, codigo')
        .eq('id_almacen', idAlmacen);

    const selectProducto = document.getElementById('producto_manual');
    selectProducto.innerHTML = '<option value="0">Seleccione...</option>';

    if (error) {
        console.error("Error cargando productos:", error);
        return;
    }

    data.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id_producto;
        option.textContent = prod.codigo;
        selectProducto.appendChild(option);
    });
}

// Detectar cambio en el select de almacen en formulario
document.getElementById('almacen_manual').addEventListener('change', function() {
    const selectProducto = document.getElementById('producto_manual');
    const idAlmacen = this.value;
    if (idAlmacen !== "0") {
        selectProducto.disabled = false;
        cargarProductos(idAlmacen);
    } else {
        selectProducto.disabled = true;
        document.getElementById('producto_manual').innerHTML = '';
    }
});

// Detectar cambio en el select de movimiento en formulario
document.getElementById('tipo_movimiento_manual').addEventListener('change', function() {
    const selectMovimiento = document.getElementById('movimiento_manual');
    const tipoMov = this.value;
    if (tipoMov !== "0") {
        selectMovimiento.disabled = false;
        if (tipoMov == "Entrada") {
            document.getElementById('movimiento_manual').innerHTML = 
                `<option value="0">Seleccione...</option>
                <option value="Entrada por ajuste">Entrada por ajuste</option>
                <option value="Entrada por cancelacion">Entrada por cancelacion</option>`;
        } else if (tipoMov == "Salida") {
            document.getElementById('movimiento_manual').innerHTML = 
                `<option value="0">Seleccione...</option>
                <option value="Salida por nota de venta">Salida por nota de venta</option>
                <option value="Salida por ajuste">Salida por ajuste</option>`;
        }
    } else {
        selectMovimiento.disabled = true;
        document.getElementById('movimiento_manual').innerHTML = '';
    }
});

// Función para calcular y asignar semana y año
function getWeekAndYear(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // lunes=1, domingo=7

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return { semana: week, anio: d.getUTCFullYear() };
}

// Función centralizada para obtener movimientos
async function obtenerMovimientosCompletos() {
    const { data, error } = await supabase
        .from('movimientos')
        .select(`
            id_movimiento,
            tipo_movimiento,
            nombre_movimiento,
            cantidad,
            fecha,
            semana,
            anio,
            observaciones,
            id_producto,
            productos (
                codigo,
                id_almacen,
                almacenes (nombre)
            )
        `);

    if (error) {
        console.error('Error obteniendo movimientos:', error);
        throw error;
    }

    return data.map(movimiento => ({
        id_movimiento: movimiento.id_movimiento,
        tipo_movimiento: movimiento.tipo_movimiento,
        nombre_movimiento: movimiento.nombre_movimiento,
        cantidad: movimiento.cantidad,
        fecha: movimiento.fecha,
        semana: movimiento.semana,
        anio: movimiento.anio,
        observaciones: movimiento.observaciones,
        id_producto: movimiento.id_producto,
        codigo: movimiento.productos?.codigo,
        id_almacen: movimiento.productos?.id_almacen,
        almacen: movimiento.productos?.almacenes?.nombre
    }));
}

// Función para insertar un nuevo movimiento en Supabase
async function insertarMovimiento(movimiento) {
    // Calcular semana y año usando la fecha actual
    const fecha = movimiento.fecha ? new Date(movimiento.fecha) : new Date();
    const { semana, anio } = getWeekAndYear(fecha);

    // Agregar semana, año y fecha al objeto a insertar
    const movimientoParaInsertar = {
        ...movimiento,
        fecha: fecha.toISOString().split('T')[0], // YYYY-MM-DD
        semana,
        anio
    };

    const { data, error } = await supabase.from('movimientos').insert([movimientoParaInsertar]);

    if (error) {
        console.error(error);
        alert('Error al guardar el movimiento: ' + error.message);
    } else {
        generarTablaMovimientos(); // actualizar listado
    }
}

// Función de filtrado
document.getElementById('filtro_tipo').addEventListener('change', async function () {
    const tipo = this.value;
    const selectOrden = document.getElementById('filtro_orden');

    // Limpiar opciones anteriores
    selectOrden.innerHTML = '';

    if (tipo === '0') {
        selectOrden.disabled = true;
        return;
    }

    selectOrden.disabled = false;

    // Obtener movimientos usando la función centralizada
    const movimientos = await obtenerMovimientosCompletos();
    if (!movimientos) return;

    let opciones = [];

    // Obtener valores únicos según el tipo
    switch (tipo) {
        case 'semana':
            opciones = movimientos.map(m => `${m.anio} - ${m.semana}`);
            break;
        case 'codigo':
            opciones = movimientos.map(m => m.codigo);
            break;
        case 'almacen':
            opciones = movimientos.map(m => m.almacen);
            break;
        case 'nombre_movimiento':
            opciones = movimientos.map(m => m.nombre_movimiento);
            break;
    }

    // Eliminar duplicados y valores vacíos
    const opcionesUnicas = [...new Set(opciones)].filter(v => v);

    // Agregar opciones al select
    selectOrden.innerHTML = '<option value="0">Todos</option>';
    opcionesUnicas.forEach(opcion => {
        const optionEl = document.createElement('option');
        optionEl.value = opcion;
        optionEl.textContent = opcion;
        selectOrden.appendChild(optionEl);
    });
});

// Función al dar click en botón de filtrado
document.getElementById('btn_filtro').addEventListener('click', async function () {
    const tipo = document.getElementById('filtro_tipo').value;
    const valorSeleccionado = document.getElementById('filtro_orden').value;
    const textoBusqueda = document.getElementById('filtro_buscar').value.trim().toLowerCase();

    // Obtener movimientos usando la función centralizada
    const movimientosProcesados = await obtenerMovimientosCompletos();
    if (!movimientosProcesados) return;

    // Si no hay filtros activos, mostrar todo
    const sinFiltros = 
        tipo === '0' &&
        (!valorSeleccionado || valorSeleccionado === '0') &&
        textoBusqueda === '';

    if (sinFiltros) {
        generarTablaMovimientos(movimientosProcesados);
        return;
    }

    // Aplicar filtros
    const filtrados = movimientosProcesados.filter(m => {
        let cumpleSelect = true;
        let cumpleBusqueda = true;

        // Filtro por select dinámico
        if (tipo !== '0' && valorSeleccionado !== '0') {
            if (tipo === 'semana') {
                const campoSemana = `${m.anio} - ${m.semana}`;
                cumpleSelect = campoSemana === valorSeleccionado;
            } else {
                const campo = m[tipo]?.toString().toLowerCase();
                cumpleSelect = campo === valorSeleccionado.toLowerCase();
            }
        }

        // Filtro por búsqueda libre
        if (textoBusqueda) {
            cumpleBusqueda = Object.values(m).some(valor =>
                valor?.toString().toLowerCase().includes(textoBusqueda)
            );
        }

        return cumpleSelect && cumpleBusqueda;
    });

    generarTablaMovimientos(filtrados);
});

// Función para cargar los movimientos desde Supabase en la tabla
function generarTablaMovimientos(movimientos) {
    const tbody = document.querySelector('#tabla_movimientos tbody');
    tbody.innerHTML = '';

    if (!movimientos || movimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No hay movimientos que coincidan con los filtros</td></tr>`;
        return;
    }

    movimientos.forEach(movimiento => {
        tbody.innerHTML += 
        `<tr>
            <th scope="row">${movimiento.anio} / ${movimiento.semana}</th>
            <td>${movimiento.codigo}</td>
            <td>${movimiento.almacen}</td>
            <td>${movimiento.nombre_movimiento}</td>
            <td>${movimiento.cantidad}</td>
            <td>${movimiento.observaciones}</td>
            <td><button type="button" class="btn btn-primary movimiento-btn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#movimiento_modal"
                    data-movimiento='${JSON.stringify(movimiento)}'>
                    Editar
                </button></td>
        </tr>`;
    });
}

// Agregar Movimiento Excel
// Mapeo de abreviaciones de movimiento
const mapaMovimientos = {
    'EA': 'Entrada por ajuste',
    'NVC': 'Entrada por cancelacion',
    'NV': 'Salida por nota de venta',
    'SA': 'Salida por ajuste'
};

// Mapeo de nombre de almacén a ID
const mapaAlmacenes = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3
};

// Función para buscar un producto por su código y almacén
async function buscarProducto(codigo, id_almacen) {
    const { data, error } = await supabase
        .from('productos')
        .select('id_producto')
        .eq('codigo', codigo)
        .eq('id_almacen', id_almacen)
        .maybeSingle();

    return data ? data.id_producto : null;
}

// Evento al dar click al botón Agregar Movimiento Excel
document.getElementById('btn_add_excel').addEventListener('click', async function(event) {
    event.preventDefault();
    const formulario = document.getElementById('form_excel');
    // Obtener valores de inputs
    const texto_datos = document.getElementById('datos_excel').value

    // Referencias para validación
    const texto_datosIn = document.getElementById('datos_excel')
    const error_texto_datos = document.getElementById('error-datos_excel')

    // Validaciones
    validarText(texto_datosIn, error_texto_datos)

    if (!texto_datos) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Divide filas y columnas
    const filas = texto_datos.split('\n');
    let movimientosInsertados = 0;

    for (let fila of filas) {
        const columnas = fila.split('\t');
        if (columnas.length < 6) continue;

        const codigo = columnas[0].trim();
        const nombreAlmacen = columnas[1].trim().toUpperCase();
        const tipo_movimiento = columnas[2].trim();
        const movimientoAbrev = columnas[3].trim().toUpperCase();
        const cantidad = parseInt(columnas[4].trim());
        const observaciones = columnas[5].trim();

        // Asignar valores en base a los mapas
        const nombre_movimiento = mapaMovimientos[movimientoAbrev];
        const id_almacen = mapaAlmacenes[nombreAlmacen];

        const id_producto = await buscarProducto(codigo, id_almacen);

        // Insertar en Supabase
        const nuevoMovimiento = {
            id_producto,
            tipo_movimiento,
            nombre_movimiento,
            cantidad,
            observaciones
        };

        await insertarMovimiento(nuevoMovimiento);
        movimientosInsertados++;
    }

    alert(`Se agregaron ${movimientosInsertados} movimientos.`);
    // Reiniciar formulario y eliminar validaciones visuales
    formulario.reset();
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recargar tabla con datos actualizados
    const movimientosActualizados = await obtenerMovimientosCompletos();
    generarTablaMovimientos(movimientosActualizados);
});

// Evento al dar click al botón Agregar Movimiento Manual
document.getElementById('btn_add_manual').addEventListener('click', async function(event) {
    event.preventDefault()
    const formulario = document.getElementById('form_manual');

    // Obtener valores de inputs
    const almacen = document.getElementById('almacen_manual').value
    const id_producto = document.getElementById('producto_manual').value
    const tipo_movimiento = document.getElementById('tipo_movimiento_manual').value
    const nombre_movimiento = document.getElementById('movimiento_manual').value
    const cantidad = document.getElementById('cantidad_manual').value
    const observaciones = document.getElementById('observaciones_manual').value

    // Referencias para validación
    const almacenIn = document.getElementById('almacen_manual')
    const id_productoIn = document.getElementById('producto_manual')
    const tipo_movimientoIn = document.getElementById('tipo_movimiento_manual')
    const nombre_movimientoIn = document.getElementById('movimiento_manual')
    const cantidadIn = document.getElementById('cantidad_manual')
    const observacionesIn = document.getElementById('observaciones_manual')

    const error_almacen = document.getElementById('error-almacen_manual')
    const error_producto = document.getElementById('error-producto_manual')
    const error_tipo_movimiento = document.getElementById('error-tipo_movimiento_manual')
    const error_nombre_movimiento = document.getElementById('error-movimiento_manual')
    const error_cantidad = document.getElementById('error-cantidad_manual')
    const error_observaciones = document.getElementById('error-observaciones_manual')

    // Validaciones
    validarSelect(almacenIn, error_almacen)
    validarSelect(id_productoIn, error_producto)
    validarSelect(tipo_movimientoIn, error_tipo_movimiento)
    validarSelect(nombre_movimientoIn, error_nombre_movimiento)
    validarCantidad(cantidadIn, error_cantidad)
    validarText(observacionesIn, error_observaciones)

    if (!almacen || !id_producto || !tipo_movimiento || !nombre_movimiento || !cantidad || !observaciones) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input, select')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Insertar en Supabase y reiniciar formulario
    const nuevoMovimiento = { id_producto, tipo_movimiento, nombre_movimiento, cantidad, observaciones }
    await insertarMovimiento(nuevoMovimiento)
    alert('Movimiento agregado con éxito');
    formulario.reset();
    // Eliminar validaciones visuales
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recarga la tabla con los datos actualizados
    const movimientosActualizados = await obtenerMovimientosCompletos();
    generarTablaMovimientos(movimientosActualizados);
})

// Cargar los almacenes, productos y registros al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    cargarOpciones('almacen_manual', 'almacenes', 'id_almacen', 'nombre')
    generarTablaMovimientos()

    const movimientosProcesados = await obtenerMovimientosCompletos();
    if (movimientosProcesados) {
        generarTablaMovimientos(movimientosProcesados);
    }
})

// Declarar los botones de editar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('movimiento-btn')) {
        const movimientoData = JSON.parse(e.target.getAttribute('data-movimiento'));
        cargarDatosEnModal(movimientoData);
    }
});

// Función para cargar datos en el modal
function cargarDatosEnModal(movimiento) {
    // Campos no editables (solo lectura)
    document.getElementById('edit_id_movimiento').value = movimiento.id_movimiento;
    document.getElementById('edit_id_display').value = movimiento.id_movimiento;
    document.getElementById('edit_fecha').value = movimiento.fecha;
    document.getElementById('edit_producto').value = movimiento.codigo;
    document.getElementById('edit_almacen').value = movimiento.almacen;
    document.getElementById('edit_movimiento').value = movimiento.nombre_movimiento;
    
    // Campos editables
    document.getElementById('edit_cantidad').value = movimiento.cantidad;
    document.getElementById('edit_observaciones').value = movimiento.observaciones;
}

// Función para guardar cambios
document.getElementById('btn_guardar_cambios').addEventListener('click', async function() {
    const id_movimiento = document.getElementById('edit_id_movimiento').value;
    const cantidad = document.getElementById('edit_cantidad').value;
    const observaciones = document.getElementById('edit_observaciones').value;

    // Referencias para validación
    const cantidadIn = document.getElementById('edit_cantidad');
    const observacionesIn = document.getElementById('edit_observaciones');

    const error_cantidad = document.getElementById('error-editCantidad');
    const error_observaciones = document.getElementById('error-editObservaciones');

    // Validaciones
    validarCantidad(cantidadIn, error_cantidad)
    validarText(observacionesIn, error_observaciones)

    // Validar campos requeridos
    if (!cantidad || !observaciones) {
        alert('Por favor, complete todos los campos obligatorios');
        return;
    }

    const campos = document.querySelectorAll('input')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
        .from('movimientos')
        .update({ 
            cantidad: cantidad, 
            observaciones: observaciones 
        })
        .eq('id_movimiento', id_movimiento);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el movimiento: ' + error.message);
    } else {
        alert('Movimiento actualizado correctamente');
        const movimientosActualizados = await obtenerMovimientosCompletos();
        generarTablaMovimientos(movimientosActualizados);
        bootstrap.Modal.getInstance(document.getElementById('movimiento_modal')).hide();
    }
});

// Eliminar entrada al dar click en el botón del segundo modal
document.getElementById('btn_eliminar_entrada').addEventListener('click', async () => {
    const tipoMoviento = document.getElementById('edit_id_movimiento').value;

    if (!tipoMoviento) {
        alert('No se pudo obtener el ID del movimiento a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('movimientos')
        .delete()
        .eq('id_movimiento', tipoMoviento);

    if (error) {
        console.error('Error eliminando movimiento:', error);
        alert('Ocurrió un error al eliminar el movimiento.');
        return;
    }

    // Cerrar los modales
    const consultaModal = bootstrap.Modal.getInstance(document.getElementById('consulta_modal'));
    if (consultaModal) consultaModal.hide();

    const movimientoModal = bootstrap.Modal.getInstance(document.getElementById('movimiento_modal'));
    if (movimientoModal) movimientoModal.hide();

    // Recarga la tabla con los datos actualizados
    const movimientosActualizados = await obtenerMovimientosCompletos();
    generarTablaMovimientos(movimientosActualizados);

    // Mensaje de éxito
    alert('Movimiento eliminado correctamente.');
});