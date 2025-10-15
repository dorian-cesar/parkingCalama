// ===============================
// 🌎 CONFIGURACIÓN DE ENTORNO
// ===============================
const ENV = "dev"; // Cambia a "prod" para producción

const CONFIG = {
  dev: {
    BASE_URL: "http://localhost/parkingCalama/php/",
    BANOS_URL: "http://localhost/TerminalCalama/",
    CUSTODIA_URL: "http://localhost/TerminalCalama/custodia.html",
    CAJA_URL: "http://localhost/caja-calama/caja.html",
    MONITOREO_URL: "http://localhost:5173/", // Ejemplo de entorno local
  },
  prod: {
    BASE_URL: "https://andenes.terminal-calama.com/php/",
    BANOS_URL: "https://andenes.terminal-calama.com/TerminalCalama/",
    CUSTODIA_URL: "https://andenes.terminal-calama.com/TerminalCalama/custodia.html",
    CAJA_URL: "https://andenes.terminal-calama.com/caja-calama/caja.html",
    MONITOREO_URL: "https://monitoreo-calama.netlify.app/",
  },
};

const ENV_CONFIG = CONFIG[ENV];

// ===============================
// 📄 CONTROL DE VISTAS
// ===============================

// Desactiva todas las paginas cuyo ID comienza con "page"
function blankPage() {
  var paginas = document.querySelectorAll('[id^=page]');
  paginas.forEach(page => (page.style.display = 'none'));
}

// Iniciar Tablas
refreshWL();
refreshDest();
refreshUsr();
refreshEmp();
refreshMov();
refreshPagos();
listarAndenesDestinos();

// Abre el modal especificado
function openModal(modal) {
  document.getElementById(modal + '-overlay').style.display = 'block';
  document.getElementById(modal + '-modal').style.display = 'block';
}

// Cierra el modal especificado
function closeModal(modal) {
  document.getElementById(modal + '-overlay').style.display = 'none';
  document.getElementById(modal + '-modal').style.display = 'none';
}

// Inicializa la página según sesión
if (getCookie('jwt')) {
  nosotros();
} else {
  nosotros();
}
configurarNavbar();

document.getElementById('loadingscreen').style.display = 'none';
document.getElementById('loadingscreencontacto').style.display = 'none';

function openLoginModal() {
  document.getElementById('login-modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function nosotros() {
  blankPage();
  document.getElementById('pageNosotros').style.display = 'block';
}

function privilegios() {
  blankPage();
  document.getElementById('pagePrivilegios').style.display = 'block';
}

function parking() {
  if (isSectionAllowed('parking')) {
    blankPage();
    document.getElementById('pageParking').style.display = 'block';
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function contacto() {
  blankPage();
  document.getElementById('pageContacto').style.display = 'block';
}

function entradaSalida() {
  blankPage();
  document.getElementById('pageMovimientos').style.display = 'block';
}

function SalidaManual() {
  blankPage();
  document.getElementById('pageSalidaManual').style.display = 'block';
}

function pagos() {
  blankPage();
  document.getElementById('pagePagos').style.display = 'block';
}

function enrolar() {
  blankPage();
  document.getElementById('pageEnrolar').style.display = 'block';
}

function listablanca() {
  blankPage();
  document.getElementById('pageWhitelist').style.display = 'block';
}

function buses() {
  if (isSectionAllowed('andenes')) {
    blankPage();
    document.getElementById('pageBuses').style.display = 'block';
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function empresas() {
  blankPage();
  document.getElementById('pageEmpresas').style.display = 'block';
}

function destinos() {
  blankPage();
  document.getElementById('pageDestinos').style.display = 'block';
}

function banos() {
  if (isSectionAllowed('banos')) {
    redirectWithJWT(ENV_CONFIG.BANOS_URL);
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function custodia() {
  if (isSectionAllowed('custodias')) {
    redirectWithJWT(ENV_CONFIG.CUSTODIA_URL);
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function caja() {
  if (isSectionAllowed('caja')) {
    redirectWithJWT(ENV_CONFIG.CAJA_URL);
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function monitoreo() {
  redirectWithJWT(ENV_CONFIG.MONITOREO_URL);
}

// ===============================
// 🧭 UTILIDADES
// ===============================

function configuraciones() {
  const emp = document.getElementById('sbSubEmpresas');
  const dest = document.getElementById('sbSubDestinos');
  const mostrar = emp.style.display === 'none';
  emp.style.display = mostrar ? 'block' : 'none';
  dest.style.display = mostrar ? 'block' : 'none';
}

function redirectWithJWT(url) {
  const jwt = getCookie('jwt');
  if (jwt) {
    window.location.href = `${url}?token=${jwt}`;
  } else {
    window.location.href = url;
  }
}

function isSectionAllowed(section) {
  const userData = localStorage.getItem('userData');
  if (!userData) return false;
  const user = JSON.parse(userData);
  return user.secciones.includes(section);
}

function navigateToSection(section) {
  if (isSectionAllowed(section)) {
    window.location.href = `/${section}`;
  } else {
    alert('No tienes permiso para acceder a esta sección.');
  }
}

function configurarNavbar() {
  const userData = localStorage.getItem('userData');
  if (!userData) return;

  const user = JSON.parse(userData);
  const seccionesPermitidas = user.secciones || [];

  const navbarMapping = {
    nbUsrParking: 'parking',
    nbUsrbuses: 'andenes',
    nbUsrBanos: 'banos',
    nbUsrCustodias: 'custodias',
    nbUsrCaja: 'caja',
  };

  for (const [id, seccion] of Object.entries(navbarMapping)) {
    const elemento = document.getElementById(id);
    if (!elemento) continue;
    if (seccionesPermitidas.includes(seccion)) {
      elemento.classList.remove('hidden');
    } else {
      elemento.classList.add('hidden');
    }
  }

  if (user.lvl >= 10) {
    document.getElementById('nbAdmMonitoreo').classList.remove('hidden');
  }

  document.querySelector('#navbar a[onclick="nosotros()"]').classList.remove('hidden');
  document.querySelector('#navbar a[onclick="contacto()"]').classList.remove('hidden');
}