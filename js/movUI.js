var tableMov = $('#tableMov').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
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

// Abrir Modales

async function modalMovInsert(){
    const form = document.getElementById('formInsertMov');
    form.patente.value = '';

    let empresas = await getEmp();

    if(empresas){
        form.empresa.textContent = '';
        empresas.forEach(data => {
            var optIn = document.createElement('option');
            optIn.value = data['idemp'];
            optIn.textContent = data['nombre'];
            form.empresa.appendChild(optIn);
        });
    }

    openModal('movinsert');
}

async function refreshMov(){
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshMov');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov();

        if(data){
            tableMov.clear();
            data.forEach(item => {
                tableMov.rows.add([{
                    'idmov' : item['idmov'],
                    'fechaent' : item['horaent'],
                    'fechasal' : item['horasal'],
                    'patente' : item['patente'],
                    'empresa' : item['empresa'],
                    'tipo' : item['tipo']
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
        patente: form.patente.value,
        empresa: form.empresa.value,
        tipo: form.tipo.value
    };

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
                        <th>Ingreso</th>
                        <th>Salida</th>
                        <th>Patente</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
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
                        <td style="padding:5px">${itm['horaent']}</td>
                        <td style="padding:5px">${itm['horasal']}</td>
                        <td style="padding:5px">${itm['patente']}</td>
                        <td style="padding:5px">${itm['empresa']}</td>
                        <td style="padding:5px">${itm['tipo']}</td>
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