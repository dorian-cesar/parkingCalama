$('#tablePagos').dataTable({
	ajax: {
		url: apiMovimientos,
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
		{ data: 'idmov' },
		{ data: null, render: function (data, type, row, meta) {
			if(row.fechasal&&row.fechasal!="0000-00-00"){
				var fechaent = new Date(row.fechaent+'T'+row.horaent);
				var fechasal = new Date(row.fechasal+'T'+row.horasal);
				var differencia = (fechasal.getTime() - fechaent.getTime()) / 1000;
				return Math.ceil(differencia / 60)+" min.";
			} else {
				return '';
			}
		}},
		{ data: 'patente' },
		{ data: 'empresa' },
		{ data: 'tipo' },
		{ data: 'valor', render: function (data, type, row, meta) {
			return "$"+row.valor+" CLP";
		}},
	],
	});