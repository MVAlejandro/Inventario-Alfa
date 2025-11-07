import supabase from '../supabase/supabase-client.js'

// Función para insertar nuevos productos
export async function createProduct(productData) {
    const { data, error } = await supabase
        .from('inv_productos')
        .insert([productData]);

    if (error) {
        console.error(error);
        throw error;
    } 
}

// Función para obtener productos
export async function getProducts() {
    const { data, error } = await supabase
        .from('inv_productos')
        .select(`
            id_producto,
            codigo,
            nombre,
            fecha_creacion,
            descripcion,
            id_almacen,
            inv_almacenes(nombre)
        `);
    
    if (error) {
        console.error('Error obteniendo productos:', error);
        throw error;
    }
    
    return data.map(producto => ({
        id_producto: producto.id_producto,
        codigo: producto.codigo,
        nombre: producto.nombre,
        fecha_creacion: producto.fecha_creacion,
        descripcion: producto.descripcion,
        id_almacen: producto.id_almacen,
        almacen: producto.inv_almacenes?.nombre
    }));
}

// Función para editar productos de la base
export async function updateProduct(id_producto, updatedData) {
    const { data, error } = await supabase
        .from('inv_productos')
        .update(updatedData)
        .eq('id_producto', id_producto);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el producto: ' + error.message);
    }
}

// Función para eliminar productos de la base
export async function deleteProduct(idProducto) {
    if (!idProducto) {
        alert('No se pudo obtener el ID del producto a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('inv_productos')
        .delete()
        .eq('id_producto', idProducto);

    if (error) {
        console.error('Error eliminando producto:', error);
        alert('Ocurrió un error al eliminar el producto.');
        return;
    }
};