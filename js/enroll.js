/*
Funciones relacionadas al sistema de Listas Blancas
*/

// Elementos
var tableUser = $('#tableEnroll').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'iduser'},
        { data: 'mail'},
        { data: 'nivel'},
        { data: 'ctrl', className: 'no-sort'}
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
        .then(reply => reply.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
    return ret;
}

// Obtener todas las empresas
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

// Obtener un registro
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
function actualizarUsuarios(){
    (document.getElementById('refreshUsrBtn')).disabled = true;
    (document.getElementById('refreshUsrBtn')).classList.add('disabled');
    getUsers()
    .then(data => {
        // Limpiamos la tabla
        tableUser.clear();
        data.forEach(item => {
            // Generamos las filas
            const btns = `<button class="ctrl fa fa-pencil" onclick="updateUsr(${item['iduser']})"></button><button class="ctrlred fa fa-trash" onclick="deleteUsr(${item['iduser']})"></button>`;
            tableUser.rows.add([{
               'iduser' : item['iduser'],
               'mail' : item['mail'],
               'nivel' : item['descriptor'],
               'ctrl' : btns
           }]);
        });
        // Dibujamos la nueva tabla
        tableUser.draw();
        (document.getElementById('refreshUsrBtn')).disabled = false;
        (document.getElementById('refreshUsrBtn')).classList.remove('disabled');
    })
    .catch(error => {
        console.log(error);
        (document.getElementById('refreshUsrBtn')).disabled = false;
        (document.getElementById('refreshUsrBtn')).classList.remove('disabled');
    });
}

// Elimina un registro por ID
function deleteUsr(idIn){
    let wdConf = window.confirm('¿Eliminar la entrada?');

    if(wdConf){
        datos = {
            id: idIn
        }

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
            if(data==true){
                alert('Registro eliminado correctamente.');
                actualizarUsuarios();
            }
        })
        .catch(error => {
            console.log(error);
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
(document.getElementById('formUsrUpdate')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

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

actualizarUsuarios();