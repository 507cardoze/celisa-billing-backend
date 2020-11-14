const router = require('express').Router();
const verify = require('../../functions/verifytoken');
const moment = require('moment');
const {
	getAllPedidos,
	getAllPedidosWithPages,
	getPedidosDataExcel,
	paginateQueryResults,
	getPedidoBySearch,
	getAllPedidosByEstado,
	setNewPedido,
	updateEstadoAllPedidos,
} = require('./model.js');

//get all

router.get('/all-pedidos', verify, async (req, res) => {
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);
	const atrib = req.query.atrib;
	const order = req.query.order;
	const excel = req.query.excel;

	if (excel) {
		try {
			const query = await getPedidosDataExcel();
			console.log('data de pedidos para excel ...');
			res.status(200).json(query);
		} catch (error) {
			res.status(500).json(error);
		}
	} else {
		try {
			if (
				req.query.page === undefined &&
				req.query.limit === undefined &&
				req.query.atrib === undefined &&
				req.query.order === undefined
			) {
				const query = await getAllPedidos();
				console.log('dataset de tabla de pedidos completa ...');
				res.status(200).json(query);
			} else {
				const query = await paginateQueryResults(
					page,
					limit,
					atrib,
					order,
					getAllPedidos,
					getAllPedidosWithPages,
				);
				console.log('entregando todos los pedidos ...');
				res.status(200).json(query);
			}
		} catch (error) {
			res.status(500).json(error);
		}
	}
});

// search

router.get('/search', verify, async (req, res) => {
	const text = req.query.text;
	try {
		const query = await getPedidoBySearch(text);
		console.log('entregando todos los pedidos segun busqueda ...');
		res.status(200).json(query);
	} catch (error) {
		res.status(500).json(error);
	}
});

router.post('/crear', verify, async (req, res) => {
	const fecha = moment().format('YYYY-MM-DD');
	const estado = 1;

	try {
		const verifyEstado = await getAllPedidosByEstado(estado);
		if (verifyEstado.length > 0)
			return res
				.status(400)
				.json('Debe cerrar todos los pedidos activos primero');

		const query = await setNewPedido(fecha, estado);
		console.log('query: ', query);

		if (query) {
			console.log('creando nuevo pedido ...');
			res.status(200).json('pedido creado');
		} else {
			res.status(400).json('error en consulta');
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

router.put('/closeAll', verify, async (req, res) => {
	const estado = 0;

	try {
		const query = await updateEstadoAllPedidos(estado);

		if (query) {
			console.log('Cerrando todos los pedidos abiertos ...');
			res.status(200).json('pedido creado');
		} else {
			res.status(400).json('error en consulta');
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

router.get('/activos', verify, async (req, res) => {
	try {
		const query = await getAllPedidosByEstado(1);
		if (query) {
			console.log('entregando todos los pedidos activos ...');
			res.status(200).json(query);
		} else {
			res.status(400).json('error en consulta');
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

module.exports = router;
