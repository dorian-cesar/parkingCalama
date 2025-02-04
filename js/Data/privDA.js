const apiBuses = baseURL + "/privilegios/api.php";

async function getBuses() {
    let ret = await fetch(apiBuses, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }
    })
    .then(reply => reply.json())
    .catch(error => console.log(error));
    return ret;
}

async function getBusByID(idIn) {
    let ret = await fetch(apiBuses + '?' + new URLSearchParams({ id: idIn }), {
        method: 'GET',
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }
    })
    .then(reply => reply.json())
    .catch(error => console.log(error));
    return ret;
}

async function deleteBus(idIn) {
    let ret = await fetch(apiBuses, {
        method: 'DELETE',
        mode: 'cors',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${getCookie('jwt')}` },
        body: JSON.stringify(idIn)
    })
    .then(reply => reply.json())
    .catch(error => console.log(error));
    return ret;
}

async function updateBus(datos) {
    let ret = await fetch(apiBuses, {
        method: 'PUT',
        mode: 'cors',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${getCookie('jwt')}` },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .catch(error => console.log(error));
    return ret;
}

async function insertBus(datos) {
    let ret = await fetch(apiBuses, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${getCookie('jwt')}` },
        body: JSON.stringify(datos)
    })
    .then(reply => reply.json())
    .catch(error => console.log(error));
    return ret;
}
