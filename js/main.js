

  function openLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
  }

  function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('entradaSalida').style.display = 'none';
  }

  function nosotros(){

    document.getElementById('parking').style.display = 'none';
    document.getElementById('nosotros').style.display = 'block';
    document.getElementById('contacto').style.display = 'none';
    document.getElementById('entradaSalida').style.display = 'none';
  }

  function parking(){

document.getElementById('nosotros').style.display = 'none';
document.getElementById('parking').style.display = 'block';
document.getElementById('contacto').style.display = 'none';
document.getElementById('entradaSalida').style.display = 'none';

}

function contacto(){

document.getElementById('contacto').style.display = 'block';
document.getElementById('nosotros').style.display = 'none';
document.getElementById('parking').style.display = 'none';
document.getElementById('entradaSalida').style.display = 'none';

}

function entradaSalida(){

document.getElementById('entradaSalida').style.display = 'block';
document.getElementById('contacto').style.display = 'none';
document.getElementById('nosotros').style.display = 'none';
document.getElementById('parking').style.display = 'none';

}