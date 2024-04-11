$('#tableUsr').dataTable({
	ajax: {
		url: apiUsers,
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
        { data: 'iduser'},
        { data: 'mail'},
        { data: 'descriptor'},
        { data: null, render: function (data, type, row, meta) {
			const btnUpd = `<button onclick="modalUsrUpdate(${row.iduser})" class="btn-table fa fa-pencil"></button>`;
			const btnDel = `<button onclick="modalUsrDelete(${row.iduser})" class="btn-table fa fa-trash-o"></button>`;
			return btnUpd+btnDel;
		}},
	],
	});