
import supabase from '../supabase/supabase-client.js'

// Función para cargar almacenes en el select de filtro
export async function cargarAlmacenes(almacenElement) {
    const { data, error } = await supabase.from('almacenes').select('id_almacen, nombre');

    const selectAlmacen = document.getElementById(almacenElement);
    selectAlmacen.innerHTML = '<option value="0">Seleccione...</option>';

    if (error) {
        console.error("Error cargando almacenes:", error);
        return;
    }

    data.forEach(almacen => {
        const option = document.createElement('option');
        option.value = almacen.id_almacen;
        option.textContent = almacen.nombre;
        selectAlmacen.appendChild(option);
    });
}

export async function generarInventarioInd() {
    const inicioInput = document.getElementById('fechaInicioI').value;
    const finInput = document.getElementById('fechaFinI').value;
    const almacenFiltro = document.getElementById('almacenI').value;

    // Verificar si los filtros están vacíos
    if (!inicioInput && !finInput && almacenFiltro === '0') {
        generarTablaInventarioInd([]);
        return;
    }

    try {
        // Traer productos con conteos filtrados por almacen
        const { data: productos, error: errorProd } = await supabase
            .from('productos')
            .select(`
                id_producto,
                codigo,
                id_almacen,
                conteos (
                    id_conteo,
                    fecha_conteo,
                    stock_real
                )
            `)
            .eq('id_almacen', parseInt(almacenFiltro));

        if (errorProd) throw errorProd;

        // Filtrar productos que tengan conteos en el rango de fechas
        const productosFiltrados = productos.filter(producto => {
            // Filtrar conteos por rango de fechas
            const conteosFiltrados = producto.conteos.filter(conteo => {
                const fechaConteo = new Date(conteo.fecha_conteo);
                
                // Normalizar fechas para comparación (solo fecha, sin hora)
                const fechaConteoNormalizada = new Date(fechaConteo.getFullYear(), fechaConteo.getMonth(), fechaConteo.getDate());
                
                let cumpleInicio = true;
                let cumpleFin = true;

                if (inicioInput) {
                    const inicio = new Date(inicioInput);
                    const inicioNormalizado = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                    cumpleInicio = fechaConteoNormalizada >= inicioNormalizado;
                }

                if (finInput) {
                    const fin = new Date(finInput);
                    const finNormalizado = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
                    cumpleFin = fechaConteoNormalizada <= finNormalizado;
                }

                return cumpleInicio && cumpleFin;
            });
            
            // Reemplazar los conteos con los filtrados
            producto.conteos = conteosFiltrados;
            
            // Mantener solo productos que tengan al menos un conteo en el rango
            return conteosFiltrados.length > 0;
        });

        if (productosFiltrados.length === 0) {
            generarTablaInventarioInd([]);
            return;
        }

        // Obtener movimientos para los productos
        const idsProductos = productosFiltrados.map(p => p.id_producto);
        
        // Obtener todos los movimientos para estos productos, sin filtro de fecha para cálculo correcto
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('id_producto, tipo_movimiento, cantidad, fecha')
            .in('id_producto', idsProductos);

        if (errorMov) throw errorMov;

        // Calcular stock histórico para cada conteo
        const inventario = [];

        productosFiltrados.forEach(producto => {
            producto.conteos.forEach(conteo => {
                const fechaConteo = new Date(conteo.fecha_conteo);
                
                // Filtrar movimientos hasta la fecha del conteo
                const movimientosHastaConteo = movimientos.filter(m => {
                    const fechaMovimiento = new Date(m.fecha);
                    return m.id_producto === producto.id_producto && fechaMovimiento <= fechaConteo;
                });

                const stockHistorico = movimientosHastaConteo.reduce((acc, m) => {
                    return acc + (m.tipo_movimiento === 'Entrada' ? +m.cantidad : -m.cantidad);
                }, 0);

                inventario.push({
                    id_producto: producto.id_producto,
                    codigo: producto.codigo,
                    almacen: producto.id_almacen,
                    fecha_conteo: conteo.fecha_conteo,
                    stock_real: conteo.stock_real,
                    stock_sistema_hasta_conteo: stockHistorico,
                    diferencia: conteo.stock_real - stockHistorico 
                });
            });
        });

        // Llamar a la función que genera la tabla con el inventario calculado
        generarTablaInventarioInd(inventario);

    } catch (error) {
        console.error('Error cargando productos y conteos:', error);
        generarTablaInventarioInd([]);
    }
}

function generarTablaInventarioInd(productos) {
    const tbody = document.querySelector("#reporteInd_tabla tbody");
    tbody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No hay productos en este rango</td></tr>`;
        return;
    }

    productos.forEach((p) => {
        const idProductos = p.id_producto;
        // Determinar clase CSS basada en la diferencia
        let claseDiferencia = '';
        
        if (p.diferencia > 0) {
            claseDiferencia = 'text-success'; // Verde para positivo
        } else if (p.diferencia < 0) {
            claseDiferencia = 'text-danger';  // Rojo para negativo
        } else {
            claseDiferencia = 'text-muted';   // Gris para cero
        }

        tbody.innerHTML += 
        `<tr data-id-tarea="${idProductos}">
            <th scope="row">${p.fecha_conteo}</th>
            <td>${p.codigo}</td>
            <td>${p.stock_sistema_hasta_conteo}</td>
            <td>${p.stock_real}</td>
            <td class="${claseDiferencia} fw-bold">${p.diferencia}</td>
        </tr>`;
    });
}
