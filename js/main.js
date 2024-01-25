// Desactiva todas las paginas cuyo ID comienza con "page"
function blankPage() {
  var paginas = document.querySelectorAll('[id^=page]');

  paginas.forEach(page => {
    page.style.display = 'none';
  });
}

// Inicializa la pagina en vista general
parking();

function openLoginModal() {
  document.getElementById('login-modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function nosotros(){
  blankPage();
  document.getElementById('pageNosotros').style.display = 'block';
}

function parking(){
  blankPage();
  document.getElementById('pageParking').style.display = 'block';
}

function contacto(){
  blankPage();
  document.getElementById('pageContacto').style.display = 'block';
}

function entradaSalida(){
  blankPage();
  document.getElementById('pageMovimientos').style.display = 'block';
}

function enrolar(){
  blankPage();
  document.getElementById('pageEnrolar').style.display = 'block';
}

function listablanca(){
  blankPage();
  document.getElementById('pageWhitelist').style.display = 'block';
}