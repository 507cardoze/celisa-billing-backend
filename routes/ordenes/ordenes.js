const router = require('express').Router();
const verify = require('../../functions/verifytoken');
const moment = require('moment');

const {
	getAllOrdenes,
	getAllOrdenesWithPages,
	getOrdenesDataExcel,
	paginateQueryResults,
	getOrdenesBySearch,
	crearOrden,
	crearProducto,
} = require('./model.js');

router.get('/all-ordenes', verify, async (req, res) => {
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);
	const atrib = req.query.atrib;
	const order = req.query.order;
	const excel = req.query.excel;
	const estado = parseInt(req.query.estado);

	if (excel) {
		try {
			const query = await getOrdenesDataExcel();
			console.log('data de ordenes para excel ...');
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
				req.query.order === undefined &&
				req.query.estado === undefined
			) {
				const query = await getAllOrdenes();
				console.log('dataset de tabla de ordenes completa ...');
				res.status(200).json(query);
			} else {
				const query = await paginateQueryResults(
					page,
					limit,
					atrib,
					order,
					getAllOrdenes,
					getAllOrdenesWithPages,
					estado,
				);
				console.log('entregando todos los ordenes ...');
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
		const query = await getOrdenesBySearch(text);
		console.log('entregando todas las ordenes segun busqueda ...');
		res.status(200).json(query);
	} catch (error) {
		res.status(500).json(error);
	}
});

router.post('/crear', verify, async (req, res) => {
	const orden = req.body.orden;
	const user_id = req.user.user_id;
	//verificar que el pedido exista y este activo

	//verificar que tiene productos
	if (orden.productos.length === 0)
		return res.status(400).json('no hay productos para esta orden');

	//guardar la orden en tabla de ordenes
	const guardarOrden = await crearOrden(
		orden,
		user_id,
		moment().format('YYYY-MM-DD'),
	);
	if (!guardarOrden) res.status(400).json('error al guardar la orden');
	console.log('orden creada..');

	//crear los productos en tabla de linea de compra
	orden.productos.forEach(async (producto) => {
		const guardar = await crearProducto(
			orden.id_pedido,
			producto.descripcion,
			producto.talla,
			producto.color,
			producto.cantidad,
			producto.precio,
			user_id,
			1,
			guardarOrden[0],
		);
		if (!guardar)
			return res.status(400).json(`error al guardar el producto ${producto}`);
		console.log('producto creado...');
	});

	res.status(200).json('orden creada exitosamente');
});

module.exports = router;
