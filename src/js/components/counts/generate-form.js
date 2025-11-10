import supabase from '../../supabase/supabase-client.js'
// Utilidades
import { loadOptions, loadProducts } from '../../utils/load-select.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('counts-form');

    container.innerHTML = 
        `<div id="counts-form-container" class="container pt-4 pb-3 collapse">
            <div class="row pb-3">
                <div class="col d-flex align-items-center">
                    <div class="ms-4 me-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-clipboard2-plus" viewBox="0 0 16 16">
                            <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z"/>
                            <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z"/>
                            <path d="M8.5 6.5a.5.5 0 0 0-1 0V8H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V9H10a.5.5 0 0 0 0-1H8.5z"/>
                        </svg>
                    </div>
                    <h5>Registrar Nuevo Conteo</h5>
                </div>
                <div class="col d-flex justify-content-end controls btn-group me-3 mb-3">
                    <div class="nav nav-pills" id="ganttTabs" role="tablist">
                        <button id="manual-tab" class="nav-link tab-btn active" data-bs-toggle="pill" data-bs-target="#tab-form-manual" type="button" role="tab">Manual</button>
                        <button id="excel-tab" class="nav-link tab-btn" data-bs-toggle="pill" data-bs-target="#tab-form-excel" type="button" role="tab">Excel</button>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="counts-tabs-content">
                <!-- Tab de Excel -->
                <div class="tab-pane fade" id="tab-form-excel" role="tabpanel">
                    <form id="form-excel">
                        <div class="row ms-2 me-2 pb-3">
                            <div class="col label-over-border">
                                <label for="excel-data" class="m-2">Datos del conteo</label>
                                <textarea id="excel-data" class="form-control" rows="4" placeholder="Ingrese los datos desde Excel con formato:  'Código, Almacén, Cantidad, Observaciones'"></textarea>
                                <p class="error invalid-feedback" id="error-excel-data" style="color: red;"></p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-end pt-1 me-3">
                            <button id="btn-cancel-excel" type="button" class="btn btn-secondary d-flex align-items-center ps-3 pe-3 me-2">Cancelar</button>
                            <button id="btn-add-excel" type="button" class="btn btn-primary d-flex align-items-center ps-3 pe-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                                    <path d="M11 2H9v3h2z"/>
                                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                                </svg>
                                <p class="ps-2">Agregar</p>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Tab de llenado manual -->
                <div class="tab-pane fade show active" id="tab-form-manual" role="tabpanel">
                    <form id="form-manual">
                        <div class="row ms-2 me-2 pt-3 pb-3">
                            <div class="col-md-2 label-over-border">
                                <label for="almacen" class="form-label m-2">Almacén</label>
                                <select id="almacen" class="form-select" aria-label="Default select example">
                                    <option value="0">Seleccione...</option>
                                </select>
                                <p class="error invalid-feedback" id="almacen-error" style="color: red;"></p>
                            </div>
                            <div class="col-md-3 label-over-border">
                                <label for="producto" class="form-label m-2">Producto</label>
                                <select id="producto" class="form-select" aria-label="Default select example" disabled>
                                    
                                </select>
                                <p class="error invalid-feedback" id="producto-error" style="color: red;"></p>
                            </div>
                            <div class="col-md-2 label-over-border">
                                <label for="cantidad" class="form-label m-2">Cantidad</label>
                                <input type="number" id="cantidad" class="form-control no-arrows" placeholder="0000">
                                <p class="error invalid-feedback" id="cantidad-error" style="color: red;"></p>
                            </div>
                            <div class="col-md-5 label-over-border">
                                <label for="observaciones" class="form-label m-2">Observaciones</label>
                                <input type="text" id="observaciones" class="form-control" placeholder="Observaciones generales">
                                <p class="error invalid-feedback" id="observaciones-error" style="color: red;"></p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-end pt-1 me-3">
                            <button id="btn-cancel-manual" type="button" class="btn btn-secondary d-flex align-items-center ps-3 pe-3 me-2">Cancelar</button>
                            <button id="btn-add-manual" type="button" class="btn btn-primary d-flex align-items-center ps-3 pe-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                                    <path d="M11 2H9v3h2z"/>
                                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                                </svg>
                                <p class="ps-2">Agregar</p>
                            </button>
                        </div>
                    </form>
                </div>
            </div>  
        </div>`;

    loadOptions('almacen', 'inv_almacenes', 'id_almacen', 'nombre')
    // Detectar cambio en el select de almacen en formulario
    document.getElementById('almacen').addEventListener('change', function() {
        const selectProducto = document.getElementById('producto');
        const storeId = this.value;
        if (storeId !== "0") {
            selectProducto.disabled = false;
            loadProducts(storeId);
        } else {
            selectProducto.disabled = true;
            document.getElementById('producto').innerHTML = '';
        }
    });

    const countsContainer = document.getElementById('counts-form-container');

    // Crear instancia única de Collapse
    const collapseInstance = new bootstrap.Collapse(countsContainer, { toggle: false });

    document.getElementById('btn-add-count').addEventListener('click', () => {
        collapseInstance.show();
    });

    document.getElementById('btn-cancel-manual').addEventListener('click', () => {
        collapseInstance.hide();
    });

    document.getElementById('btn-cancel-excel').addEventListener('click', () => {
        collapseInstance.hide();
    });
});
