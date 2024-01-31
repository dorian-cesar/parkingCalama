/*
Funciones relacionadas a pagos
*/
// Inicialización de la tabla de pagos utilizando DataTables
var tablePagos = $('#tablePagos').DataTable({
    // Establece el orden inicial de la tabla por la primera columna de forma descendente
    order: [[0, 'desc']],
    // Establece el idioma de la tabla utilizando el archivo de traducción para español de DataTables
    language: { url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CL.json" },
    // Definición de las columnas que no se pueden ordenar
    columnDefs : [ {
        targets: 'no-sort', // Se aplica a columnas con la clase 'no-sort'
        orderable: false, // No se permite ordenar estas columnas
    }],
    columns: [
        // Columna 1: ID de pagos
        { data: 'idpagos'},
        // Columna 2: Tiempo
        { data: 'tiempo'},
        // Columna 3: Patente
        { data: 'patente'},
        // Columna 4: Valor
        { data: 'valor'},
        // Columna 5: Control, con una clase 'no-sort' para no permitir ordenar esta columna
        { data: 'ctrl', className: 'no-sort'}
    ]
});