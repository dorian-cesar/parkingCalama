// Nota: Buscar como validar patentes antiguas
const patRegEx = /^[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}-?[a-zA-Z\d]{2}$/;

var tableWL = $('#tableWL').DataTable({
    order: [[0, 'desc']], // Ordena la tabla por la primera columna de forma descendente
    language: { url: "esCLDT.json" }, // Define el idioma de la tabla
    columnDefs : [ {
        targets: 'no-sort', // Aplica esta configuración a las columnas con la clase 'no-sort'
        orderable: false, // No permite ordenar las columnas con la clase 'no-sort'
    }],
    columns: [
        { data: 'idwl'}, // Datos de la columna 1: ID de lista blanca
        { data: 'patente'}, // Datos de la columna 2: Patente
        { data: 'nombre'}, // Datos de la columna 3: Empresa (nombre)
        { data: 'ctrl', className: 'no-sort'} // Datos de la columna 4: Control, con clase 'no-sort'
    ]
});

// Abrir Modales

async function modalWLInsert(){
    // Blanquear los inputs
    const form = document.getElementById('formInsertWL');
    form.patente.value = '';
    form.empresa.innerHTML = ''; // Clear previous options

    // Populate empresa select options
    let empresas = await getEmpresas();
    empresas.forEach(empresa => {
        let option = document.createElement('option');
        option.value = empresa.idemp;
        option.text = empresa.nombre;
        form.empresa.add(option);
    });

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
        let data = await getWLByID(idIn);
        if(data){
            let reply = await deleteWLExternal({ patente: data['patente'] });
            if(reply['error']){
                alert(reply['error']);
            } else {
                alert('Usuario eliminado con éxito en la app externa.');
                let dbReply = await deleteWL(idIn);
                if(dbReply['error']){
                    alert(dbReply['error']);
                } else {
                    alert('Usuario eliminado con éxito en la base de datos.');
                }
                refreshWL();
            }
        }
    }
}

// Refrescar Tabla

async function refreshWL(){
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshWL');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getWL();

        if(data){
            tableWL.clear();
            data.forEach(item => {
                const btnDel = `<button onclick="modalWLDelete(${item['idwl']})" class="ctrlred fa fa-trash-o"></button>`;
                tableWL.rows.add([{
                    'idwl' : item['idwl'],
                    'patente' : item['patente'],
                    'nombre' : item['nombre'], // Ensure this matches the column definition
                    'ctrl' : btnDel
                }]);
            });
            tableWL.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
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

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { patente: form.patente.value, empresa: form.empresa.value };

    let ret = await insertWL(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('wlinsert');
    }
    form.btnSubmit.disabled = false;
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

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { id: form.idwl.value, patente: form.patente.value, empresa: form.empresa.value };

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
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshWL();
}