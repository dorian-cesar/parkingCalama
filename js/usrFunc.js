async function modalUsrInsert(){
    const form = document.getElementById('formInsertUsr');
    form.mail.value = '';
    form.pass.value = '';

    await axios.get(apiPermisos)
    .then(reply => {
        form.nivel.textContent = '';
        reply.data.forEach(item => {
            var optIn = document.createElement('option');
            optIn.value = item.idperm;
            optIn.textContent = item.descriptor;
            form.nivel.appendChild(optIn);
        });
    })

    openModal('usrinsert');
}

function refreshUsr(){
    $('#tableUsr').DataTable().ajax.reload();
}


async function modalUsrUpdate(idIn){
    const form = document.getElementById('formUpdateUsr');

    await axios.get(apiPermisos)
    .then(reply => {
        form.nivel.textContent = '';
        reply.data.forEach(item => {
            var optIn = document.createElement('option');
            optIn.value = item.idperm;
            optIn.textContent = item.descriptor;
            form.nivel.appendChild(optIn);
        });
    })
    
    await axios.get(apiUsers+'?id='+idIn)
    .then(reply => {
        form.idusr.value = reply.data.iduser;
        form.mail.value = reply.data.mail;
        form.nivel.value = reply.data.nivel;
        form.pass.value = '';
        form.oldpass.value = '';
    
        openModal('usrupdate');
    })
}

async function modalUsrDelete(idIn){
    let confirm = window.confirm('¿Eliminar el registro?');
    if(confirm){
        await axios.delete(apiUsers+'?id='+idIn)
        .then(reply => {
            if(reply.data.error){
                window.alert(reply.data.error);
            }
        });
        refreshUsr();
    }
}

async function doInsertUsr(e) {
    e.preventDefault();

    const form = document.getElementById('formInsertUsr');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.post(apiUsers, {
        mail: form.mail.value,
        pass: form.pass.value,
        lvl: form.nivel.value,
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('usrinsert');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshUsr();
}

async function doUpdateUsr(e) {
    // Evitamos que se recargue la página
    e.preventDefault();

    const form = document.getElementById('formUpdateUsr');

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    await axios.put(apiUsers, {
        id: form.idusr.value,
        mail: form.mail.value,
        pass: form.pass.value,
        passOld: form.oldpass.value,
        lvl: form.nivel.value,
    })
    .then(reply => {
        if(reply.data.error){
            window.alert(reply.data.error);
        } else {
            closeModal('usrupdate');
        }
    })
    .catch(error => {
        console.error(error);
    });

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshUsr();
}