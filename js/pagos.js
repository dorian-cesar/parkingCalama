var tablePagos = $('#tablaPagos').DataTable({
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

function actualizarPagos() {
    getMovimientos()
    .then(data => {
        if(data){
            tablePagos.clear();
            data.forEach(item => {
                var fechaent = new Date(item['fechaent']+'T'+item['horaent']);
                var fechasal = new Date(item['fechasal']+'T'+item['horasal']);
                var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
                var minutos = differencia / 60;
                tablePagos.rows.add([{
                    'idmov' : item['idmov'],
                    'tiempo' : minutos+' min.',
                    'patente' : item['patente'],
                    'empresa' : item['empresa'],
                    'tipo' : item['tipo'],
                    'valor' : item['valor'],
                }]);
            });
            tablePagos.draw();
        }
    });
}

function impPagos(){
    const ventanaImpr = window.open('', '_blank');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:center; width: 1280px;">');
    ventanaImpr.document.write('<h1>Movimientos del Día</h1>');
    ventanaImpr.document.write('<table style="margin:auto;border:1px solid black;border-collapse:collapse">');
    ventanaImpr.document.write('<thead><tr><th>Tiempo</th><th>Patente</th><th>Empresa</th><th>Tipo</th><th>Valor</th></thead>');
    ventanaImpr.document.write('<tbody>');

    getMovimientos()
    .then(data => {
        if(data){
            data.forEach(itm => {
                var fechaent = new Date(itm['fechaent']+'T'+itm['horaent']);
                var fechasal = new Date(itm['fechasal']+'T'+itm['horasal']);
                var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
                var minutos = differencia / 60;
                ventanaImpr.document.write('<tr>');
                ventanaImpr.document.write(`<td style="padding:5px">${minutos}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['patente']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['empresa']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['tipo']}</td>`);
                ventanaImpr.document.write(`<td style="padding:5px">${itm['valor']}</td>`);
                ventanaImpr.document.write('</tr>');
            });
            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    });
}

actualizarPagos();