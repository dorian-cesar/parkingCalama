/* Data Access */
const apiPermisos = baseURL+"/permisos/api.php";

// Obtiene todos los registros
async function getPerm() {
    let ret = await fetch(apiPermisos, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { 
        // Filtrar los roles de superusuario
        return data.filter(perm => perm.idperm != 15); 
    })
    .catch(error => { console.log(error); });
    return ret;
}

// Obtiene un registro basado en ID
async function getPermByID(idIn) {
    let ret = await fetch(apiPermisos + '?' + new URLSearchParams({
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
async function deletePerm(idIn) {
    let ret = await fetch(apiPermisos, {
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
async function updatePerm(datos) {
    let ret = await fetch(apiPermisos, {
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
async function insertPerm(datos) {
    let ret = await fetch(apiPermisos, {
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