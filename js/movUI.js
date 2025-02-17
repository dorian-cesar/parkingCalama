var tableMov = $('#tableMov').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs: [{ targets: 'no-sort', orderable: false }],
    columns: [
        { data: 'idmov' },
        { data: 'fechaent' },
        { data: 'horaent' },
        { data: 'fechasal' },
        { data: 'horasal' },
        { data: 'patente' },
        { data: 'tipo' },
        { data: 'estado' },
        { data: 'empresa' }
    ]
});

function aplicarFiltros() {
    tableMov.columns(5).search(document.getElementById('patenteFiltro').value).draw();
    tableMov.columns(6).search(document.getElementById('tipoFiltro').value).draw();
    tableMov.columns(7).search(document.getElementById('estadoFiltro').value).draw();
}

function cambiarFecha() {
    const selectorFecha = document.getElementById('fechaSelector');
    fechaSeleccionada = selectorFecha.value; // Actualizar la fecha seleccionada
    refreshMov(); // Refrescar la tabla con la nueva fecha
}

// Nueva función para filtrar movimientos
function filtrarMovimientos() {
    const fechaFiltro = document.getElementById('fechaFiltro').value;
    if (fechaFiltro) {
        refreshMov(fechaFiltro);
    }
}

async function modalMovInsert() {
    const form = document.getElementById('formInsertMov');
    if (form) {
        const patenteInput = form.querySelector('[name="patente"]');
        if (patenteInput) patenteInput.value = '';
    } else {
        console.error("Formulario 'formInsertMov' no encontrado.");
    }
    openModal('movinsert');
}


async function refreshMov(fecha = null) {
    if (getCookie('jwt')) {
        const refreshBtn = document.getElementById('btnRefreshMov');
        refreshBtn.disabled = true;
        refreshBtn.classList.replace('fa-refresh', 'fa-hourglass');

        let data = await getMov(fecha);
        if (data) {
            tableMov.clear();
            data.forEach(item => {
                tableMov.rows.add([{
                    'idmov': item['idmov'],
                    'fechaent': item['fechaent'],
                    'horaent': item['horaent'],
                    'fechasal': item['fechasal'],
                    'horasal': item['horasal'],
                    'patente': item['patente'],
                    'tipo': item['tipo'],
                    'estado': item['estado'],
                    'empresa': item['empresa'] || 'No Identificado'  // Asegúrate de manejar el caso en que empresa sea null
                }]);
            });
            tableMov.draw();
        }

        refreshBtn.disabled = false;
        refreshBtn.classList.replace('fa-hourglass', 'fa-refresh');
    }
}

async function doInsertMov(e) {
    e.preventDefault();
    const form = document.getElementById('formInsertMov');
    if (!form) {
        console.error("Formulario 'formInsertMov' no encontrado.");
        return;
    }

    const patenteInput = form.querySelector('[name="patente"]');
    if (!patenteInput) {
        console.error("Campo 'patente' no encontrado en el formulario.");
        return;
    }

    if (!patRegEx.test(patenteInput.value)) {
        alert('Formatos de patente:\nABCD12\nABCD-12\nAB-CD-12');
        return;
    }

    form.btnSubmit.disabled = true;
    form.btnSubmit.classList.add('disabled');

    const dateNow = new Date();
    let datos = {
        fecha: dateNow.toISOString().split('T')[0],
        hora: dateNow.toLocaleTimeString(),
        patente: patenteInput.value,
        tipo: form.tipo.value
    };

    let ret = await insertMov(datos);
    if (ret['error']) {
        alert(ret['error']);
    } else {
        closeModal('movinsert');
        refreshMov();
    }

    form.btnSubmit.disabled = false;
    form.btnSubmit.classList.remove('disabled');
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
    if (fecha) url += `?fecha=${fecha}`;
    
    try {
        let response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo movimientos:', error);
        return [];
    }
}
