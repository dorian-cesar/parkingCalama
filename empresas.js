$('#tableEmp').dataTable({
	ajax: {
		url: apiEmpresas,
		dataSrc: '',
	},
	language: {
		url: "/parkingCalama/es-CL.json"
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
		{ data: 'idemp' },
		{ data: 'nombre' },
		{ data: 'contacto' },
		{ data: null, render: function (data, type, row, meta) {
			let btnEdit = `<button onclick="modalEmpUpdate(${row.idemp})" class="btn-table fa fa-pencil"></button>`;
			let btnDel = `<button onclick="modalEmpDelete(${row.idemp})" class="btn-table fa fa-trash-o"></button>`;
			return btnEdit+btnDel;
		}},
	],
	});