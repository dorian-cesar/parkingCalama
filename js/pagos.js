/*
Funciones relacionadas a pagos
*/
var tablePagos = $('#tablePagos').DataTable({
    order: [[0, 'desc']],
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idpagos'},
        { data: 'tiempo'},
        { data: 'patente'},
        { data: 'valor'},
        { data: 'ctrl', className: 'no-sort'}
    ]
});