const apiMovimientos = "http://localhost/parkingCalama/php/movimientos/api.php";

// Elementos
var tableMovs = $('#tablaMovimientos').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov'},
        { data: 'fechaent'},
        { data: 'fechasal'},
        { data: 'patente'},
        { data: 'empresa'},
        { data: 'tipo'}
    ]
});

function actualizarMovimientos() {
    getMovimientos()
    .then(data => {
        if(data){
            tableMovs.clear();
            data.forEach(item => {
                tableMovs.rows.add([{
                    'idmov' : item['idmov'],
                    'fechaent' : item['horaent'],
                    'fechasal' : item['horasal'],
                    'patente' : item['patente'],
                    'empresa' : item['empresa'],
                    'tipo' : item['tipo'],
                }]);
            });
            tableMovs.draw();
        }
    });
}

function openMovModal(){
    movListEmp();
    openModal('MovInsert');
}

function movListEmp() {
    const form = document.getElementById('formMovInsert');

    form.inEmpresa.textContent = '';

    getEmpresas()
    .then(data => {
        data.forEach(itm => {
            var optIn = document.createElement('option');
            optIn.textContent = itm['nombre'];
            optIn.value = itm['idemp'];
            form.inEmpresa.appendChild(optIn);
        });
    });
}

document.getElementById('formMovInsert').addEventListener('submit', (e) => {
    e.preventDefault();

    const form = document.getElementById('formMovInsert');

    const dateNow = new Date();

    datos = {
        fecha: dateNow.toISOString().split('T')[0],
        hora: `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`,
        patente: form.inPatente.value,
        empresa: form.inEmpresa.value,
        tipo: form.inTipo.value
    };

    insertMovimiento(datos)
    .then(reply => {
        actualizarMovimientos();
        closeModal('MovInsert');
    });
});

async function getMovimientos(){
    if(getCookie('jwt')){
        let ret = await fetch(apiMovimientos, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization' : `Bearer ${getCookie('jwt')}`
            }
        })
        .then(reply => reply.json())
        .then(data => {return data})
        .catch(error => {console.log(error)});
        return ret;
    }
}

async function insertMovimiento(dataIn){
    let ret = await fetch(apiMovimientos, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization' : `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(dataIn)
    })
    .then(reply => reply.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.log(error);
    });
    return ret;
}

// Post pago
async function closeMovimiento(dataIn){
    let ret = await fetch(apiMovimientos, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-type' : 'application/json',
            'Authorization' : `Bearer ${getCookie('jwt')}`
        },
        body: JSON.stringify(dataIn)
    })
    .then(reply => reply.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.log(error);
    });
    return ret;
}

function impMovimientos(){
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:center; width: 1280px;">');
    ventanaImpr.document.write('<h1>Movimientos del Día</h1>');
    ventanaImpr.document.write('<table style="margin:auto;border:1px solid black;border-collapse:collapse">');
    ventanaImpr.document.write('<thead><tr><th>Ingreso</th><th>Salida</th><th>Patente</th><th>Empresa</th><th>Tipo</th></thead>');
    ventanaImpr.document.write('<tbody>');

    getMovimientos()
    .then(data => {
        if(data){
            data.forEach(itm => {
                ventanaImpr.document.write('<tr>');
                ventanaImpr.document.write(`<td style="padding:5px">${itm['horaent']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['horasal']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['patente']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['empresa']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['tipo']}</td>`);
                ventanaImpr.document.write('</tr>');
            });
            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    });
}

actualizarMovimientos();