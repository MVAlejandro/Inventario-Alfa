import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { createMovement } from '../../services/movements-service.js';
import { renderMovementsTable } from './movements-table.js';  
// Utilidades
import { textValidate, amountValidate, inputValidate, selectValidate } from '../../utils/form-validations.js';

// Función para calcular y asignar semana y año
function getWeekAndYear(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // lunes=1, domingo=7

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return { semana: week, anio: d.getUTCFullYear() };
}

// Función para agregar un movimiento de forma manual
export async function addManualMovement(event) {
    event.preventDefault()

    const form = document.getElementById('form-manual');
    // Referencias para validación
    const tipo_movimientoIn = document.getElementById('tipo_movimiento')
    const cantidadIn = document.getElementById('cantidad')
    const observacionesIn = document.getElementById('observaciones')
    // Referencias para errores
    const tipo_movimientoError = document.getElementById('tipo_movimiento-error')
    const cantidadError = document.getElementById('cantidad-error')
    const observacionesError = document.getElementById('observaciones-error')

    // Validaciones
    selectValidate(tipo_movimientoIn, tipo_movimientoError)
    amountValidate(cantidadIn, cantidadError)
    textValidate(observacionesIn, observacionesError)

    const campos = form.querySelectorAll('input, select')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    const fecha = new Date();
    const { semana, anio } = getWeekAndYear(fecha);

    // Guardar valores
    const newMovementData = {
        tipo_movimiento: tipo_movimientoIn.value, 
        cantidad: cantidadIn.value, 
        observaciones: observacionesIn.value,
        fecha: fecha.toISOString().split('T')[0],
        semana,
        anio
    };

    try {
        await createMovement(newMovementData);
        alert('Movimiento agregado con éxito.');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
            e.classList.remove('is-valid', 'is-invalid');
        });
    
        // Recarga la tabla con los datos actualizados
        await renderMovementsTable();
    } catch (err) {
        console.error('Error al agregar movimiento:', err);
        alert('Ocurrió un error al agregar el movimiento.');
    }
}

// Función para agregar clientes con el formato de Excel
export async function addExcelMovement(event) {
    event.preventDefault();

    const form = document.getElementById('form-excel');
    // Referencias para validación y errores
    const excelData = document.getElementById('excel-data').value
    const excelDataIn = document.getElementById('excel-data')
    const excelDataError = document.getElementById('excel-data')

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
    let insertedMovements = 0;

    for (let row of rows) {
        const columns = row.split('\t');
        if (columns.length < 3) continue;

        const tipo_movimiento = columns[0].trim().toUpperCase();
        const cantidad = parseInt(columns[1].trim());
        const observaciones = columns[2].trim();
        const fecha = new Date();
        const { semana, anio } = getWeekAndYear(fecha);

        // Insertar en Supabase
        const newMovementData = {
            tipo_movimiento,
            cantidad,
            observaciones,
            fecha: fecha.toISOString().split('T')[0],
            semana,
            anio
        };

        try {
            await createMovement(newMovementData);
            insertedMovements++;
        } catch (err) {
            console.error('Error al insertar movimiento:', newMovementData, err);
        }
    }

    alert(`Se agregaron ${insertedMovements} movimientos.`);
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
        e.classList.remove('is-valid', 'is-invalid');
    });

    // Recarga la tabla con los datos actualizados
    await renderMovementsTable();
};