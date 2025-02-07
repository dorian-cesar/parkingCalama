var tableMov = $('#tableMov').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov'},
        { data: 'fechaent'},  // Fecha de entrada
        { data: 'horaent'},   // Hora de entrada
        { data: 'fechasal'},  // Fecha de salida
        { data: 'horasal'},   // Hora de salida
        { data: 'patente'},
        { data: 'tipo'},
        { data: 'estado'}
    ]
});

// Abrir Modales

function cambiarFecha() {
    const selectorFecha = document.getElementById('fechaSelector');
    fechaSeleccionada = selectorFecha.value; // Actualizar la fecha seleccionada
    refreshMov(); // Refrescar la tabla con la nueva fecha
}

// Nueva función para filtrar movimientos
function filtrarMovimientos() {
    const fechaFiltro = document.getElementById('fechaFiltro').value;  // Obtener la fecha seleccionada
    if (fechaFiltro) {
        refreshMov(fechaFiltro); // Llamar a refreshMov con la fecha filtrada
    }
}

async function modalMovInsert(){
    const form = document.getElementById('formInsertMov');
    form.patente.value = '';

    // let empresas = await getEmp(); // Comentado para no obtener empresas

    // if(empresas){
    //     form.empresa.textContent = ''; // Comentado
    //     empresas.forEach(data => {
    //         var optIn = document.createElement('option');
    //         optIn.value = data['idemp'];
    //         optIn.textContent = data['nombre'];
    //         form.empresa.appendChild(optIn);
    //     });
    // }

    openModal('movinsert');
}

async function refreshMov(fecha = null){
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshMov');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov(fecha);  // Pasar la fecha como parámetro

        if(data){
            tableMov.clear();
            data.forEach(item => {
                tableMov.rows.add([{
                    'idmov' : item['idmov'],
                    'fechaent' : item['fechaent'],  // Fecha de entrada
                    'horaent' : item['horaent'],    // Hora de entrada
                    'fechasal' : item['fechasal'],  // Fecha de salida
                    'horasal' : item['horasal'],    // Hora de salida
                    'patente' : item['patente'],
                    'tipo' : item['tipo'],
                    'estado' : item['estado']
                }]);
            });
            tableMov.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}
async function doInsertMov(e){
    e.preventDefault();

    const form = document.getElementById('formInsertMov');

    if(!patRegEx.test(form.patente.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    const dateNow = new Date();

    datos = {
        fecha: dateNow.toISOString().split('T')[0],
        hora: `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`,
        patente: form.patente.value,   // No se verifica si ya existe, se registra directamente
        // empresa: form.empresa.value, // Comentado para no enviar empresa
        tipo: form.tipo.value
    };

    // Aquí puedes enviar los datos sin preocuparte de la patente duplicada
    let ret = await insertMov(datos);
    if(ret['error']){
        alert(ret['error']);
    } else {
        closeModal('movinsert');
    }
    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
    refreshMov();
}

async function impMovimientos() {
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write(`
        <html>
        <head>
            <title>Movimientos</title>
            <link rel="stylesheet" href="css/styles.css">
        </head>
        <body style="text-align:center; width: 1280px;">
            <h1>Movimientos del Día</h1>
            <table style="margin:auto;border:1px solid black;border-collapse:collapse">
                <thead>
                    <tr>
                        <th>Fecha Entrada</th>
                        <th>Hora Entrada</th>
                        <th>Fecha Salida</th>
                        <th>Hora Salida</th>
                        <th>Patente</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `);

    try {
        const data = await getMov();

        if (data) {
            data.forEach(itm => {
                ventanaImpr.document.write(`
                    <tr>
                        <td style="padding:5px">${itm['fechaent']}</td>
                        <td style="padding:5px">${itm['horaent']}</td>
                        <td style="padding:5px">${itm['fechasal']}</td>
                        <td style="padding:5px">${itm['horasal']}</td>
                        <td style="padding:5px">${itm['patente']}</td>
                        <td style="padding:5px">${itm['tipo']}</td>
                        <td style="padding:5px">${itm['estado']}</td>
                    </tr>
                `);
            });

            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function getMov(fecha = null) {
    let url = apiMovimientos;
    if (fecha) {
        url += `?fecha=${fecha}`; // Añadir el filtro de fecha a la URL
    }
    
    let ret = await fetch(url, {
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
