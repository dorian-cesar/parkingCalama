//Funciones relacionadas al modulo de Usuarios dentro de la configuración (CRUD completo)
// Elementos
var tableUser = $('#tableUsr').DataTable({
    order: [[0, 'desc']], 
    language: { url: "esCLDT.json" }, 
    columnDefs: [{
        targets: 'no-sort', 
        orderable: false, 
    }],
    columns: [
        { data: 'iduser' }, 
        { data: 'mail' }, 
        { data: 'nivel' }, 
        { data: 'seccion' }, // Nueva columna para secciones
        { data: 'ctrl', className: 'no-sort' } 
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

    // Limpiar checkboxes
    document.querySelectorAll('#formInsertUsr input[type="checkbox"]').forEach(cb => cb.checked = false);

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


        // Limpiar checkboxes antes de marcarlos
        document.querySelectorAll('#formUpdateUsr input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Marcar checkboxes según las secciones asignadas
        let secciones = data['seccion'] ? data['seccion'].split(',') : [];
        secciones.forEach(sec => {
            let checkbox = document.querySelector(`#formUpdateUsr input[name="${sec.trim()}"]`);
            if (checkbox) checkbox.checked = true;
        });

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
                    'seccion' : item['seccion'] || 'Ninguna', // Mostrar secciones o "Ninguna"

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

    // Obtener secciones seleccionadas
    let secciones = [];
    document.querySelectorAll('#formInsertUsr input[type="checkbox"]:checked').forEach(cb => {
        secciones.push(cb.name);
    });

    datos = { 
        mail: form.mail.value, 
        pass: form.pass.value, 
        lvl: form.nivel.value, 
        seccion: secciones.join(',') // Convertir array en string separado por comas

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


    // Obtener secciones seleccionadas
    let secciones = [];
    document.querySelectorAll('#formUpdateUsr input[type="checkbox"]:checked').forEach(cb => {
        secciones.push(cb.name);
    });

    datos = { 
        id: form.idusr.value, 
        pass: form.pass.value, 
        passOld: form.oldpass.value, 
        mail: form.mail.value, 
        lvl: form.nivel.value, 
        seccion: secciones.join(',')

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
