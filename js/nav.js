
// IMPORTACIÓN DE FUNCIONES EXTERNAS
// import supabase from './supabase/supabase-client.js'

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("site_header");
    const footer = document.getElementById("site_footer");
    const bar = document.getElementById("top_bar");

    // Crear barra superior, header y footer
    crearBarra(bar);
    crearHeader(header);
    crearFooter(footer);

    // Marcar la pestaña activa en la navbar
    marcarPestanaActiva();
});

// Función para cerrar sesión con Supabase


// Crear barra superior
function crearBarra(bar) {
    bar.insertAdjacentHTML(
        "beforeend",
        `<div class="cerrar_sesion d-flex align-items-center">
            <button id="btn_logout" class="btn">Salir</button>
        </div>`
    );

    // document.getElementById("btn_logout").addEventListener("click", cerrarSesion);
}

// Crear header/navbar
function crearHeader(header) {
    const currentLocation = window.location.href;
    let logoHref = "./inventario.html"; // Valor por defecto

    if (currentLocation.includes("login.html")) {
        logoHref = "https://palletsalfatexcoco.com.mx/inicio/";
    }

    header.insertAdjacentHTML(
        "afterbegin",
        `<nav id="nav_principal" class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <a id="nav_logo" class="navbar-brand" href="${logoHref}">
                    <img src="./assets/Logo-Color-PNG-62x51.png" alt="Pallets Alfa logo">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                    aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
                    <ul class="navbar-nav">
                        <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./productos.html">Productos</a></li>
                        <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./gestion.html">Gestión</a></li>
                        <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./conteos.html">Inventario</a></li>
                        <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./reportes.html">Reportes</a></li>
                    </ul>
                </div>
            </div>
        </nav>`
    );
}

// Crear footer
function crearFooter(footer) {
    footer.insertAdjacentHTML(
        "beforeend",
        `<div class="container">
            <hr>
            <div class="row align-items-center">
                <div id="img_footer" class="col text-start"></div>
                <div id="texto_footer" class="col text-end">
                    <p>Pallets Alfa Texcoco</p>
                </div>
            </div>
            <br>
        </div>`
    );
}

// Marcar la pestaña activa en la navbar
function marcarPestanaActiva() {
    const currentLocation = window.location.href;
    const menuItems = document.querySelectorAll(".nav-link");

    menuItems.forEach(item => {
        if (item.href === currentLocation) {
            item.classList.add("active");
        }
    });
}
