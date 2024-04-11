function modalEmpInsert(){
    const form = document.getElementById('formInsertEmp');
    form.nombre.value = '';
    form.contacto.value = '';

    openModal('empinsert');
}

function refreshEmp(){
    $('#tableEmp').DataTable().ajax.reload();
}

async function modalEmpUpdate(idIn){
    const form = document.getElementById('formUpdateEmp');
    
    await axios.get(apiEmpresas+'?id='+idIn)
    .then(reply => {
        form.idemp.value = reply.data.idemp;
        form.nombre.value = reply.data.nombre;
        form.contacto.value = reply.data.contacto;
        openModal('empupdate');
    })
}

async function modalEmpDelete(idIn){
    let confirm = window.confirm('¿Eliminar el registro?');
    if(confirm){
        await axios.delete(apiEmpresas+'?id='+idIn)
        .then(reply => {
            if(reply.data.error){
                window.alert(reply.data.error);
            }
        });
        refreshEmp();
    }
}

async function doInsertEmp(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertEmp');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.post(apiEmpresas, {
        nombre: form.nombre.value,
        contacto: form.contacto.value
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('empinsert');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshEmp();
}

async function doUpdateEmp(e) {
    // Evitamos que se recargue la página
    e.preventDefault();

    const form = document.getElementById('formUpdateEmp');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.put(apiEmpresas, {
        id: form.idemp.value,
        nombre: form.nombre.value,
        contacto: form.contacto.value
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('empupdate');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshEmp();
}