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
const apiLogin = baseURL + "/login/api.php";

/* Funciones */

// Llama a PHP para validar que los datos ingresados existan en la BDD
// Obtiene un Token JWT el cual se guarda en una cookie
// Función para realizar el login
function doLogin(email, pass) {
    // Objeto con los datos a enviar al servidor
    const datos = {
        mail: email,
        pass: pass,
    };

    // Realizar solicitud POST al backend para validar credenciales
    axios.post(apiLogin, datos)
        .then(function (response) {
            // Validar si la respuesta indica un error
            if (response.data === 'Error') {
                // Mostrar mensaje de error
                alert('Error: Credenciales incorrectas. Por favor, intente de nuevo.');
            } else {
                // Guardar el token JWT en una cookie
                document.cookie = `jwt=${response.data};path=/; samesite=lax; secure;`;
                
                // Recargar la página
                location.reload();
            }
        })
        .catch(function (error) {
            // Manejar errores en la solicitud
            console.error(error);
            alert('Ocurrió un error al intentar iniciar sesión. Inténtelo más tarde.');
        });
}

// Elimina el token JWT
function logOut() {
    document.cookie = 'jwt=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; samesite=lax';
    initUI();
    location.reload();
}

/* Control UI */
// Botón Login
// Agregar un evento de clic al botón de login
btnLogin.addEventListener('click', (e) => {
    e.preventDefault(); // Evitar comportamiento por defecto del formulario
    // Obtener el correo electrónico y contraseña del formulario de login
    const mailStr = formLogin.email.value;
    const passStr = formLogin.password.value;
    // Llamar a la función doLogin con los datos proporcionados
    doLogin(mailStr, passStr);
});
