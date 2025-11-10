import supabase from '../supabase/supabase-client.js'

// Función para insertar nuevos productos
export async function createCount(countData) {
    const { data, error } = await supabase
        .from('inv_conteos')
        .insert([countData]);

    if (error) {
        console.error(error);
        throw error;
    } 
}

// Función para obtener productos
export async function getCounts() {
    const { data, error } = await supabase
        .from('inv_conteos')
        .select(`
            id_conteo,
            fecha_conteo,
            semana_conteo,
            anio_conteo,
            stock_real,
            observaciones,
            id_producto,
            inv_productos (
                codigo,
                id_almacen,
                inv_almacenes (nombre)
            )
        `);
    
    if (error) {
        console.error('Error obteniendo conteos:', error);
        throw error;
    }
    
    return data.map(conteo => ({
        id_conteo: conteo.id_conteo,
        fecha_conteo: conteo.fecha_conteo,
        semana_conteo: conteo.semana_conteo,
        anio_conteo: conteo.anio_conteo,
        stock_real: conteo.stock_real,
        observaciones: conteo.observaciones,
        id_producto: conteo.id_producto,
        codigo: conteo.inv_productos?.codigo,
        id_almacen: conteo.inv_productos?.id_almacen,
        almacen: conteo.inv_productos?.inv_almacenes?.nombre
    }));
}

// Función para editar productos de la base
export async function updateCount(id_conteo, updatedData) {
    const { data, error } = await supabase
        .from('inv_conteos')
        .update(updatedData)
        .eq('id_conteo', id_conteo);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el conteo: ' + error.message);
    }
}

// Función para eliminar productos de la base
export async function deleteCount(idCount) {
    if (!idCount) {
        alert('No se pudo obtener el ID del producto a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('inv_conteos')
        .delete()
        .eq('id_conteo', idCount);

    if (error) {
        console.error('Error eliminando conteo:', error);
        alert('Ocurrió un error al eliminar el conteo.');
        return;
    }
};