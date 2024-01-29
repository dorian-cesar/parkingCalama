/*
Funciones relacionadas al sistema de Listas Blancas
*/

// Elementos
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
    let ret = await fetch("https://localhost/parkingCalama/php/wl/get.php", {
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
    let ret = await fetch("https://localhost/parkingCalama/php/wl/get.php", {
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
    (document.getElementById('refreshWLBtn')).disabled = true;
    (document.getElementById('refreshWLBtn')).classList.add('disabled');
    getWhitelist()
    .then(data => {
        // Limpiamos la tabla
        tableWL.clear();
        data.forEach(item => {
            // Generamos las filas
            const btns = `<button class="ctrl fa fa-pencil" onclick="updateWL(${item['idwl']})"></button><button class="ctrlred fa fa-trash" onclick="deleteWL(${item['idwl']})"></button>`;
            tableWL.rows.add([{
               'idwl' : item['idwl'],
               'patente' : item['patente'],
               'nombre' : item['nombre'],
               'ctrl' : btns
           }]);
        });
        // Dibujamos la nueva tabla
        tableWL.draw();
        (document.getElementById('refreshWLBtn')).disabled = false;
        (document.getElementById('refreshWLBtn')).classList.remove('disabled');
    })
    .catch(error => {
        console.log(error);
        (document.getElementById('refreshWLBtn')).disabled = false;
        (document.getElementById('refreshWLBtn')).classList.remove('disabled');
    });
}

// Elimina un registro por ID
function deleteWL(idIn){
    let wdConf = window.confirm('¿Eliminar la entrada?');

    if(wdConf){
        datos = {
            id: idIn
        }

        fetch("https://localhost/parkingCalama/php/whitelist/delete.php", {
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
        (document.getElementById('formWLUpdate')).btnSubmit.disabled = true;
        (document.getElementById('formWLUpdate')).idWL.value = data['idwl'];
        (document.getElementById('formWLUpdate')).patente.value = data['patente'];

        // Obtenemos la empresas
        getEmpresas()
        .then(emps => {
            (document.getElementById('formWLUpdate')).empresa.textContent = '';
            emps.forEach(emp => {
                var optData = document.createElement('option');
                optData.value = emp['idemp'];
                optData.textContent = emp['nombre'];
                // Ingresamos el resultado al Select de empresas
                (document.getElementById('formWLUpdate')).empresa.appendChild(optData);

                (document.getElementById('formWLUpdate')).empresa.value = data['empresa'];
                (document.getElementById('formWLUpdate')).btnSubmit.disabled = false;
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
}

function insertWL(){
    (document.getElementById('formWLInsert')).btnSubmit.disabled = true;
    getEmpresas()
    .then(emps => {
        (document.getElementById('formWLInsert')).empresa.textContent = '';
        emps.forEach(emp => {
            var optData = document.createElement('option');
            optData.value = emp['idemp'];
            optData.textContent = emp['nombre'];
            // Ingresamos el resultado al Select de empresas
            (document.getElementById('formWLInsert')).empresa.appendChild(optData);
            (document.getElementById('formWLInsert')).btnSubmit.disabled = false;
        });
        openModal('minsert');
    });
}

// Igresa un registro
(document.getElementById('formWLInsert')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    (document.getElementById('formWLInsert')).btnSubmit.disabled = true;

    if((document.getElementById('formWLInsert')).patente.value){
        datos = {
            patente: (document.getElementById('formWLInsert')).patente.value,
            empresa: (document.getElementById('formWLInsert')).empresa.value
        };

        fetch("https://localhost/parkingCalama/php/whitelist/save.php", {
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
                (document.getElementById('formWLInsert')).patente.value = '';
                actualizarWhitelist();
                (document.getElementById('formWLInsert')).btnSubmit.disabled = false;
            } else {
                alert('Error');
                (document.getElementById('formWLInsert')).btnSubmit.disabled = false;
            }
        })
        .catch(error => {
            console.log(error);
            (document.getElementById('formWLInsert')).btnSubmit.disabled = false;
        });
    } else {
        alert('Ingrese patente');
    }
});

// Actualiza un registro
(document.getElementById('formWLUpdate')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    if((document.getElementById('formWLUpdate')).patente.value&&(document.getElementById('formWLUpdate')).idWL.value){
        datos = {
            id: (document.getElementById('formWLUpdate')).idWL.value,
            patente: (document.getElementById('formWLUpdate')).patente.value,
            empresa: (document.getElementById('formWLUpdate')).empresa.value
        };
    
        fetch("https://localhost/parkingCalama/php/whitelist/update.php", {
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