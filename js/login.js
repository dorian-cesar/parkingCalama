/*
Funciones relacionadas al sistema de login y log-out
*/
// Obtener referencias a elementos HTML
const formLogin = document.getElementById('formLogin'); // Formulario de login
const btnLogin = document.getElementById('btnLogin'); // Botón de login
const formEnroll = document.getElementById('formEnroll'); // Formulario de registro
const btnEnroll = document.getElementById('formUsrInsert'); // Botón de registro


// URLs para las solicitudes al backend
// PHP para validar los datos ingresados en la base de datos
const urlLoad = "https://localhost/parkingCalama/php/login/load.php";
// PHP para validar la sesion actual
const urlValidate = "https://localhost/parkingCalama/php/login/validate.php";
// PHP para enrolar usuarios
const urlEnroll = "https://localhost/parkingCalama/php/login/enroll.php";

/* Funciones */

// Llama a PHP para validar que los datos ingresados existan en la BDD
// Obtiene un Token JWT el cual se guarda en una cookie
// Función para realizar el login
function doLogin(email, pass){
    // Objeto con los datos a enviar al servidor
    datos = {
        mail: email,
        pass: pass,
    };
    // Realizar solicitud POST al backend para validar credenciales
    fetch(urlLoad, {
        method: 'POST',
        headers: {
            'Content-type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: JSON.stringify(datos)
    })
     // Manejar la respuesta del servidor
    .then(response => response.text())
    .then(data => {
        // Guardar el token JWT en una cookie
        document.cookie = `jwt=${data};path=/; samesite=lax`;
         // Cerrar el modal de login
        closeLoginModal();
        // Inicializar la interfaz de usuario
        initUI();
        // Ejecutar una función relacionada con el sistema de parking
        parking();
      
    })
    // Manejar errores en la solicitud
    .catch(error => console.log(error));
}

// Función para cerrar sesión
// Elimina el token JWT
function logOut(){
    // Eliminar el token JWT de la cookie
    document.cookie = 'jwt=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; samesite=lax';
    // Inicializar la interfaz de usuario
    initUI();
    // Recargar la página
    location.reload();
}

// Inserta usuarios en la BDD
// Nivel 1 - Usuario
// Nivel 10 - Administrador
function createUser(email, pass, nivel){
    // Objeto con los datos del nuevo usuario
    datos = {
        mail: email,
        pass: pass,
        lvl: nivel,
    };
    // Realizar solicitud POST al backend para registrar usuario
    fetch(urlEnroll, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify(datos)
    })
    // Manejar la respuesta del servidor
    .then(reply => reply.json())
    .then(data => {
        // Mostrar un mensaje de alerta dependiendo de la respuesta del servidor
        if(data!=false){
            alert('Usuario creado correctamente!');
        } else {
            alert('Usuario ya existe!');
        }
    })
    // Manejar errores en la solicitud
    .catch(error => console.log(error));
}

// Llama a PHP para insertar un nuevo usuario

/* Control UI
// Boton Login*/
// Agregar un evento de clic al botón de login
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();// Evitar comportamiento por defecto del formulario
    // Obtener el correo electrónico y contraseña del formulario de login
    const mailStr = formLogin.email.value;
    const passStr = formLogin.password.value;
    // Llamar a la función doLogin con los datos proporcionados
    doLogin(mailStr,passStr)
});
