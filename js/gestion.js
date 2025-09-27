
import supabase from './supabase/supabase-client.js'
import { validarCamposInvalidos, validarSelect } from "../js/validaciones/validar_campos.js"
import { validarText, validarCosto } from "./validaciones/regex.js"
import { cargarOpciones } from './funciones/cargar_select.js';

// Función centralizada para obtener movimientoes
async function obtenerMovimientosCompletos() {
    const { data, error } = await supabase
        .from('movimientos')
        .select(`
            id_movimiento,
            tipo_movimiento,
            cantidad,
            fecha,
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
        cantidad: movimiento.cantidad,                                   
        fecha: movimiento.fecha,
        observaciones: movimiento.observaciones,
        id_producto: movimiento.id_producto,
        codigo: movimiento.productos?.codigo,
        id_almacen: movimiento.productos?.id_almacen,
        almacen: movimiento.productos?.almacenes?.nombre
    }));
}

// Función para insertar un nuevo movimiento en Supabase
async function insertarMovimiento(movimiento) {
    const { data, error } = await supabase.from('movimientos').insert([movimiento])

    if (error) {
        console.error(error)
        alert('Error al guardar el movimiento: ' + error.message)
    } else {
        alert('Movimiento agregado con éxito')
        generarTablaMovimientos() // actualizar listado
        // Limpiar formulario
        document.querySelector('form').reset()
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
        case 'fecha':
            opciones = movimientos.map(m => m.fecha);
            break;
        case 'codigo':
            opciones = movimientos.map(m => m.codigo);
            break;
        case 'almacen':
            opciones = movimientos.map(m => m.almacen);
            break;
        case 'tipo_movimiento':
            opciones = movimientos.map(m => m.tipo_movimiento);
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
            const campo = m[tipo]?.toString().toLowerCase();
            cumpleSelect = campo === valorSeleccionado.toLowerCase();
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
            <th scope="row">${movimiento.fecha}</th>
            <td>${movimiento.codigo}</td>
            <td>${movimiento.almacen}</td>
            <td>${movimiento.tipo_movimiento}</td>
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

// Función para cargar productos en el select del formulario
async function cargarProductos(idAlmacen) {
    const { data, error } = await supabase
        .from('productos')
        .select('id_producto, codigo')
        .eq('id_almacen', idAlmacen);

    const selectProducto = document.getElementById('producto');
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
document.getElementById('almacen').addEventListener('change', function() {
    const selectProducto = document.getElementById('producto');
    const idAlmacen = this.value;
    if (idAlmacen !== "0") {
        selectProducto.disabled = false;
        cargarProductos(idAlmacen);
    } else {
        selectProducto.disabled = true;
        document.getElementById('producto').innerHTML = '<option value="0">Seleccione...</option>';
    }
});

// Evento al dar click al botón Agregar Movimiento
document.getElementById('btn_add').addEventListener('click', async function(event) {
    event.preventDefault()

    // Obtener valores de inputs
    const id_producto = document.getElementById('producto').value
    const tipo_movimiento = document.getElementById('movimiento').value
    const cantidad = document.getElementById('cantidad').value
    const observaciones = document.getElementById('observaciones').value

    // Referencias para validación
    const id_productoIn = document.getElementById('producto')
    const tipo_movimientoIn = document.getElementById('movimiento')
    const cantidadIn = document.getElementById('cantidad')
    const observacionesIn = document.getElementById('observaciones')

    const error_producto = document.getElementById('error-producto')
    const error_movimiento = document.getElementById('error-movimiento')
    const error_cantidad = document.getElementById('error-cantidad')
    const error_observaciones = document.getElementById('error-observaciones')

    // Validaciones
    validarSelect(id_productoIn, error_producto)
    validarSelect(tipo_movimientoIn, error_movimiento)
    validarCosto(cantidadIn, error_cantidad)
    validarText(observacionesIn, error_observaciones)

    if (!id_producto || !tipo_movimiento || !cantidad || !observaciones) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input, select')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    let fecha = new Date().toISOString().split('T')[0];

    // Insertar en Supabase
    const nuevoMovimiento = { id_producto, tipo_movimiento, cantidad, observaciones, fecha }
    await insertarMovimiento(nuevoMovimiento)

    // Recarga la tabla con los datos actualizados
    const movimientosActualizados = await obtenerMovimientosCompletos();
    generarTablaMovimientos(movimientosActualizados);
})

// Cargar los almacenes, productos y registros al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    cargarOpciones('almacen', 'almacenes', 'id_almacen', 'nombre')
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
    document.getElementById('edit_movimiento').value = movimiento.tipo_movimiento;
    
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
    validarCosto(cantidadIn, error_cantidad)
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
    const idMovimiento = document.getElementById('edit_id_movimiento').value;

    if (!idMovimiento) {
        alert('No se pudo obtener el ID del movimiento a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('movimientos')
        .delete()
        .eq('id_movimiento', idMovimiento);

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