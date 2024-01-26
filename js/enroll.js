/*
Funciones relacionadas al sistema de Listas Blancas
*/

// Obtener uno o todos los registros
const urlGetEnroll = "https://localhost/parkingCalama/php/login/get.php";
// Agregar un registro
const urlAddEnroll = "https://localhost/parkingCalama/php/whitelist/save.php";
// Actualizar un registro
const urlUpdEnroll = "https://localhost/parkingCalama/php/whitelist/update.php"
// Eliminar un registro
const urlDelEnroll = "https://localhost/parkingCalama/php/whitelist/delete.php";
// Obtener empresas
const urlEmpEnroll = "https://localhost/parkingCalama/php/whitelist/getEmpresas.php";

// Elementos
const formAddEnroll = document.getElementById('formUsrInsert');
const formUpdateEnroll = document.getElementById('formUsrUpdate');

var tableEnr = $('#tableEnroll').DataTable({
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
    let ret = await fetch(urlGetEnroll, {
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
async function getEmpresas(){
    let ret = await fetch(urlEmpEnroll, {
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
    let ret = await fetch(urlGetEnroll, {
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
function actualizarEnroll(){
    //btnRefresh.disabled = true;
    //btnRefresh.classList.add('disabled');
    getUsers()
    .then(data => {
        // Limpiamos la tabla
        tableEnr.clear();
        data.forEach(item => {
            // Generamos las filas
            const btns = `<button class="ctrl" onclick="updateUsr(${item['iduser']})">✍</button><button class="ctrlred" onclick="deleteUsr(${item['iduser']})">✕</button>`;
            tableEnr.rows.add([{
               'iduser' : item['iduser'],
               'mail' : item['mail'],
               'nivel' : item['desc'],
               'ctrl' : btns
           }]);
        });
        // Dibujamos la nueva tabla
        tableEnr.draw();
        //btnRefresh.disabled = false;
        //btnRefresh.classList.remove('disabled');
    })
    .catch(error => {
        console.log(error);
        //btnRefresh.disabled = false;
        //btnRefresh.classList.remove('disabled');
    });
}

// Elimina un registro por ID
function deleteWL(idIn){
    let wdConf = window.confirm('¿Eliminar la entrada?');

    if(wdConf){
        datos = {
            id: idIn
        }

        fetch(urlDelEnroll, {
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
                actualizarEnroll();
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}

// Abre un modal con los datos de un ID
function updateWL(idIn){
    datos = {
        id: idIn
    };

    getUsersEntry(datos)
    .then(data => {
        // Abrimos el modal de Update
        openModal('mupdate');
        formUpdateEnroll.btnSubmit.disabled = true;
        formUpdateEnroll.idWL.value = data['idwl'];
        formUpdateEnroll.patente.value = data['patente'];

        // Obtenemos la empresas
        getEmpresas()
        .then(emps => {
            formUpdateEnroll.empresa.textContent = '';
            emps.forEach(emp => {
                var optData = document.createElement('option');
                optData.value = emp['idemp'];
                optData.textContent = emp['nombre'];
                // Ingresamos el resultado al Select de empresas
                formUpdateEnroll.empresa.appendChild(optData);

                formUpdateEnroll.empresa.value = data['empresa'];
                formUpdateEnroll.btnSubmit.disabled = false;
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
}

function insertWL(){
    formAddEnroll.btnSubmit.disabled = true;
    getEmpresas()
    .then(emps => {
        formAddEnroll.empresa.textContent = '';
        emps.forEach(emp => {
            var optData = document.createElement('option');
            optData.value = emp['idemp'];
            optData.textContent = emp['nombre'];
            // Ingresamos el resultado al Select de empresas
            formAddEnroll.empresa.appendChild(optData);
            formAddEnroll.btnSubmit.disabled = false;
        });
        openModal('minsert');
    });
}

// Igresa un registro
formAddEnroll.btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    formAddEnroll.btnSubmit.disabled = true;

    if(formAddEnroll.patente.value){
        datos = {
            patente: formAddEnroll.patente.value,
            empresa: formAddEnroll.empresa.value
        };

        fetch(urlAddEnroll, {
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
                formAddEnroll.patente.value = '';
                actualizarEnroll();
                formAddEnroll.btnSubmit.disabled = false;
            } else {
                alert('Error');
                formAddEnroll.btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            console.log(error);
            formAddEnroll.btnSubmit.disabled = false;
        });
    } else {
        alert('Ingrese patente');
    }
});

// Actualiza un registro
formUpdateEnroll.btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    if(formUpdateEnroll.patente.value&&formUpdateEnroll.idWL.value){
        datos = {
            id: formUpdateEnroll.idWL.value,
            patente: formUpdateEnroll.patente.value,
            empresa: formUpdateEnroll.empresa.value
        };
    
        fetch(urlUpdEnroll, {
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
            if(data=='1062'){
                alert('Ya existe un registro para esta patente!');
            }
            else if(data==true){
                closeModal('mupdate');
                actualizarEnroll();
            } else {
                alert('Error al actualizar');
            }
        })
        .catch(error => {
            console.log(error);
        });
    } else {
        alert('Ingrese una patente')
    }
});


/*
Inicializadores
*/

actualizarEnroll();