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
        tableDest.clear();
        data.forEach(item => {
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
    })
    .catch(error => {
        console.log(error);
    });
    listarDestinos();
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

    datos = {
        id: idIn
    }

    fetch("https://localhost/parkingCalama/php/destinos/get.php", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => {
        curmodal.ciudad.value = data['ciudad'];
        curmodal.iddest.value = data['iddest'];
        curmodal.valor.value = data['valor'];
    })
    .catch(error => {
        console.log(error);
    });
}

// Delete
function deleteDest(idIn){
    let winconf = window.confirm('¿Quieres eliminar el destino?');

    datos = {
        id: idIn
    }

    if(winconf){
        fetch('https://localhost/parkingCalama/php/destinos/delete.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(() => {
            actualizarDest();
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

    fetch('https://localhost/parkingCalama/php/destinos/update.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json'
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

    fetch('https://localhost/parkingCalama/php/destinos/insert.php', {
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

// Obtener todas las empresas
async function getDestinos(){
    let ret = await fetch("https://localhost/parkingCalama/php/destinos/get.php", {
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

function listarDestinos(){
    getDestinos()
    .then(data => {
        const lista = document.getElementById('destinoBuses');
        lista.textContent = '';
        let nullData = document.createElement('option');
        nullData.value = 0;
        nullData.textContent = 'Seleccione Destino';
        lista.appendChild(nullData);
        data.forEach(itm => {
            let optData = document.createElement('option');
            optData.value = itm['iddest'];
            optData.textContent = itm['ciudad'] + ' ($' + itm['valor'] + ')';
            lista.appendChild(optData);
        });
    })
}

//
actualizarDest();