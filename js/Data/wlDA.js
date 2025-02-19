/* Data Access */
const apiWhitelist = baseURL+"/whitelist/api.php";
const apiListaBlanca = baseURL+"/whitelist/listaBlanca.php";

// Obtiene todos los registros
async function getWL() {
    let ret = await fetch(apiWhitelist, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Obtiene un registro basado en ID
async function getWLByID(idIn) {
    let ret = await fetch(apiWhitelist + '?' + new URLSearchParams({
        id: idIn
        }), {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Obtiene un registro basado en Patente
async function getWLByPatente(patIn) {
    let ret = await fetch(apiWhitelist + '?' + new URLSearchParams({
        patente: patIn
        }), {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Borra un registro basado en ID
async function deleteWL(idIn) {
    let ret = await fetch(apiWhitelist, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(idIn)
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Actualiza un registro
// Datos: id, patente, empresa
async function updateWL(datos) {
    let ret = await fetch(apiWhitelist, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Inserta un registro
// Datos: patente, empresa
async function insertWL(datos) {
    let ret = await fetch(apiListaBlanca, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .then(async data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
            return { error: data.error };
        } else {
            alert('Usuario creado y niveles de acceso asignados con éxito.');
            // Insertar en la base de datos
            let dbRet = await fetch(apiWhitelist, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-type' : 'application/json',
                    'Authorization': `Bearer ${getCookie('jwt')}`
                },
                body: JSON.stringify(datos)
            })
            .then(reply => reply.json())
            .then(dbData => { return dbData; })
            .catch(error => { console.log(error); });
            return dbRet;
        }
    })
    .catch(error => { 
        console.log(error); 
        return { error: error.message };
    });
    return ret;
}

// Obtiene todas las empresas
async function getEmpresas() {
    let ret = await fetch(baseURL + "/empresas/api.php", {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}