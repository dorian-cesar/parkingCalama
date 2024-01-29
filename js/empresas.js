// Elementos
var tableEmp = $('#tableEmp').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idemp'},
        { data: 'nombre'},
        { data: 'contacto'},
        { data: 'ctrl', className: 'no-sort'}
    ]
});

//Regenrar la tabla
function actualizarEmp(){
    getEmpresas()
    .then(data => {
        tableEmp.clear();
        data.forEach(item => {
            const btnUpd = `<button class="ctrl fa fa-pencil" onclick="openEmpUpd(${item['idemp']})"></button>`;
            const btnDel = `<button class="ctrlred fa fa-trash" onclick="deleteEmp(${item['idemp']})"></button>`;

            tableEmp.rows.add([{
                'idemp' : item['idemp'],
                'nombre' : item['nombre'],
                'contacto' : item['contacto'],
                'ctrl' : btnUpd+btnDel
            }]);
        });
        tableEmp.draw();
    })
    .catch(error => {
        console.log(error);
    });
}

// Abrir modal insertar
function openEmpIns(){
    openModal('empins');
    const curmodal = document.getElementById('formEmpInsert');
    curmodal.nombre.value = '';
    curmodal.contemp.value = '';
}

function openEmpUpd(idIn){
    openModal('empupd');
    const curmodal = document.getElementById('formEmpUpdate');

    datos = {
        id: idIn
    }

    fetch("https://localhost/parkingCalama/php/empresas/get.php", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => {
        curmodal.nombre.value = data['nombre'];
        curmodal.idemp.value = data['idemp'];
        curmodal.contemp.value = data['contacto'];
    })
    .catch(error => {
        console.log(error);
    });
}

// Delete
function deleteEmp(idIn){
    let winconf = window.confirm('¿Quieres eliminar la empresa?');

    datos = {
        id: idIn
    }

    if(winconf){
        fetch('https://localhost/parkingCalama/php/empresas/delete.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(reply => reply.json())
        .then(() => {
            actualizarEmp();
        })
        .catch(error => {
            console.log(error);
        });
    }
}
// Update
document.getElementById('formEmpUpdate').addEventListener('submit', (e) => {
    e.preventDefault();

    const curform = document.getElementById('formEmpUpdate');

    datos = {
        id: curform.idemp.value,
        nombre: curform.nombre.value,
        contacto: curform.contemp.value
    };

    fetch('https://localhost/parkingCalama/php/empresas/update.php', {
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
            alert('Ya existe un registro para esta empresa!');
        }
        else if(data!=false){
            actualizarEmp();
            closeModal('empupd');
        } else {
            alert('Error');
        }
    })
    .catch(error => {
        console.log(error);
    });
});

// Insertar en BDD
document.getElementById('formEmpInsert').addEventListener('submit', (e) => {
    e.preventDefault();

    const curform = document.getElementById('formEmpInsert');

    datos = {
        nombre: curform.nombre.value,
        contacto: curform.contemp.value
    }

    fetch('https://localhost/parkingCalama/php/empresas/insert.php', {
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
            actualizarEmp();
            closeModal('empins');
        } else {
            alert('Error');
        }
    })
    .catch(error => {
        console.log(error);
    });
});

// Obtener todas las empresas
async function getEmpresas(){
    let ret = await fetch("https://localhost/parkingCalama/php/empresas/get.php", {
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

//
actualizarEmp();