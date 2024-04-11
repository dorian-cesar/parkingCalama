function modalDestInsert(){
    const form = document.getElementById('formInsertDest');
    form.ciudad.value = '';
    form.valor.value = '';

    openModal('destinsert');
}

function refreshDest(){
    $('#tabelDest').DataTable().ajax.reload();
}

async function modalDestUpdate(idIn){
    const form = document.getElementById('formUpdateDest');
    
    await axios.get(apiDestinos+'?id='+idIn)
    .then(reply => {
        form.iddest.value = reply.data.iddest;
        form.ciudad.value = reply.data.ciudad;
        form.valor.value = reply.data.valor;
        openModal('destupdate');
    })
}

async function modalDestDelete(idIn){
    let confirm = window.confirm('¿Eliminar el registro?');
    if(confirm){
        await axios.delete(apiDestinos+'?id='+idIn)
        .then(reply => {
            if(reply.data.error){
                window.alert(reply.data.error);
            }
        });
        refreshDest();
    }
}

async function doInsertDest(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertDest');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.post(apiDestinos, {
        ciudad: form.ciudad.value,
        valor: form.valor.value
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('destinsert');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshDest();
}

async function doUpdateDest(e) {
    // Evitamos que se recargue la página
    e.preventDefault();

    const form = document.getElementById('formUpdateDest');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.put(apiDestinos, {
        id: form.iddest.value,
        ciudad: form.ciudad.value,
        valor: form.valor.value
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('destupdate');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshDest();
}