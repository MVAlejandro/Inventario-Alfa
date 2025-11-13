import supabase from '../supabase/supabase-client'

document.addEventListener("DOMContentLoaded", () => {
    const bar = document.getElementById("top-bar");
    const navbar = document.getElementById("site-navbar");
    const footer = document.getElementById("site-footer");

    // Crear barra superior, navbar y footer
    createBar(bar);
    createNavbar(navbar);
    createFooter(footer);

    // Marcar la pestaña activa en la navbar
    activePage();
});

// Función para cerrar sesión con Supabase
async function logOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error al cerrar sesión:", error);

        window.location.href = "./login.html";
    } catch (error) {
        console.error("Error inesperado al cerrar sesión:", error);
        window.location.href = "./login.html";
    }
}

// Crear barra superior
function createBar(bar) {
    bar.insertAdjacentHTML(
        "beforeend",
        `<div class="logout d-flex align-items-center justify-content-end">
            <button id="btn-logout" class="btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0z"/>
                    <path fill-rule="evenodd" d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                </svg>
                <p class="small ps-2">Salir</p>
            </button>
        </div>`
    );

    document.getElementById("btn-logout").addEventListener("click", logOut);
}

// Crear navbar
function createNavbar(navbar) {
    navbar.insertAdjacentHTML(
        "beforeend",
        `<div class="container-fluid">
            <a id="nav-logo" class="navbar-brand" href="./index.html">
                <img src="./favicon.png" alt="Pallets Alfa logo">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
                <ul class="navbar-nav mx-auto">
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./products.html">Productos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./movements.html">Movimientos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./counts.html">Conteos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="./reports.html">Reportes</a></li>
                </ul>
            </div>
            <svg id="nav-fill" xmlns="http://www.w3.org/2000/svg" width="62" height="62" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
        </div>`
    );
}

// Crear footer
function createFooter(footer) {
    footer.insertAdjacentHTML(
        "beforeend",
        `<div class="container">
            <hr>
            <div class="row align-items-center">
                <div id="footer-text" class="col text-center">
                    <small>2025 Pallets Alfa Texcoco. Todos los derechos reservados.</small>
                </div>
            </div>
            <br>
        </div>`
    );
}

// Marcar la pestaña activa en la navbar
function activePage() {
    const currentLocation = window.location.href;
    const menuItems = document.querySelectorAll(".nav-link");

    menuItems.forEach(item => {
        if (item.href === currentLocation) {
            item.classList.add("link-active");
        }
    });
}