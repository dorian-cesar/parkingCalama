function modalWLInsert(){
    const form = document.getElementById('formInsertWL');
    form.patente.value = '';

    openModal('wlinsert');
}

function refreshWL(){
    $('#tableWL').DataTable().ajax.reload();
}

async function modalWLUpdate(idIn){
    const form = document.getElementById('formUpdateWL');
    
    await axios.get(apiWhitelist+'?id='+idIn)
    .then(reply => {
        form.patente.value = reply.data.patente;
        form.idwl.value = reply.data.idwl;
        openModal('wlupdate');
    })
}

async function modalWLDelete(idIn){
    let confirm = window.confirm('¿Eliminar el registro?');
    if(confirm){
        await axios.delete(apiWhitelist+'?id='+idIn)
        .then(reply => {
            if(reply.data.error){
                window.alert(reply.data.error);
            }
        });
        refreshWL();
    }
}

async function doInsertWL(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertWL');

    if(!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.post(apiWhitelist, {
        patente: form.patente.value,
        empresa: 1,
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('wlinsert');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshWL();
}

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

    await axios.put(apiWhitelist, {
        id: form.idwl.value,
        patente: form.patente.value,
        empresa: 1,
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('wlupdate');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshWL();
}