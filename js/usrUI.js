//Funciones relacionadas al modulo de Usrresas dentro de la configuracion (CRUD completo)
// Elementos
var tableUser = $('#tableUsr').DataTable({
    // Configuración inicial de la tabla DataTable
    order: [[0, 'desc']], // Ordenar por la primera columna (ID) de forma descendente al cargar
    language: { url: "esCLDT.json" }, // Configuración del idioma
    columnDefs : [ {
        targets: 'no-sort', // Clases CSS de columnas que no se pueden ordenar
        orderable: false, // No permitir ordenar estas columnas
    }],
    columns: [
        { data: 'iduser'}, // Columna de ID de usuario
        { data: 'mail'}, // Columna de correo electrónico
        { data: 'nivel'}, // Columna de nivel de usuario
        { data: 'secciones'}, // Columna de secciones asignadas
        { data: 'ctrl', className: 'no-sort'} // Columna de controles con clases de estilo
    ]
});

// Abrir Modales

async function modalUsrInsert(){
    const form = document.getElementById('formInsertUsr');
    form.mail.value = '';
    form.pass.value = '';
    form.banos.checked = false;
    form.custodias.checked = false;
    form.parking.checked = false;
    form.andenes.checked = false;

    let permisos = await getPerm();

    if(permisos){
        form.nivel.textContent = '';
        permisos.forEach(item => {
            var optIn = document.createElement('option');
            optIn.value = item['idperm'];
            optIn.textContent = item['descriptor'];
            form.nivel.appendChild(optIn);
        });
    }

    openModal('usrinsert');
}

async function modalUsrUpdate(idIn){
    const form = document.getElementById('formUpdateUsr');

    let permisos = await getPerm();

    if(permisos){
        form.nivel.textContent = '';
        permisos.forEach(item => {
            var optIn = document.createElement('option');
            optIn.value = item['idperm'];
            optIn.textContent = item['descriptor'];
            form.nivel.appendChild(optIn);
        });
    }

    let data = await getUsrByID(idIn);

    if(data){
        form.idusr.value = data['iduser'];
        form.mail.value = data['mail'];
        form.nivel.value = data['nivel'];
        form.pass.value = '';
        form.oldpass.value = '';
        form.banos.checked = data['banos'];
        form.custodias.checked = data['custodias'];
        form.parking.checked = data['parking'];
        form.andenes.checked = data['andenes'];
    }

    openModal('usrupdate');
}

async function modalUsrDelete(idIn){
    let confirm = window.confirm('¿Eliminar el usuario?');
    if(confirm){
        let reply = await deleteUsr(idIn);
        if(reply['error']){
            alert(reply['error']);
        }
        refreshUsr();
    }
}

async function refreshUsr() {
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshUsr');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getUsr();

        if(data){
            tableUser.clear();
            data.forEach(item => {
                const btnUpd = `<button onclick="modalUsrUpdate(${item['iduser']})" class="ctrl fa fa-pencil"></button>`;
                const btnDel = `<button onclick="modalUsrDelete(${item['iduser']})" class="ctrlred fa fa-trash-o"></button>`;
                const secciones = [
                    item['banos'] ? 'Baños' : '',
                    item['custodias'] ? 'Custodias' : '',
                    item['parking'] ? 'Parking' : '',
                    item['andenes'] ? 'Andenes' : ''
                ].filter(Boolean).join(', ');
                tableUser.rows.add([{
                    'iduser' : item['iduser'],
                    'mail' : item['mail'],
                    'nivel' : item['descriptor'],
                    'secciones' : secciones,
                    'ctrl' : btnUpd+btnDel
                }]);
            });
            tableUser.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

// Insertar
async function doInsertUsr(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertUsr');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { 
        mail: form.mail.value, 
        pass: form.pass.value, 
        lvl: form.nivel.value,
        banos: form.banos.checked,
        custodias: form.custodias.checked,
        parking: form.parking.checked,
        andenes: form.andenes.checked
    };

    let ret = await insertUsr(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('usrinsert');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshUsr();
}

// Actualizar
async function doUpdateUsr(e) {
    e.preventDefault();

    const form = document.getElementById('formUpdateUsr');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { 
        id: form.idusr.value, 
        pass: form.pass.value, 
        passOld: form.oldpass.value, 
        mail: form.mail.value, 
        lvl: form.nivel.value,
        banos: form.banos.checked,
        custodias: form.custodias.checked,
        parking: form.parking.checked,
        andenes: form.andenes.checked
    };

    let ret = await updateUsr(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('usrupdate');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshUsr();
}