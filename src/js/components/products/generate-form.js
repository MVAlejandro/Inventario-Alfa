// Utilidades
import { loadOptions } from '../../utils/load-select.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('products-form');

    container.innerHTML = 
        `<div id="products-form-container" class="container pt-4 pb-3 collapse">
            <div class="row pb-3">
                <div class="col d-flex align-items-center">
                    <div class="ms-4 me-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
                        </svg>
                    </div>
                    <h5>Registrar Nuevo Producto</h5>
                </div>
                <div class="col d-flex justify-content-end controls btn-group me-3 mb-3">
                    <div class="nav nav-pills" id="ganttTabs" role="tablist">
                        <button id="manual-tab" class="nav-link tab-btn active" data-bs-toggle="pill" data-bs-target="#tab-form-manual" type="button" role="tab">Manual</button>
                        <button id="excel-tab" class="nav-link tab-btn" data-bs-toggle="pill" data-bs-target="#tab-form-excel" type="button" role="tab">Excel</button>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="products-tabs-content">
                <!-- Tab de Excel -->
                <div class="tab-pane fade" id="tab-form-excel" role="tabpanel">
                    <form id="form-excel">
                        <div class="row ms-2 me-2 pb-3">
                            <div class="col label-over-border">
                                <label for="excel-data" class="m-2">Datos del producto</label>
                                <textarea id="excel-data" class="form-control" rows="4" placeholder="Ingrese los datos desde Excel con formato:  'Código, Nombre, Almacén, Descripción'"></textarea>
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
                                <label for="codigo" class="form-label m-2">Código</label>
                                <input type="text" id="codigo" class="form-control" placeholder="TAR1000">
                                <p class="error invalid-feedback" id="error-codigo" style="color: red;"></p>
                            </div>
                            <div class="col-md-3 label-over-border">
                                <label for="nombre" class="form-label m-2">Nombre</label>
                                <input type="text" id="nombre" class="form-control" placeholder="Tarima Estándar">
                                <p class="error invalid-feedback" id="error-nombre" style="color: red;"></p>
                            </div>
                            <div class="col-md-2 label-over-border">
                                <label for="almacen" class="form-label m-2">Almacén</label>
                                <select id="almacen" class="form-select" aria-label="Default select example">
                                    <option value="0">Seleccione...</option>
                                    
                                </select>
                                <p class="error invalid-feedback" id="error-almacen" style="color: red;"></p>
                            </div>
                            <div class="col-md-5 label-over-border">
                                <label for="descripcion" class="form-label m-2">Descripción</label>
                                <input type="text" id="descripcion" class="form-control" placeholder="Descripción del producto">
                                <p class="error invalid-feedback" id="error-descripcion" style="color: red;"></p>
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

    const productsContainer = document.getElementById('products-form-container');

    // Crear instancia única de Collapse
    const collapseInstance = new bootstrap.Collapse(productsContainer, { toggle: false });

    document.getElementById('btn-add-product').addEventListener('click', () => {
        collapseInstance.show();
    });

    document.getElementById('btn-cancel-manual').addEventListener('click', () => {
        collapseInstance.hide();
    });

    document.getElementById('btn-cancel-excel').addEventListener('click', () => {
        collapseInstance.hide();
    });
});
