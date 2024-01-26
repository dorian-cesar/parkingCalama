/*
Funciones relacionadas al sistema de Listas Blancas
*/

// Obtener uno o todos los registros
const urlGet = "https://localhost/parkingCalama/php/wl/get.php";
// Agregar un registro
const urlAdd = "https://localhost/parkingCalama/php/whitelist/save.php";
// Actualizar un registro
const urlUpd = "https://localhost/parkingCalama/php/whitelist/update.php"
// Eliminar un registro
const urlDel = "https://localhost/parkingCalama/php/whitelist/delete.php";
// Obtener empresas
const urlEmp = "https://localhost/parkingCalama/php/whitelist/getEmpresas.php";

// Elementos
const formAdd = document.getElementById('formWLInsert');
const formUpdate = document.getElementById('formWLUpdate');

const btnRefresh = document.getElementById('refreshWLBtn');

var tableWL = $('#tableWhitelist').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idwl'},
        { data: 'patente'},
        { data: 'nombre'},
        { data: 'ctrl', className: 'no-sort'}
    ]
});

/*
Funciones de API
*/

// Obtener todos los registros
async function getWhitelist(){
    let ret = await fetch(urlGet, {
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
    let ret = await fetch(urlEmp, {
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
async function getWhitelistEntry(datos){
    let ret = await fetch(urlGet, {
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
function actualizarWhitelist(){
    btnRefresh.disabled = true;
    btnRefresh.classList.add('disabled');
    getWhitelist()
    .then(data => {
        // Limpiamos la tabla
        tableWL.clear();
        data.forEach(item => {
            // Generamos las filas
            const btns = `<button class="ctrl" onclick="updateWL(${item['idwl']})">✍</button><button class="ctrlred" onclick="deleteWL(${item['idwl']})">✕</button>`;
            tableWL.rows.add([{
               'idwl' : item['idwl'],
               'patente' : item['patente'],
               'nombre' : item['nombre'],
               'ctrl' : btns
           }]);
        });
        // Dibujamos la nueva tabla
        tableWL.draw();
        btnRefresh.disabled = false;
        btnRefresh.classList.remove('disabled');
    })
    .catch(error => {
        console.log(error);
        btnRefresh.disabled = false;
        btnRefresh.classList.remove('disabled');
    });
}

// Elimina un registro por ID
function deleteWL(idIn){
    let wdConf = window.confirm('¿Eliminar la entrada?');

    if(wdConf){
        datos = {
            id: idIn
        }

        fetch(urlDel, {
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
                actualizarWhitelist();
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

    getWhitelistEntry(datos)
    .then(data => {
        // Abrimos el modal de Update
        openModal('mupdate');
        formUpdate.btnSubmit.disabled = true;
        formUpdate.idWL.value = data['idwl'];
        formUpdate.patente.value = data['patente'];

        // Obtenemos la empresas
        getEmpresas()
        .then(emps => {
            formUpdate.empresa.textContent = '';
            emps.forEach(emp => {
                var optData = document.createElement('option');
                optData.value = emp['idemp'];
                optData.textContent = emp['nombre'];
                // Ingresamos el resultado al Select de empresas
                formUpdate.empresa.appendChild(optData);

                formUpdate.empresa.value = data['empresa'];
                formUpdate.btnSubmit.disabled = false;
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
}

function insertWL(){
    formAdd.btnSubmit.disabled = true;
    getEmpresas()
    .then(emps => {
        formAdd.empresa.textContent = '';
        emps.forEach(emp => {
            var optData = document.createElement('option');
            optData.value = emp['idemp'];
            optData.textContent = emp['nombre'];
            // Ingresamos el resultado al Select de empresas
            formAdd.empresa.appendChild(optData);
            formAdd.btnSubmit.disabled = false;
        });
        openModal('minsert');
    });
}

// Igresa un registro
formAdd.btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    formAdd.btnSubmit.disabled = true;

    if(formAdd.patente.value){
        datos = {
            patente: formAdd.patente.value,
            empresa: formAdd.empresa.value
        };

        fetch(urlAdd, {
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
                formAdd.patente.value = '';
                actualizarWhitelist();
                formAdd.btnSubmit.disabled = false;
            } else {
                alert('Error');
                formAdd.btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            console.log(error);
            formAdd.btnSubmit.disabled = false;
        });
    } else {
        alert('Ingrese patente');
    }
});

// Actualiza un registro
formUpdate.btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    if(formUpdate.patente.value&&formUpdate.idWL.value){
        datos = {
            id: formUpdate.idWL.value,
            patente: formUpdate.patente.value,
            empresa: formUpdate.empresa.value
        };
    
        fetch(urlUpd, {
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
                actualizarWhitelist();
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

actualizarWhitelist();