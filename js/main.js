//Documento para control de vistas 

// Desactiva todas las paginas cuyo ID comienza con "page"
function blankPage() {
  // Selecciona todos los elementos cuyo ID comienza con "page"
  var paginas = document.querySelectorAll('[id^=page]');

  // Itera sobre cada página y las oculta cambiando su estilo de visualización a "none"
  paginas.forEach(page => {
    page.style.display = 'none';
  });
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
// modal: nombre del modal
function openModal(modal){
  // Muestra el overlay y el modal correspondiente cambiando su estilo de visualización a "block"
  document.getElementById(modal+'-overlay').style.display = 'block';
  document.getElementById(modal+'-modal').style.display = 'block';
}

// Cierra el modal especificado
// modal: nombre del modal
function closeModal(modal){
  // Oculta el overlay y el modal correspondiente cambiando su estilo de visualización a "none"
  document.getElementById(modal+'-overlay').style.display = 'none';
  document.getElementById(modal+'-modal').style.display = 'none';
}

// Inicializa la pagina en vista general dependiendo del estado de la sesión
if(getCookie('jwt')){
  nosotros(); // Si hay una cookie de sesión, muestra la página de parking
} else {
  nosotros();// Si no hay una cookie de sesión, muestra la página de nosotros
}

// Oculta el elemento de pantalla de carga
document.getElementById('loadingscreen').style.display = 'none';

// Oculta el elemento de pantalla de carga
document.getElementById('loadingscreencontacto').style.display = 'none';

//Abre el modal de inicio de sesión
function openLoginModal() {
  document.getElementById('login-modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

// Cierra el modal de inicio de sesión
function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

// Muestra la página "Nosotros" y oculta las demás
function nosotros(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageNosotros').style.display = 'block';

}

function privilegios(){
  blankPage(); // Oculta todas las páginas
  document.getElementById('pagePrivilegios').style.display = 'block';
}

// Muestra la página "Parking" y oculta las demás
function parking() {
  if (isSectionAllowed('parking')) {
      blankPage(); // Oculta todas las páginas
      document.getElementById('pageParking').style.display = 'block';
  } else {
      alert('No tienes permiso para acceder a esta sección.');
  }
}
// Muestra la página "Contacto" y oculta las demás
function contacto(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageContacto').style.display = 'block';
}
// Muestra la página "Movimientos" y oculta las demás
function entradaSalida(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageMovimientos').style.display = 'block';
}
function SalidaManual(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageSalidaManual').style.display = 'block';
}
// Muestra la página "Pagos" y oculta las demás
function pagos(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pagePagos').style.display = 'block';
}
// Muestra la página "Enrolar" y oculta las demás
function enrolar(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageEnrolar').style.display = 'block';
}
// Muestra la página "Whitelist" y oculta las demás
function listablanca(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageWhitelist').style.display = 'block';
}
// Muestra la página "Buses" y oculta las demás

function buses() {
  if (isSectionAllowed('andenes')) {
      blankPage(); // Oculta todas las páginas
      document.getElementById('pageBuses').style.display = 'block';
  } else {
      alert('No tienes permiso para acceder a esta sección.');
  }
}
// Muestra la página "Empresas" y oculta las demás
function empresas(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageEmpresas').style.display = 'block';
}
// Muestra la página "destinos" y oculta las demás
function destinos(){
  blankPage();// Oculta todas las páginas
  document.getElementById('pageDestinos').style.display = 'block';
}
// Muestra la página "Baños" y oculta las demás
function banos() {
  if (isSectionAllowed('banos')) {
      // Redirige al usuario a la URL externa con el token JWT
      redirectWithJWT('https://andenes.terminal-calama.com/TerminalCalama/');
  } else {
      alert('No tienes permiso para acceder a esta sección.');
  }
}

function custodia() {
  if (isSectionAllowed('custodia')) {
      // Redirige al usuario a la URL externa con el token JWT
      redirectWithJWT('https://andenes.terminal-calama.com/TerminalCalama/custodia.html');
  } else {
      alert('No tienes permiso para acceder a esta sección.');
  }
}
// Esta función se encarga de cambiar la visibilidad de ciertos elementos en la página
function configuraciones(){
  // Verifica si el elemento con ID 'sbSubEmpresas' está actualmente oculto
  if(document.getElementById('sbSubEmpresas').style.display == 'none'){
    // Si está oculto, se muestra cambiando su estilo display a 'block'
    document.getElementById('sbSubEmpresas').style.display = 'block';
    // También se muestra otro elemento con ID 'sbSubDestinos' cambiando su estilo display a 'block'
    document.getElementById('sbSubDestinos').style.display = 'block';
  } else {
    // Si el elemento 'sbSubEmpresas' no está oculto, se ejecuta este bloque
    // Se ocultan ambos elementos cambiando su estilo display a 'none'
    document.getElementById('sbSubEmpresas').style.display = 'none';
    document.getElementById('sbSubDestinos').style.display = 'none';
  }
}

function redirectWithJWT(url) {
  const jwt = getCookie('jwt'); // Obtiene el token JWT de las cookies
  if (jwt) {
      // Si hay un token JWT, redirige con el token como parámetro de consulta
      window.location.href = `${url}?token=${jwt}`;
  } else {
      // Si no hay un token JWT, redirige sin él
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