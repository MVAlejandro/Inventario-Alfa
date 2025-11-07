import supabase from '../supabase/supabase-client.js'

// Función para insertar nuevos movimientos
export async function createMovement(movementData) {
    const { data, error } = await supabase
        .from('inv_movimientos')
        .insert([movementData]);

    if (error) {
        console.error(error);
        throw error;
    } 
}

// Función para obtener movimientos
export async function getMovements() {
    const { data, error } = await supabase
        .from('inv_movimientos')
        .select("*");
    
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
        observaciones: movimiento.observaciones
    }));
}

// Función para editar movimientos de la base
export async function updateMovement(id_movimiento, updatedData) {
    const { data, error } = await supabase
        .from('inv_movimientos')
        .update(updatedData)
        .eq('id_movimiento', id_movimiento);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el movimiento: ' + error.message);
    }
}

// Función para eliminar movimientos de la base
export async function deleteMovement(idMovement) {
    if (!idMovement) {
        alert('No se pudo obtener el ID del movimiento a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('inv_movimientos')
        .delete()
        .eq('id_movimiento', idMovement);

    if (error) {
        console.error('Error eliminando movimiento:', error);
        alert('Ocurrió un error al eliminar el movimiento.');
        return;
    }
};