/*
Funciones relacionadas al sistema de login
*/

const formLogin = document.getElementById('formLogin');
const btnLogin = document.getElementById('btnLogin');
const formEnroll = document.getElementById('formEnroll');
const btnEnroll = document.getElementById('btnEnroll');

// PHP para validar los datos ingresados en la base de datos
const urlLoad = "https://localhost/parkingCalama/php/login/load.php";
// PHP para validar la sesion actual
const urlValidate = "https://localhost/parkingCalama/php/login/validate.php";
// PHP para enrolar usuarios
const urlEnroll = "https://localhost/parkingCalama/php/login/enroll.php";

/* Funciones */

// Llama a PHP para validar que los datos ingresados existan en la BDD
// Obtiene un Token JWT el cual se guarda en una cookie
function doLogin(email, pass){
    datos = {
        mail: email,
        pass: pass,
    };

    fetch(urlLoad, {
        method: 'POST',
        headers: {
            'Content-type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.text())
    .then(data => {
        document.cookie = `jwt=${data};path=/; samesite=lax`
        closeLoginModal();
    })
    .catch(error => console.log(error));
}

// Inserta usuarios en la BDD
// Nivel 1 - Usuario
// Nivel 10 - Administrador
function createUser(email, pass, nivel){
    datos = {
        mail: email,
        pass: pass,
        lvl: nivel,
    };

    fetch(urlEnroll, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => {
        console.log(data);
        if(data!=false){
            alert('Usuario creado correctamente!');
        } else {
            alert('Usuario ya existe!');
        }
    })
    .catch(error => console.log(error));
}

// Llama a PHP para insertar un nuevo usuario

/* Control UI */
// Boton Login
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const mailStr = formLogin.email.value;
    const passStr = formLogin.password.value;
    doLogin(mailStr,passStr)
});

// Boton Enroll
btnEnroll.addEventListener('click', (e) => {
    e.preventDefault();
    const mailStr = formEnroll.email.value;
    const passStr = formEnroll.password.value;
    const nivelStr = formEnroll.nivel.value;
    createUser(mailStr,passStr, nivelStr)
});