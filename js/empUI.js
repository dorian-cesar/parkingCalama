//Funciones relacionadas al modulo de empresas dentro de la configuracion (CRUD completo)
// Elementos
var tableEmp = $('#tableEmp').DataTable({
    // Configuración inicial de la tabla DataTable
    order: [[0, 'desc']], // Ordenar por la primera columna (ID) de forma descendente al cargar
    language: { url: "esCLDT.json" }, // Configuración del idioma
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

// Abrir Modales

async function modalEmpInsert(){
    const form = document.getElementById('formInsertEmp');
    form.nombre.value = '';
    form.contacto.value = '';

    openModal('empinsert');
}

async function modalEmpUpdate(idIn){
    const form = document.getElementById('formUpdateEmp');

    let data = await getEmpByID(idIn);

    if(data){
        form.idemp.value = data['idemp'];
        form.nombre.value = data['nombre'];
        form.contacto.value = data['contacto'];
    }

    openModal('empupdate');
}

async function modalEmpDelete(idIn){
    let confirm = window.confirm('¿Eliminar la empresa?');
    if(confirm){
        let reply = await deleteEmp(idIn);
        if(reply['error']){
            alert(reply['error']);
        }
        refreshEmp();
    }
}

async function refreshEmp() {
    if(usrlvl>0){
        const refreshBtn = document.getElementById('btnRefreshEmp');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getEmp();

        if(data){
            tableEmp.clear();
            data.forEach(item => {
                const btnUpd = `<button onclick="modalEmpUpdate(${item['idemp']})" class="ctrl fa fa-pencil"></button>`;
                const btnDel = `<button onclick="modalEmpDelete(${item['idemp']})" class="ctrlred fa fa-trash-o"></button>`;
                tableEmp.rows.add([{
                    'idemp' : item['idemp'],
                    'nombre' : item['nombre'],
                    'contacto' : item['contacto'],
                    'ctrl' : btnUpd+btnDel
                }]);
            });
            tableEmp.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

// Insertar
async function doInsertEmp(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertEmp');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { nombre: form.nombre.value, contacto: form.contacto.value };

    let ret = await insertEmp(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('empinsert');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshEmp();
}

// Actualizar
async function doUpdateEmp(e) {
    e.preventDefault();

    const form = document.getElementById('formUpdateEmp');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    datos = { id: form.idemp.value, nombre: form.nombre.value, contacto: form.contacto.value };

    let ret = await updateEmp(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('empupdate');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshEmp();
}