//Funciones relacionadas al modulo de empresas dentro de la configuracion (CRUD completo)
// Elementos
var tableEmp = $('#tableEmp').DataTable({
    // Configuración inicial de la tabla DataTable
    order: [[0, 'desc']], // Ordenar por la primera columna (ID) de forma descendente al cargar
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" }, // Configuración del idioma
    columnDefs : [ {
        targets: 'no-sort', // Clases CSS de columnas que no se pueden ordenar
        orderable: false, // No permitir ordenar estas columnas
    }],
    columns: [
        { data: 'idemp'}, // Columna para el ID de la empresa
        { data: 'nombre'}, // Columna para el nombre de la empresa
        { data: 'contacto'}, // Columna para el contacto de la empresa
        { data: 'ctrl', className: 'no-sort'} // Columna de control con botones de edición/eliminación
    ]
});
//Regenrar la tabla
function actualizarEmp(){
    // Función para actualizar la tabla con datos de empresas
    getEmpresas()
    .then(data => {
        // Limpiar la tabla antes de actualizar
        tableEmp.clear();
        // Iterar sobre los datos obtenidos y agregar filas a la tabla
        data.forEach(item => {
            // Crear botones de edición y eliminación para cada fila
            const btnUpd = `<button class="ctrl fa fa-pencil" onclick="openEmpUpd(${item['idemp']})"></button>`;
            const btnDel = `<button class="ctrlred fa fa-trash" onclick="deleteEmp(${item['idemp']})"></button>`;

            // Agregar fila a la tabla con los datos y los botones de control
            tableEmp.rows.add([{
                'idemp' : item['idemp'],
                'nombre' : item['nombre'],
                'contacto' : item['contacto'],
                'ctrl' : btnUpd + btnDel
            }]);
        });
        // Dibujar la tabla con los datos actualizados
        tableEmp.draw();
    })
    .catch(error => {
        console.log(error);
    });
}

// Abrir modal insertar
function openEmpIns(){
    // Función para abrir el modal de inserción de empresas
    openModal('empins');
    // Limpiar los campos del formulario de inserción
    const curmodal = document.getElementById('formEmpInsert');
    curmodal.nombre.value = '';
    curmodal.contemp.value = '';
}

function openEmpUpd(idIn){
    // Función para abrir el modal de actualización de empresas
    openModal('empupd');
    // Obtener datos de la empresa específica mediante una solicitud fetch
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
        // Llenar los campos del formulario con los datos obtenidos
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
    // Función para eliminar una empresa
    let winconf = window.confirm('¿Quieres eliminar la empresa?');

    datos = {
        id: idIn
    }

    if(winconf){
        // Si el usuario confirma, enviar una solicitud para eliminar la empresa
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
            // Actualizar la tabla después de la eliminación
            actualizarEmp();
        })
        .catch(error => {
            console.log(error);
        });
    }
}

// Update
document.getElementById('formEmpUpdate').addEventListener('submit', (e) => {
    // Evento para actualizar los datos de una empresa
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
        // Manejar la respuesta del servidor
        if(data=='1062'){
            alert('Ya existe un registro para esta empresa!');
        }
        else if(data!=false){
            // Si la actualización es exitosa, actualizar la tabla y cerrar el modal
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
    // Evento para insertar una nueva empresa
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
        // Manejar la respuesta del servidor
        if(data!=false){
            // Si la inserción es exitosa, actualizar la tabla y cerrar el modal
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
    // Función para obtener todas las empresas
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

// Actualizar la tabla al cargar la página
actualizarEmp();