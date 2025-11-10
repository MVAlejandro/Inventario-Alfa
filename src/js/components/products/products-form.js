import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { createProduct } from '../../services/products-service.js'; 
import { renderProductsTable } from './products-table.js'; 
// Utilidades
import { textValidate, codeValidate, inputValidate, selectValidate } from '../../utils/form-validations.js';

// Mapeo de nombre de almacén a ID
const storeMap = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3,
    'PRODUCCION':4,
    'MATERIA PRIMA':5
};

// Función para agregar un producto de forma manual
export async function addManualProduct(event) {
    event.preventDefault()

    const form = document.getElementById('form-manual');
    // Referencias para validación
    const codigoIn = document.getElementById('codigo')
    const nombreIn = document.getElementById('nombre')
    const id_almacenIn = document.getElementById('almacen')
    const descripcionIn = document.getElementById('descripcion')
    // Referencias para errores
    const codigoError = document.getElementById('error-codigo')
    const nombreError = document.getElementById('error-nombre')
    const almacenError = document.getElementById('error-almacen')
    const descripcionError = document.getElementById('error-descripcion')

    // Validaciones
    codeValidate(codigoIn, codigoError)
    textValidate(nombreIn, nombreError)
    selectValidate(id_almacenIn, almacenError)
    textValidate(descripcionIn, descripcionError)

    const campos = form.querySelectorAll('input, select')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    let fecha_creacion = new Date().toISOString().split('T')[0];

    // Guardar valores
    const newProductData = {
        codigo: codigoIn.value, 
        nombre: nombreIn.value, 
        id_almacen: id_almacenIn.value, 
        descripcion: descripcionIn.value, 
        fecha_creacion
    };

    try {
        await createProduct(newProductData);
        alert('Producto agregado con éxito.');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
            e.classList.remove('is-valid', 'is-invalid');
        });
    
        // Recarga la tabla con los datos actualizados
        await renderProductsTable();
    } catch (err) {
        console.error('Error al agregar producto:', err);
        alert('Ocurrió un error al agregar el producto.');
    }
}

// Función para agregar clientes con el formato de Excel
export async function addExcelProduct(event) {
    event.preventDefault();

    const form = document.getElementById('form-excel');
    // Referencias para validación y errores
    const excelData = document.getElementById('excel-data').value
    const excelDataIn = document.getElementById('excel-data')
    const excelDataError = document.getElementById('error-excel-data')

    // Validaciones
    textValidate(excelDataIn, excelDataError)

    if (!excelData) {
        alert('Por favor, ingrese la información para agregar la entrada.')
        return
    }

    const campos = form.querySelectorAll('input')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Dividir las filas y columnas
    const rows = excelData.split('\n');
    let insertedProducts = 0;

    for (let row of rows) {
        const columns = row.split('\t');
        if (columns.length < 4) continue;

        const codigo = columns[0].trim();
        const nombre = columns[1].trim();
        const nombreAlmacen = columns[2].trim().toUpperCase();
        const descripcion = columns[3].trim();
        let fecha_creacion = new Date().toISOString().split('T')[0];

        // Asignar almacén en base al mapa
        const id_almacen = storeMap[nombreAlmacen];

        // Insertar en Supabase
        const newProductData = {
            codigo,
            nombre,
            id_almacen,
            descripcion,
            fecha_creacion
        };

        try {
            await createProduct(newProductData);
            insertedProducts++;
        } catch (err) {
            console.error('Error al insertar producto:', newProductData, err);
        }
    }

    alert(`Se agregaron ${insertedProducts} productos.`);
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
        e.classList.remove('is-valid', 'is-invalid');
    });

    // Recarga la tabla con los datos actualizados
    await renderProductsTable();
};