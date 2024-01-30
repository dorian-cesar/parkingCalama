/*
Funciones relacionadas al sistema de Listas Blancas (CRUD Completo)
*/

// Elementos
var tableWL = $('#tableWhitelist').DataTable({
    order: [[0, 'desc']], // Ordena la tabla por la primera columna de forma descendente
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" }, // Define el idioma de la tabla
    columnDefs : [ {
        targets: 'no-sort', // Aplica esta configuración a las columnas con la clase 'no-sort'
        orderable: false, // No permite ordenar las columnas con la clase 'no-sort'
    }],
    columns: [
        { data: 'idwl'}, // Datos de la columna 1: ID de lista blanca
        { data: 'patente'}, // Datos de la columna 2: Patente
        { data: 'nombre'}, // Datos de la columna 3: Nombre
        { data: 'ctrl', className: 'no-sort'} // Datos de la columna 4: Control, con clase 'no-sort'
    ]
});

/*
Funciones de API
*/

// Obtener todos los registros de  lista blanca
async function getWhitelist(){
    // Realiza una solicitud POST para obtener los datos de la lista blanca desde el servidor 
    let ret = await fetch("https://localhost/parkingCalama/php/wl/get.php", {
            method: 'POST',
            mode: 'cors'
        })
        // y los devuelve en formato JSON
        .then(reply => reply.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
    return ret;
}

// Obtener un registro específico de lista blanca
async function getWhitelistEntry(datos){
    // Realiza una solicitud POST para obtener un registro específico de lista blanca
    // y lo devuelve en formato JSON
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
// Función para actualizar la tabla de lista blanca
function actualizarWhitelist(){
    // Deshabilita el botón de actualización para evitar múltiples clics
    (document.getElementById('refreshWLBtn')).disabled = true;
    (document.getElementById('refreshWLBtn')).classList.add('disabled');
    getWhitelist()
    // Realiza una solicitud para obtener los registros de lista blanca
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
        // Actualiza la tabla con los nuevos datos obtenidos
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

// Elimina un registro  de Lista blanca por ID
function deleteWL(idIn){
     // Pide confirmación antes de eliminar un registro
    let wdConf = window.confirm('¿Eliminar la entrada?');
    // Realiza una solicitud POST para eliminar el registro de lista blanca
    
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
                actualizarWhitelist();// Actualiza la tabla de lista blanca después de la eliminación
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}

// Función para abrir un modal con los datos de un registro de lista blanca por ID
function updateWL(idIn){
     // Realiza una solicitud para obtener los datos de un registro de lista blanca por ID
    // y los muestra en el modal de actualización
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

// Función para insertar un nuevo registro de lista blanca
function insertWL(){
    // Deshabilita el botón de inserción mientras se procesa la solicitud
  
    (document.getElementById('formWLInsert')).btnSubmit.disabled = true;
    getEmpresas()
    .then(emps => {
        // Realiza una solicitud para obtener los datos de la empresa
        // y los muestra en el modal de inserción
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
    // Evita el comportamiento predeterminado del formulario
    // y realiza una solicitud POST para insertar un nuevo registro de lista blanca
    
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

// Actualiza un registro de lista blanca 
(document.getElementById('formWLUpdate')).btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();
     // Evita el comportamiento predeterminado del formulario
    // y realiza una solicitud POST para actualizar un registro de lista blanca

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

actualizarWhitelist();// Llama a la función para actualizar la tabla de lista blanca al cargar la página