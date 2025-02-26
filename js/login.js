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
    const datos = { mail: email, pass: pass };

    axios.post(apiLogin, datos)
        .then(function (response) {
            const data = response.data;

            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                // Guardar el token JWT en una cookie
                document.cookie = `jwt=${data.token};path=/; samesite=None; secure;`;

                // Almacenar los datos del usuario en localStorage
                localStorage.setItem('userData', JSON.stringify(data.user));

                // Ocultar las secciones no asignadas del navbar
                hideUnassignedSections(data.user.secciones);

                // Recargar la página
                location.reload();
            }
        })
        .catch(function (error) {
            console.error(error);
            alert('Ocurrió un error al intentar iniciar sesión. Inténtelo más tarde.');
        });
}
function hideUnassignedSections(userSections) {
    const allSections = {
        'parking': 'nbUsrParking',
        'andenes': 'nbUsrbuses',
        'banos': 'nbUsrBanos',
        'custodias': 'nbUsrCustodias'
    };

    // Iterar sobre todas las secciones y ocultar/mostrar según los permisos
    for (const [section, id] of Object.entries(allSections)) {
        const navElement = document.getElementById(id);
        if (navElement) {
            if (userSections.includes(section)) {
                navElement.style.display = 'inline-block'; // Mostrar si está asignado
            } else {
                navElement.style.display = 'none'; // Ocultar si no está asignado
            }
        }
    }
}

// Elimina el token JWT
function doLogout() {
    // Eliminar la cookie del token
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; samesite=None; secure;';
    
    // Eliminar los datos del usuario del localStorage
    localStorage.removeItem('userData');

    // Recargar la página
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
