const apiDestinos = "http://localhost/parkingCalama/php/destinos/api.php";

// Elementos
var tableDest = $('#tableDestinos').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'iddest'},
        { data: 'ciudad'},
        { data: 'valor'},
        { data: 'ctrl', className: 'no-sort'}
    ]
});

//Regenrar la tabla
function actualizarDest(){
    getDestinos()
    .then(data => {
        if(data){
            tableDest.clear();
            data.forEach(item => {// Crear botones de edición y eliminación para cada fila
                const btnUpd = `<button class="ctrl fa fa-pencil" onclick="openDestUpd(${item['iddest']})"></button>`;
                const btnDel = `<button class="ctrlred fa fa-trash" onclick="deleteDest(${item['iddest']})"></button>`;
    
                tableDest.rows.add([{
                    'iddest' : item['iddest'],
                    'ciudad' : item['ciudad'],
                    'valor' : item['valor'],
                    'ctrl' : btnUpd+btnDel
                }]);
            });
            tableDest.draw();
        }
    })
    .catch(error => {
        console.log(error);
    });
}

// Abrir modal insertar
function openDestIns(){
    openModal('destins');
    const curmodal = document.getElementById('formDestInsert');
    curmodal.ciudad.value = '';
    curmodal.valor.value = '';
}

function openDestUpd(idIn){
    openModal('destupd');
    const curmodal = document.getElementById('formDestUpdate');

    getDestinoByID(idIn)
    .then(data => {
        curmodal.ciudad.value = data['ciudad'];
        curmodal.iddest.value = data['iddest'];
        curmodal.valor.value = data['valor'];
    });
}

// Delete
function deleteDest(idIn){
    let winconf = window.confirm('¿Quieres eliminar el destino?');

    datos = {
        id: idIn
    }

    if(winconf){
        fetch(apiDestinos, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json',
                'Authorization': `Bearer ${getCookie('jwt')}`
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(data => {
            if(data['error']){
                alert(data['error']);
            } else {
                actualizarDest();
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}
// Update
document.getElementById('formDestUpdate').addEventListener('submit', (e) => {
    e.preventDefault();

    const curform = document.getElementById('formDestUpdate');

    datos = {
        id: curform.iddest.value,
        ciudad: curform.ciudad.value,
        valor: curform.valor.value
    };

    fetch(apiDestinos, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => {
        if(data=='1062'){
            alert('Ya existe un registro para este destino!');
        }
        else if(data!=false){
            actualizarDest();
            closeModal('destupd');
        } else {
            alert('Error');
        }
    })
    .catch(error => {
        console.log(error);
    });
});

// Insertar en BDD
document.getElementById('formDestInsert').addEventListener('submit', (e) => {
    e.preventDefault();

    const curform = document.getElementById('formDestInsert');

    datos = {
        ciudad: curform.ciudad.value,
        valor: curform.valor.value
    }

    fetch(apiDestinos, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => {
        if(data!=false){
            actualizarDest();
            closeModal('destins');
        } else {
            alert('Error');
        }
    })
    .catch(error => {
        console.log(error);
    });
});

// Obtener todos los destinos
async function getDestinos(){
    if(getCookie('jwt')){
        let ret = await fetch(apiDestinos, {
                method: 'GET',
                mode: 'cors',
                headers: {
                  'Authorization': `Bearer ${getCookie('jwt')}`
                }
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
}

// Obtener todos los destinos
async function getDestinoByID(idIn){
    if(getCookie('jwt')){
        let ret = await fetch(apiDestinos + '?' + new URLSearchParams({
            id: idIn
        }), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json',
                'Authorization': `Bearer ${getCookie('jwt')}`
            }
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
}

//
actualizarDest();