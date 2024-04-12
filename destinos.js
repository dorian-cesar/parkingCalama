$('#tabelDest').dataTable({
	ajax: {
		url: apiDestinos,
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
		{ data: 'iddest' },
		{ data: 'ciudad' },
		{ data: 'valor' },
		{ data: null, render: function (data, type, row, meta) {
			let btnEdit = `<button onclick="modalDestUpdate(${row.iddest})" class="btn-table fa fa-pencil"></button>`;
			let btnDel = `<button onclick="modalDestDelete(${row.iddest})" class="btn-table fa fa-trash-o"></button>`;
			return btnEdit+btnDel;
		}},
	],
	});