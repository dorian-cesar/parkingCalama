/* Data Access */
const apiMovimientos = "http://localhost/parkingCalama/php/movimientos/api.php";

// Obtiene todos los registros
async function getMov() {
    let ret = await fetch(apiMovimientos, {
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
async function getMovByID(idIn) {
    let ret = await fetch(apiMovimientos + '?' + new URLSearchParams({
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
async function deleteMov(idIn) {
    let ret = await fetch(apiMovimientos, {
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
async function updateMov(datos) {
    let ret = await fetch(apiMovimientos, {
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
async function insertMov(datos) {
    let ret = await fetch(apiMovimientos, {
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