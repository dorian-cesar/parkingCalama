$('#tableWL').dataTable({
	ajax: {
		url: apiWhitelist,
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
		{ data: 'idwl' },
		{ data: 'patente' },
		{ data: null, render: function (data, type, row, meta) {
			let btnEdit = `<button onclick="modalWLUpdate(${row.idwl})" class="btn-table fa fa-pencil"></button>`;
			let btnDel = `<button onclick="modalWLDelete(${row.idwl})" class="btn-table fa fa-trash-o"></button>`;
			return btnEdit+btnDel;
		}},
	],
	});