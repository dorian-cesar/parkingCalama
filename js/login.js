/*
Funciones relacionadas al sistema de login
*/

// Obtener referencias a elementos HTML
const formLogin = document.getElementById('formLogin'); // Formulario de login
const btnLogin = document.getElementById('btnLogin'); // Botón de login
const formEnroll = document.getElementById('formEnroll'); // Formulario de registro
const btnEnroll = document.getElementById('formUsrInsert'); // Botón de registro

// URLs para las solicitudes al backend
// PHP para validar los datos ingresados en la base de datos
const apiLogin = baseURL+"/login/api.php";

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
    fetch(apiLogin, {
        method: 'POST',
        headers: {
            'Content-type' : 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(datos)
    })
     // Manejar la respuesta del servidor
    .then(response => response.text())
    .then(data => {
        // Guardar el token JWT en una cookie
        document.cookie = `jwt=${data};path=/; samesite=lax; secure;`;
        // Recargar la pagina
        location.reload();
    })
    // Manejar errores en la solicitud
    .catch(error => console.log(error));
}

// Elimina el token JWT
function logOut(){
    document.cookie = 'jwt=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; samesite=lax';
    initUI();
    location.reload();
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
    doLogin(mailStr,passStr);
});