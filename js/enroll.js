/*
CRUD Tabla usuarios 
*/


// Elementos
var tableUser = $('#tableEnroll').DataTable({
    // Configuración inicial de la tabla
    order: [[0, 'desc']], // Orden inicial por la primera columna en orden descendente
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" }, // Configuración del idioma de la tabla
    columnDefs : [ {
        targets: 'no-sort', // Selector de columnas que no se pueden ordenar
        orderable: false, // Desactiva la capacidad de ordenar para esas columnas
    }],
    columns: [
        { data: 'iduser'}, // Columna de ID de usuario
        { data: 'mail'}, // Columna de correo electrónico
        { data: 'nivel'}, // Columna de nivel de usuario
        { data: 'ctrl', className: 'no-sort'} // Columna de controles con clases de estilo
    ]
});

/*
Funciones de API
*/

// Obtener todos los registros
async function getUsers(){
    let ret = await fetch("https://localhost/parkingCalama/php/login/get.php", {
            method: 'POST',
            mode: 'cors'
        })
        .then(reply => reply.json()) // Convierte la respuesta a JSON
        .then(data => {
            return data; // Retorna los datos obtenidos
        })
        .catch(error => {
            console.log(error); // Manejo de errores
        });
    return ret; // Retorna los datos obtenidos
}


// Obtener todas las empresas
// Similar a getUsers pero con una URL diferente
async function getPermisos(){
    let ret = await fetch("https://localhost/parkingCalama/php/login/getPermisos.php", {
            method: 'POST',
            mode: 'cors'
        })
        .then(reply => reply.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
    return ret;
}

// Obtener un registro de usuario específico
// Similar a getUsers pero con datos específicos y una URL diferente
async function getUsersEntry(datos){
    
    let ret = await fetch("https://localhost/parkingCalama/php/login/get.php", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
    return ret;
}

/*
Control de UI
*/

// Regenera la tabla
// Función para actualizar la tabla de usuarios
function actualizarUsuarios(){
    // Deshabilita el botón de actualización y aplica estilos
    (document.getElementById('refreshUsrBtn')).disabled = true;
    (document.getElementById('refreshUsrBtn')).classList.add('disabled');
    
    // Obtiene los datos de usuarios
    getUsers()
    .then(data => {
        // Limpiamos la tabla
        tableUser.clear();
        
        // Itera sobre los datos y agrega filas a la tabla
        data.forEach(item => {
            // Genera los botones de control
            const btns = `<button class="ctrl fa fa-pencil" onclick="updateUsr(${item['iduser']})"></button><button class="ctrlred fa fa-trash" onclick="deleteUsr(${item['iduser']})"></button>`;
            // Agrega la fila a la tabla
            tableUser.rows.add([{
               'iduser' : item['iduser'],
               'mail' : item['mail'],
               'nivel' : item['descriptor'],
               'ctrl' : btns
           }]);
        });
        
        // Dibuja la tabla con los nuevos datos
        tableUser.draw();
        
        // Habilita nuevamente el botón de actualización y aplica estilos
        (document.getElementById('refreshUsrBtn')).disabled = false;
        (document.getElementById('refreshUsrBtn')).classList.remove('disabled');
    })
    .catch(error => {
        console.log(error); // Manejo de errores
        // Habilita nuevamente el botón de actualización y aplica estilos en caso de error
        (document.getElementById('refreshUsrBtn')).disabled = false;
        (document.getElementById('refreshUsrBtn')).classList.remove('disabled');
    });
}

// Elimina un registro por ID
function deleteUsr(idIn){
    // Muestra un mensaje de confirmación antes de eliminar
    let wdConf = window.confirm('¿Eliminar la entrada?');
    // Si el usuario confirma, procede con la eliminación
    if(wdConf){
        // Prepara los datos para enviar al servidor
        datos = {
            id: idIn
        }
        // Realiza una solicitud para eliminar el usuario del servidor
        fetch("https://localhost/parkingCalama/php/login/delete.php", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(data => {
            // Si la eliminación es exitosa, muestra un mensaje y actualiza la tabla de usuarios
            if(data==true){
                alert('Registro eliminado correctamente.');
                actualizarUsuarios();
            }
        })
        .catch(error => {
            console.log(error);// Manejo de errores
        });
    }
}

// Abre un modal con los datos de un ID
function updateUsr(idIn){
    datos = {
        id: idIn
    };

    getUsersEntry(datos)
    .then(data => {
        // Abrimos el modal de Update
        openModal('mUsrUpdate');
        (document.getElementById('formUsrUpdate')).btnSubmit.disabled = true;
        (document.getElementById('formUsrUpdate')).idUsr.value = data['iduser'];
        (document.getElementById('formUsrUpdate')).mail.value = data['mail'];
        (document.getElementById('formUsrUpdate')).pass.value = '';
        (document.getElementById('formUsrUpdate')).oldpass.value = '';

        // Obtenemos la empresas
        getPermisos()
        .then(emps => {
            (document.getElementById('formUsrUpdate')).nivel.textContent = '';
            emps.forEach(emp => {
                var optData = document.createElement('option');
                optData.value = emp['nivel'];
                optData.textContent = emp['descriptor'];
                // Ingresamos el resultado al Select de empresas
                (document.getElementById('formUsrUpdate')).nivel.appendChild(optData);

                (document.getElementById('formUsrUpdate')).nivel.value = data['nivel'];
                (document.getElementById('formUsrUpdate')).btnSubmit.disabled = false;
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
}
// Función para insertar un nuevo usuario
function insertUsr(){
    (document.getElementById('formUsrInsert')).btnSubmit.disabled = true;
    getPermisos()
    .then(emps => {
        (document.getElementById('formUsrInsert')).nivel.textContent = '';
        emps.forEach(emp => {
            var optData = document.createElement('option');
            optData.value = emp['nivel'];
            optData.textContent = emp['descriptor'];
            // Ingresamos el resultado al Select de empresas
            (document.getElementById('formUsrInsert')).nivel.appendChild(optData);
            (document.getElementById('formUsrInsert')).btnSubmit.disabled = false;
        });
        openModal('mUsrInsert');
    });
}

// Igresa un registro
// Listener de evento para el botón de envío en el formulario de inserción
(document.getElementById('formUsrInsert')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    (document.getElementById('formUsrInsert')).btnSubmit.disabled = true;

    if((document.getElementById('formUsrInsert')).mail.value&&(document.getElementById('formUsrInsert')).pass.value){
        datos = {
            mail: (document.getElementById('formUsrInsert')).mail.value,
            pass: (document.getElementById('formUsrInsert')).pass.value,
            lvl: (document.getElementById('formUsrInsert')).nivel.value
        };

        fetch("https://localhost/parkingCalama/php/login/enroll.php", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(data => {
            if(data!=false){
                (document.getElementById('formUsrInsert')).mail.value = '';
                (document.getElementById('formUsrInsert')).pass.value = '';
                actualizarUsuarios();
                (document.getElementById('formUsrInsert')).btnSubmit.disabled = false;
                closeModal('mUsrInsert');
            } else {
                alert('Error');
                (document.getElementById('formUsrInsert')).btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            console.log(error);
            (document.getElementById('formUsrInsert')).btnSubmit.disabled = false;
        });
    } else {
        alert('Ingrese correo y contraseña');
    }
});

// Actualiza un registro
// Listener de evento para el botón de envío en el formulario de actualización
(document.getElementById('formUsrUpdate')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    // Manejo del evento de clic en el botón de envío
    if((document.getElementById('formUsrUpdate')).mail.value&&(document.getElementById('formUsrUpdate')).pass.value&&(document.getElementById('formUsrUpdate')).idUsr.value){
        datos = {
            id: (document.getElementById('formUsrUpdate')).idUsr.value,
            mail: (document.getElementById('formUsrUpdate')).mail.value,
            passOld: (document.getElementById('formUsrUpdate')).oldpass.value,
            pass: (document.getElementById('formUsrUpdate')).pass.value,
            lvl: (document.getElementById('formUsrUpdate')).nivel.value
        };
    
        fetch("https://localhost/parkingCalama/php/login/update.php", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(data => {
            if(data==true){
                closeModal('mUsrUpdate');
                actualizarUsuarios();
                alert('Actualizado correctamente!')
            } else {
                alert('Contraseña incorrecta!');
            }
        })
        .catch(error => {
            console.log(error);
        });
    } else {
        alert('Ingrese un correo y contraseña!')
    }
});


/*
Inicializadores
*/
// Llama a la función de actualización de usuarios para cargar la tabla inicialmente
actualizarUsuarios();