async function modalMovInsert(){
    const form = document.getElementById('formInsertMov');
    form.patente.value = '';

    await axios.get(apiEmpresas)
    .then(reply => {
        form.empresa.textContent = '';
        reply.data.forEach(data => {
            var optIn = document.createElement('option');
            optIn.value = data.idemp;
            optIn.textContent = data.nombre;
            form.empresa.appendChild(optIn);
        })
    })

    openModal('movinsert');
}
function refreshMov(){
    $('#tableMov').DataTable().ajax.reload();
}

function refreshPagos(){
    $('#tablePagos').DataTable().ajax.reload();
}

async function doInsertMov(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertMov');

    if(!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');
    const dateNow = new Date();

    await axios.post(apiMovimientos, {
        fecha: dateNow.toISOString().split('T')[0],
        hora: `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`,
        patente: form.patente.value,
        empresa: form.empresa.value,
        tipo: form.tipo.value
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('movinsert');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshMov();
}

/*
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
    refreshMov();
}*/