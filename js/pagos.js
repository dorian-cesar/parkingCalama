const apiPagos = "http://localhost/parkingCalama/php/movimientos/api.php";

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
    getPagos()
    .then(data => {
        if(data){
            tablePagos.clear();
            data.forEach(item => {
                if(item['fechasal']!="0000-00-00"){
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
    });
}

async function getPagos(){
    if(getCookie('jwt')){
        let ret = await fetch(apiPagos, {
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
                if(itm['fechasal']!="0000-00-00"){
                    var fechaent = new Date(itm['fechaent']+'T'+itm['horaent']);
                    var fechasal = new Date(itm['fechasal']+'T'+itm['horasal']);
                    var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
                    var minutos = Math.ceil(differencia / 60);
                    if(itm['tipo']==='Anden') { minutos = Math.ceil((differencia / 60) / 25)*25; }
                    ventanaImpr.document.write('<tr>');
                    ventanaImpr.document.write(`<td style="padding:5px">${minutos} min.</td>`);
                    ventanaImpr.document.write(`<td style="padding:5px">${itm['patente']}</td>`);
                    ventanaImpr.document.write(`<td style="padding:5px">${itm['empresa']}</td>`);
                    ventanaImpr.document.write(`<td style="padding:5px">${itm['tipo']}</td>`);
                    ventanaImpr.document.write(`<td style="padding:5px">${itm['valor']}</td>`);
                    ventanaImpr.document.write('</tr>');
                }
            });
            ventanaImpr.document.write('</tbody></table>');
            ventanaImpr.document.close();
            ventanaImpr.print();
        }
    });
}

actualizarPagos();