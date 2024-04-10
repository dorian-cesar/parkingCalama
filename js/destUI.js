// Definimos la tabla de DataTables
var tableDest = $('#tabelDest').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
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

// Abrir Modales

// Limpia los inputs del formulario insert y lo abre
async function modalDestInsert(){
    const form = document.getElementById('formInsertDest');
    form.ciudad.value = '';
    form.valor.value = '';

    openModal('destinsert');
}

// Limpia los inputs del formulario update, obtiene los datos y lo abre
// idIn: ID a editar
async function modalDestUpdate(idIn){
    const form = document.getElementById('formUpdateDest');

    // Obtiene los datos del destino a editar
    let data = await getDestByID(idIn);

    if(data){
        form.iddest.value = data['iddest'];
        form.ciudad.value = data['ciudad'];
        form.valor.value = data['valor'];
    }

    openModal('destupdate');
}

// Pregunta si se quiere eliminar el destino y procede tras confirmacion
// idIn: ID a eliminar
async function modalDestDelete(idIn){
    let confirm = window.confirm('¿Eliminar el destino?');
    if(confirm){
        let reply = await deleteDest(idIn);
        if(reply['error']){
            alert(reply['error']);
        }
        refreshDest();
    }
}

// Refrescar Tabla
async function refreshDest(){
    if(getCookie('jwt')){
        // Creamos una referencia al boton de refresh para desactivarlo
        const refreshBtn = document.getElementById('btnRefreshDest');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        // Obtenemos los destinos
        let data = await getDest();

        if(data){
            // Si existen destinos, limpiamos la tabla y regeneramos
            tableDest.clear();
            data.forEach(item => {
                const btnUpd = `<button onclick="modalDestUpdate(${item['iddest']})" class="ctrl fa fa-pencil"></button>`;
                const btnDel = `<button onclick="modalDestDelete(${item['iddest']})" class="ctrlred fa fa-trash-o"></button>`;
                tableDest.rows.add([{
                    'iddest' : item['iddest'],
                    'ciudad' : item['ciudad'],
                    'valor' : item['valor'],
                    'ctrl' : btnUpd+btnDel
                }]);
            });
            tableDest.draw();
        }
        // Reactivamos el boton de refresh
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
        // Tambien regeneramos la lista de destinos en vista Andenes
        listarAndenesDestinos();
    }
}

// Insertar
// e: referencia al evento HTML
async function doInsertDest(e) {
    // Evitamos que la pagina se recargue
    e.preventDefault();

    // Creamos una referencia al formulario insert
    const form = document.getElementById('formInsertDest');

    // Desactivamos el boton de guardar
    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    // Creamos un array con llaves y datos
    datos = { ciudad: form.ciudad.value, valor: form.valor.value };

    let ret = await insertDest(datos);
    if(ret['error']){
        // Si la API devuelve un objeto error en su array, alertar
        alert(ret['error']);
    } else {
        // De lo contrario cerrar el modal
        closeModal('destinsert');
    }
    // Rehabilitamos el boton y refrescamos la tabla
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshDest();
}

// Actualizar
// e: referencia al evento HTML
async function doUpdateDest(e) {
    e.preventDefault();

    const form = document.getElementById('formUpdateDest');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { id: form.iddest.value, ciudad: form.ciudad.value, valor: form.valor.value };

    let ret = await updateDest(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('destupdate');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshDest();
}