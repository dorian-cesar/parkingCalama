var tablePagos = $('#tablePagos').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov'},
        { data: 'tiempo'},
        { data: 'patente'},
        { data: 'empresa'},
        { data: 'tipo'},
        { data: 'valor'}
    ]
});

async function refreshPagos(){
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshPagos');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov();

        if(data){
            tablePagos.clear();
            data.forEach(item => {
                if(item['fechasal']&&item['fechasal']!="0000-00-00"){
                    var fechaent = new Date(item['fechaent']+'T'+item['horaent']);
                    var fechasal = new Date(item['fechasal']+'T'+item['horasal']);
                    var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
                    var minutos = Math.ceil(differencia / 60);
                    if(item['tipo']==='Anden') { minutos = Math.ceil((differencia / 60) / 25)*25; }
                    tablePagos.rows.add([{
                        'idmov' : item['idmov'],
                        'tiempo' : minutos+' min.',
                        'patente' : item['patente'],
                        'empresa' : item['empresa'],
                        'tipo' : item['tipo'],
                        'valor' : '$'+item['valor'],
                    }]);
                }
            });
            tablePagos.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

async function impPagos() {
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write(`
        <html>
        <head>
            <title>Pagos</title>
            <link rel="stylesheet" href="css/styles.css">
        </head>
        <body style="text-align:center; width: 1280px;">
            <h1>Pagos del Día</h1>
            <table style="margin:auto;border:1px solid black;border-collapse:collapse">
                <thead>
                    <tr>
                        <th>Tiempo</th>
                        <th>Patente</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
    `);

    try {
        const data = await getMov();

        if (data) {
            data.forEach(itm => {
                if(itm['fechasal']&&itm['fechasal']!="0000-00-00"){
                    var fechaent = new Date(itm['fechaent']+'T'+itm['horaent']);
                    var fechasal = new Date(itm['fechasal']+'T'+itm['horasal']);
                    var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
                    var minutos = Math.ceil(differencia / 60);
                    if(itm['tipo']==='Anden') { minutos = Math.ceil((differencia / 60) / 25)*25; }

                    ventanaImpr.document.write(`
                        <tr>
                            <td style="padding:5px">${minutos} min.</td>
                            <td style="padding:5px">${itm['patente']}</td>
                            <td style="padding:5px">${itm['empresa']}</td>
                            <td style="padding:5px">${itm['tipo']}</td>
                            <td style="padding:5px">$${itm['valor']}</td>
                        </tr>
                    `);
                }
            });

            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}