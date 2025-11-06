
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

// Crear barra superior
function createBar(bar) {
    bar.insertAdjacentHTML(
        "beforeend",
        `<div class="logout d-flex align-items-center">
            <button id="btn-logout" class="btn">Salir</button>
        </div>`
    );
}

// Crear navbar
function createNavbar(navbar) {
    const currentLocation = window.location.href;
    let logoHref = "./index.html"; // Valor por defecto

    if (currentLocation.includes("login.html")) {
        logoHref.disabled = true;
    }

    navbar.insertAdjacentHTML(
        "beforeend",
        `<div class="container-fluid">
            <a id="nav-logo" class="navbar-brand" href="${logoHref}">
                <img src="/favicon.png" alt="Pallets Alfa logo">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
                <ul class="navbar-nav mx-auto">
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="/src/pages/products.html">Productos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="/src/pages/movements.html">Movimientos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="/src/pages/counts.html">Conteos</a></li>
                    <li class="nav-item ms-2 me-2"><a class="nav-link nav-prin" href="/src/pages/reports.html">Reportes</a></li>
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