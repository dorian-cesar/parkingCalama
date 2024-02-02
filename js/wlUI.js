const apiWhitelist = "http://localhost/parkingCalama/php/whitelist/api.php";

// Nota: Buscar como validar patentes antiguas
const patRegEx = /^[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}$/;

var tableWL = $('#tableWL').DataTable({
    order: [[0, 'desc']], // Ordena la tabla por la primera columna de forma descendente
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" }, // Define el idioma de la tabla
    columnDefs : [ {
        targets: 'no-sort', // Aplica esta configuración a las columnas con la clase 'no-sort'
        orderable: false, // No permite ordenar las columnas con la clase 'no-sort'
    }],
    columns: [
        { data: 'idwl'}, // Datos de la columna 1: ID de lista blanca
        { data: 'patente'}, // Datos de la columna 2: Patente
        { data: 'ctrl', className: 'no-sort'} // Datos de la columna 3: Control, con clase 'no-sort'
    ]
});

// Abrir Modales

async function modalWLInsert(){
    // Blanquear los inputs
    const form = document.getElementById('formInsertWL');
    form.patente.value = '';

    // Abrir Modal
    openModal('wlinsert');
}

async function modalWLUpdate(idIn){
    const form = document.getElementById('formUpdateWL');
    
    let data = await getWLByID(idIn);

    if(data){
        form.patente.value = data['patente'];
        form.idwl.value = data['idwl'];
        openModal('wlupdate');
    }
}

async function modalWLDelete(idIn){
    let confirm = window.confirm('¿Eliminar el registro?');
    if(confirm){
        let reply = await deleteWL(idIn);
        if(reply['error']){
            alert(reply['error']);
        }
        refreshWL();
    }
}

// Refrescar Tabla

async function refreshWL(){
    if(getCookie('jwt')){
        document.getElementById('btnRefreshWL').disabled = true;
        document.getElementById('btnRefreshWL').classList.remove('fa-refresh');
        document.getElementById('btnRefreshWL').classList.add('fa-hourglass');
        document.getElementById('btnRefreshWL').classList.add('disabled');

        let data = await getWL();

        if(data){
            tableWL.clear();
            data.forEach(item => {
                const btnUpd = `<button onclick="modalWLUpdate(${item['idwl']})" class="ctrl fa fa-pencil"></button>`;
                const btnDel = `<button onclick="modalWLDelete(${item['idwl']})" class="ctrlred fa fa-trash-o"></button>`;
                tableWL.rows.add([{
                    'idwl' : item['idwl'],
                    'patente' : item['patente'],
                    'ctrl' : btnUpd+btnDel
                }]);
            });
            tableWL.draw();
        }
        document.getElementById('btnRefreshWL').disabled = false;
        document.getElementById('btnRefreshWL').classList.add('fa-refresh');
        document.getElementById('btnRefreshWL').classList.remove('fa-hourglass');
        document.getElementById('btnRefreshWL').classList.remove('disabled');
    }
}

// Insertar

async function doInsertWL(e) {
    // Evitamos que se recargue la página
    e.preventDefault();

    const form = document.getElementById('formInsertWL');

    if(!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disable = true;
    form.btnSubmit.classList.add('disabled');

    datos = { patente: form.patente.value, empresa: 1 };

    let ret = await insertWL(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('wlinsert');
    }
    form.btnSubmit.disable = false;
    form.btnSubmit.classList.remove('disabled');
    refreshWL();
}

// Update

async function doUpdateWL(e) {
    // Evitamos que se recargue la página
    e.preventDefault();

    const form = document.getElementById('formUpdateWL');

    if(!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disable = true;
    form.btnSubmit.classList.add('disabled');

    datos = { id: form.idwl.value, patente: form.patente.value, empresa: 1 };

    let ret = await updateWL(datos);
    if(ret['error']){
        if(ret['error']===1062) {
            alert('Ya existe entrada para esa patente!');
        } else {
            alert(ret['error']);
        }
    } else {
        closeModal('wlupdate');
    }
    form.btnSubmit.disable = false;
    form.btnSubmit.classList.remove('disabled');
    refreshWL();
}