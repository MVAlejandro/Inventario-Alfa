
import supabase from './supabase/supabase-client.js'
import { validarCamposInvalidos, validarSelect } from "../js/validaciones/validar_campos.js"
import { validarText, validarCodigo } from "./validaciones/regex.js"
import { cargarOpciones } from './funciones/cargar_select.js';

// Función centralizada para obtener productos
async function obtenerProductosCompletos() {
    const { data, error } = await supabase
        .from('productos')
        .select(`
            id_producto,
            codigo,
            nombre,
            stock_sistema,
            fecha_creacion,
            descripcion,
            id_almacen,
            almacenes(nombre)
        `);
    
    if (error) {
        console.error('Error obteniendo productos:', error);
        throw error;
    }
    
    return data.map(producto => ({
        id_producto: producto.id_producto,
        codigo: producto.codigo,
        nombre: producto.nombre,
        stock_sistema: producto.stock_sistema,
        fecha_creacion: producto.fecha_creacion,
        descripcion: producto.descripcion,
        id_almacen: producto.id_almacen,
        almacen: producto.almacenes?.nombre
    }));
}

// Función para insertar un nuevo producto en Supabase
async function insertarProducto(producto) {
    const { data, error } = await supabase.from('productos').insert([producto])

    if (error) {
        console.error(error)
        alert('Error al guardar el producto: ' + error.message)
    } else {
        generarTablaProductos() // actualizar listado
    }
}

// Función al dar click en botón de filtrado
document.getElementById('btn_filtro').addEventListener('click', async function () {
    const almacen = document.getElementById('filtro_almacen').value;
    const textoBusqueda = document.getElementById('filtro_buscar').value.trim().toLowerCase();

    // Obtener productos usando la función centralizada
    const productosProcesados = await obtenerProductosCompletos();
    if (!productosProcesados) return;

    // Si no hay filtros activos, mostrar todo
    const sinFiltros =
        almacen === '0' && textoBusqueda === '';

    if (sinFiltros) {
        generarTablaProductos(productosProcesados);
        return;
    }

    // Aplicar filtros
    const filtrados = productosProcesados.filter(p => {
        let cumpleSelect = true;
        let cumpleBusqueda = true;

        // Filtro por select dinámico
        if (almacen !== '0') {
            const campo = p.almacen?.toString().toLowerCase();
            cumpleSelect = campo === almacen.toLowerCase();
        }

        // Filtro por búsqueda libre
        if (textoBusqueda) {
            cumpleBusqueda = Object.values(p).some(valor =>
                valor?.toString().toLowerCase().includes(textoBusqueda)
            );
        }

        return cumpleSelect && cumpleBusqueda;
    });

    generarTablaProductos(filtrados);
});

// Función para cargar las productos desde Supabase en la tabla
function generarTablaProductos(productos) {
    const tbody = document.querySelector('#tabla_productos tbody');
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No hay productos que coincidan con los filtros</td></tr>`;
        return;
    }

    productos.forEach(producto => {
        tbody.innerHTML += 
        `<tr>
            <th scope="row">${producto.codigo}</th>
            <td>${producto.nombre}</td>
            <td>${producto.almacen}</td>
            <td>${producto.descripcion}</td>
            <td>${producto.fecha_creacion}</td>
            <td><button type="button" class="btn btn-primary producto-btn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#producto_modal"
                    data-producto='${JSON.stringify(producto)}'>
                    Editar
                </button></td>
        </tr>`;
    });
}

// Agregar Movimiento Excel
// Mapeo de nombre de almacén a ID
const mapaAlmacenes = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3,
    'PRODUCCION':4,
    'MATERIA PRIMA':5
};

// Evento al dar click al botón Agregar Producto Excel
document.getElementById('btn_add_excel').addEventListener('click', async function(event) {
    event.preventDefault()
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
    let productosInsertados = 0;

    for (let fila of filas) {
        const columnas = fila.split('\t');
        if (columnas.length < 4) continue;

        const codigo = columnas[0].trim();
        const nombre = columnas[1].trim();
        const nombreAlmacen = columnas[2].trim().toUpperCase();
        const descripcion = columnas[3].trim();
        let fecha_creacion = new Date().toISOString().split('T')[0];

        // Asignar valores en base a los mapas
        const id_almacen = mapaAlmacenes[nombreAlmacen];

        // Insertar en Supabase
        const nuevoProducto = {
            codigo,
            nombre,
            id_almacen,
            descripcion,
            fecha_creacion
        };

        await insertarProducto(nuevoProducto);
        productosInsertados++;
    }

    alert(`Se agregaron ${productosInsertados} productos.`);
    // Reiniciar formulario y eliminar validaciones visuales
    formulario.reset();
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recargar tabla con datos actualizados
    const productosActualizados = await obtenerProductosCompletos();
    generarTablaProductos(productosActualizados);
});

// Evento al dar click al botón Agregar Producto Manual
document.getElementById('btn_add_manual').addEventListener('click', async function(event) {
    event.preventDefault()
    const formulario = document.getElementById('form_manual');

    // Obtener valores de inputs
    const codigo = document.getElementById('codigo_manual').value
    const nombre = document.getElementById('nombre_p_manual').value
    const id_almacen = document.getElementById('almacen_manual').value
    const descripcion = document.getElementById('descripcion_manual').value

    // Referencias para validación
    const codigoIn = document.getElementById('codigo_manual')
    const nombreIn = document.getElementById('nombre_p_manual')
    const id_almacenIn = document.getElementById('almacen_manual')
    const descripcionIn = document.getElementById('descripcion_manual')

    const error_codigo = document.getElementById('error-codigo_manual')
    const error_nombre = document.getElementById('error-nombre_manual')
    const error_almacen = document.getElementById('error-almacen_manual')
    const error_descripcion = document.getElementById('error-descripcion_manual')

    // Validaciones
    validarCodigo(codigoIn, error_codigo)
    validarText(nombreIn, error_nombre)
    validarSelect(id_almacenIn, error_almacen)
    validarText(descripcionIn, error_descripcion)

    if (!codigo || !nombre || !id_almacen || !descripcion) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input, select')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    let fecha_creacion = new Date().toISOString().split('T')[0];

    // Insertar en Supabase y reiniciar formulario
    const nuevoProducto = { codigo, nombre, id_almacen, descripcion, fecha_creacion }
    await insertarProducto(nuevoProducto)
    alert('Producto agregado con éxito')
    formulario.reset();
    // Eliminar validaciones visuales
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recarga la tabla con los datos actualizados
    const productosActualizadas = await obtenerProductosCompletos();
    generarTablaProductos(productosActualizadas);
})

// Cargar los almacenes al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    cargarOpciones('almacen_excel', 'almacenes', 'id_almacen', 'nombre')
    cargarOpciones('almacen_manual', 'almacenes', 'id_almacen', 'nombre')
    generarTablaProductos()

    const productosProcesados = await obtenerProductosCompletos();
    if (productosProcesados) {
        generarTablaProductos(productosProcesados);
    }
})

// Declarar los botones de editar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('producto-btn')) {
        const productoData = JSON.parse(e.target.getAttribute('data-producto'));
        cargarDatosEnModal(productoData);
    }
});

// Función para cargar datos en el modal
function cargarDatosEnModal(producto) {
    // Campos no editables (solo lectura)
    document.getElementById('edit_id_producto').value = producto.id_producto;
    document.getElementById('edit_id_display').value = producto.id_producto;
    document.getElementById('edit_codigo').value = producto.codigo;
    
    // Campos editables
    document.getElementById('edit_nombre').value = producto.nombre;
    cargarOpciones('edit_almacen', 'almacenes', 'id_almacen', 'nombre', producto.id_almacen)
    document.getElementById('edit_descripcion').value = producto.descripcion;
}

// Función para guardar cambios
document.getElementById('btn_guardar_cambios').addEventListener('click', async function() {
    const id_producto = document.getElementById('edit_id_producto').value;
    const nombre = document.getElementById('edit_nombre').value;
    const id_almacen = document.getElementById('edit_almacen').value;
    const descripcion = document.getElementById('edit_descripcion').value;

    // Referencias para validación
    const nombreIn = document.getElementById('edit_nombre');
    const id_almacenIn = document.getElementById('edit_almacen');
    const descripcionIn = document.getElementById('edit_descripcion');

    const error_nombre = document.getElementById('error-editNombre');
    const error_almacen = document.getElementById('error-editAlmacen');
    const error_descripcion = document.getElementById('error-editDescripcion');

    // Validaciones
    validarText(nombreIn, error_nombre)
    validarSelect(id_almacenIn, error_almacen)
    validarText(descripcionIn, error_descripcion)

    // Validar campos requeridos
    if (!nombre || !id_almacen || !descripcion) {
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
        .from('productos')
        .update({ 
            nombre: nombre, 
            id_almacen: id_almacen, 
            descripcion: descripcion 
        })
        .eq('id_producto', id_producto);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el producto: ' + error.message);
    } else {
        alert('Producto actualizado correctamente');
        const productosActualizados = await obtenerProductosCompletos();
        generarTablaProductos(productosActualizados);
        bootstrap.Modal.getInstance(document.getElementById('producto_modal')).hide();
    }
});

// Eliminar entrada al dar click en el botón del segundo modal
document.getElementById('btn_eliminar_entrada').addEventListener('click', async () => {
    const idProducto = document.getElementById('edit_id_producto').value;

    if (!idProducto) {
        alert('No se pudo obtener el ID del producto a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id_producto', idProducto);

    if (error) {
        console.error('Error eliminando producto:', error);
        alert('Ocurrió un error al eliminar el producto.');
        return;
    }

    // Cerrar los modales
    const consultaModal = bootstrap.Modal.getInstance(document.getElementById('consulta_modal'));
    if (consultaModal) consultaModal.hide();

    const productoModal = bootstrap.Modal.getInstance(document.getElementById('producto_modal'));
    if (productoModal) productoModal.hide();

    // Recarga la tabla con los datos actualizados
    const productosActualizados = await obtenerProductosCompletos();
    generarTablaProductos(productosActualizados);

    // Mensaje de éxito
    alert('Producto eliminado correctamente.');
});
