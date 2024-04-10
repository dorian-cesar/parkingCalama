/* Data Access */
const apiUsers = baseURL+"/users/api.php";

// Obtiene todos los registros
async function getUsr() {
    let ret = await fetch(apiUsers, {
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
async function getUsrByID(idIn) {
    let ret = await fetch(apiUsers + '?' + new URLSearchParams({
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

// Borra un registro basado en ID
async function deleteUsr(idIn) {
    let ret = await fetch(apiUsers, {
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
// Datos: id, ciudad, valor
async function updateUsr(datos) {
    let ret = await fetch(apiUsers, {
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
// Datos: ciudad, valor
async function insertUsr(datos) {
    let ret = await fetch(apiUsers, {
        method: 'POST',
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