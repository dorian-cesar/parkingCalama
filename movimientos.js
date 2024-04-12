$('#tableMov').dataTable({
	ajax: {
		url: apiMovimientos,
		dataSrc: '',
	},
	language: {
		url: "./es-CL.json"
	},
	layout: {
		topStart: {
			buttons: [
				'copyHtml5',
				'excelHtml5',
				'csvHtml5',
				'pdfHtml5',
				'print']
			},
		bottomStart: 'pageLength'
	},
	columns: [
        { data: 'idmov'},
        { data: 'fechaent'},
        { data: 'fechasal'},
        { data: 'patente'},
        { data: 'empresa'},
        { data: 'tipo'}
	],
	});