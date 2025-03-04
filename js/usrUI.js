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
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione un rol';
        form.nivel.appendChild(defaultOption);
        form.nivel.value = ''; // Set default option as selected

        permisos.forEach(item => {
            var optIn = document.createElement('option');
            optIn.value = item['idperm'];
            optIn.textContent = item['descriptor'];
            form.nivel.appendChild(optIn);
        });
    }

    // Hide checkbox container by default
    const checkboxContainer = document.querySelector('#formInsertUsr .checkbox-container');
    const messageContainer = document.querySelector('#formInsertUsr .center-text-container p');
    checkboxContainer.style.display = 'none';
    messageContainer.textContent = '';

    // Add event listener to show/hide checkbox container based on selected level
    form.nivel.addEventListener('change', function() {
        if (form.nivel.value == '1') { // Usuario
            checkboxContainer.style.display = 'block';
            messageContainer.textContent = 'Tendra acceso a secciones:';
        } else if (form.nivel.value == '2') { // Administrador
            checkboxContainer.style.display = 'none';
            form.banos.checked = true;
            form.custodias.checked = true;
            form.parking.checked = true;
            form.andenes.checked = true;
            messageContainer.textContent = 'Se otorgara Acceso total';
        } else {
            checkboxContainer.style.display = 'none';
            messageContainer.textContent = '';
        }
    });

    // Limpiar checkboxes
    document.querySelectorAll('#formInsertUsr input[type="checkbox"]').forEach(cb => cb.checked = false);

    openModal('usrinsert');
}

async function modalUsrUpdate(idIn){
    const form = document.getElementById('formUpdateUsr');

    let permisos = await getPerm();

    if(permisos){
        form.nivel.textContent = '';
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione un rol';
        form.nivel.appendChild(defaultOption);
        form.nivel.value = ''; // Set default option as selected

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

        // Hide checkbox container by default
        const checkboxContainer = document.querySelector('#formUpdateUsr .checkbox-container');
        checkboxContainer.style.display = 'none';

        // Check if the level is already set to 'Administrador' (nivel 2)
        if (form.nivel.value == '2') { // Administrador
            checkboxContainer.style.display = 'none';
            form.banos.checked = true;
            form.custodias.checked = true;
            form.parking.checked = true;
            form.andenes.checked = true;
        } else if (form.nivel.value == '1') { // Usuario
            checkboxContainer.style.display = 'block';
            // Marcar checkboxes según las secciones asignadas
            let secciones = data['seccion'] ? data['seccion'].split(',') : [];
            secciones.forEach(sec => {
                let checkbox = document.querySelector(`#formUpdateUsr input[name="${sec.trim()}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Add event listener to show/hide checkbox container based on selected level
        form.nivel.addEventListener('change', function() {
            if (form.nivel.value == '1') { // Usuario
                checkboxContainer.style.display = 'block';
            } else if (form.nivel.value == '2') { // Administrador
                checkboxContainer.style.display = 'none';
                form.banos.checked = true;
                form.custodias.checked = true;
                form.parking.checked = true;
                form.andenes.checked = true;
            } else {
                checkboxContainer.style.display = 'none';
            }
        });

        // Limpiar checkboxes antes de marcarlos
        document.querySelectorAll('#formUpdateUsr input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Marcar checkboxes según las secciones asignadas
        let secciones = data['seccion'] ? data['seccion'].split(',') : [];
        secciones.forEach(sec => {
            let checkbox = document.querySelector(`#formUpdateUsr input[name="${sec.trim()}"]`);
            if (checkbox) checkbox.checked = true;
        });
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

    // Check if the level is 'Administrador' (nivel 2) and maintain selected sections
    if (form.nivel.value == '2') {
        secciones = ['banos', 'custodias', 'parking', 'andenes'];
    }

    datos = { 
        id: form.idusr.value, 
        pass: form.pass.value, // Update the password
        mail: form.mail.value, 
        lvl: form.nivel.value, 
        seccion: secciones.join(',') // Convertir array en string separado por comas

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
