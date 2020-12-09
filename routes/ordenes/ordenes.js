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
	getAllMyOrdenes,
	getAllMyOrdenesWithPages,
	paginateQueryMyResults,
	getOrdenDetailById,
	getAllProductosByOrdenId,
	getAllPagosByOrdenId,
	updateOrderDetails,
	updateProductoEstatus,
	addCantidadProductos,
	restarCantidadProductos,
	updateProveedorToProducto,
	updateOrdenEstado,
	addPago,
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

// my orders

router.get('/my-ordenes', verify, async (req, res) => {
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);
	const atrib = req.query.atrib;
	const order = req.query.order;
	const estado = parseInt(req.query.estado);
	const user_id = req.user.user_id;

	try {
		if (
			req.query.page === undefined &&
			req.query.limit === undefined &&
			req.query.atrib === undefined &&
			req.query.order === undefined &&
			req.query.estado === undefined
		) {
			const query = await getAllMyOrdenes(0, user_id);
			console.log('dataset de tabla de ordenes completa ...');
			res.status(200).json(query);
		} else {
			const query = await paginateQueryMyResults(
				page,
				limit,
				atrib,
				order,
				getAllMyOrdenes,
				getAllMyOrdenesWithPages,
				estado,
				user_id,
			);
			console.log('entregando todos los ordenes ...');
			res.status(200).json(query);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// search

router.get('/search', verify, async (req, res) => {
	const text = req.query.text;
	const privado = req.query.privado;
	const user_id = req.user.user_id;
	try {
		if (privado === undefined) {
			const query = await getOrdenesBySearch(text);
			console.log('entregando todas las ordenes segun busqueda ...');
			res.status(200).json(query.filter((orden) => orden.estatus === 1));
		} else {
			const query = await getOrdenesBySearch(text);
			console.log('entregando todas las ordenes segun busqueda ...');
			res
				.status(200)
				.json(
					query.filter(
						(orden) => orden.id_user === user_id && orden.estatus === 1,
					),
				);
		}
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

router.get('/get-orden-details/:id_orden', verify, async (req, res) => {
	const id_orden = parseInt(req.params.id_orden);
	const orden = {
		id_orden: id_orden,
		id_pedido: 0,
		nombre_vendedor: '',
		email_vendedor: '',
		numero_vendedor: '',
		direccion_vendedor: '',
		nombre_cliente: '',
		numero_cliente: '',
		direccion_cliente: '',
		fecha_creacion: '',
		estado: '',
		estado_id: '',
		productos: [],
		pagos: [],
	};

	try {
		const ordenDetail = await getOrdenDetailById(id_orden);

		if (ordenDetail.length === 0)
			return res.status(400).json('orden no existe');
		if (ordenDetail[0].estatus === 0)
			return res.status(400).json('orden eliminada');

		orden.id_pedido = ordenDetail[0].pedido_id;
		orden.nombre_vendedor = `${ordenDetail[0].nombre} ${ordenDetail[0].apellido}`;
		orden.email_vendedor = ordenDetail[0].correo_electronico;
		orden.numero_vendedor = ordenDetail[0].contact_number;
		orden.direccion_vendedor = ordenDetail[0].address;
		orden.nombre_cliente = ordenDetail[0].nombre_cliente;
		orden.numero_cliente = ordenDetail[0].numero_cliente;
		orden.direccion_cliente = ordenDetail[0].direccion_cliente;
		orden.fecha_creacion = ordenDetail[0].fecha;
		orden.estado = ordenDetail[0].nombre_status;
		orden.estado_id = ordenDetail[0].estado_id;

		const allProductos = await getAllProductosByOrdenId(id_orden);
		orden.productos = allProductos;
		const allPagos = await getAllPagosByOrdenId(id_orden);
		orden.pagos = allPagos;

		console.log(`entregando datos de la orden numero: ${id_orden}`);
		res.status(200).json(orden);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.put('/update-order-details', verify, async (req, res) => {
	const id_orden = req.body.id_orden;
	const nombre_cliente = req.body.nombre_cliente;
	const numero_cliente = req.body.numero_cliente;
	const direccion_cliente = req.body.direccion_cliente;

	try {
		const query = await updateOrderDetails(
			id_orden,
			nombre_cliente,
			numero_cliente,
			direccion_cliente,
		);
		if (query) {
			console.log(`Actualizando detalles de orden: ${id_orden}`);
			res.status(200).json('Detalles Actualizados.');
		} else {
			console.log(query);
			res.status(400).json('error al actualizar detalle de orden');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/add-product-orden', verify, async (req, res) => {
	const id_orden = req.body.id_orden;
	const pedido_id = req.body.pedido_id;
	const producto = req.body.producto;
	const talla = req.body.talla;
	const color = req.body.color;
	const cantidad = req.body.cantidad;
	const precio = req.body.precio;
	const user_id = req.user.user_id;
	const estatus = 1;

	try {
		const query = await crearProducto(
			pedido_id,
			producto,
			talla,
			color,
			cantidad,
			precio,
			user_id,
			estatus,
			id_orden,
		);
		if (query) {
			console.log(`agregando producto a la orden: ${id_orden}`);
			res.status(200).json('Producto agregado.');
		} else {
			console.log(query);
			res.status(400).json('error al agregar producto.');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.put('/delete-producto', verify, async (req, res) => {
	const linea_id = req.body.linea_id;
	const estatus = 0;

	try {
		const query = await updateProductoEstatus(linea_id, estatus);
		if (query) {
			console.log(`Eliminando producto: ${linea_id}`);
			res.status(200).json('Detalles Actualizados.');
		} else {
			console.log(query);
			res.status(400).json('error al eliminar producto.');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.put('/update-cantidad', verify, async (req, res) => {
	const linea_id = req.body.linea_id;
	const decision = req.body.decision;
	const cantidad = req.body.cantidad;

	try {
		if (decision === 1) {
			const query = await addCantidadProductos(linea_id, cantidad);
			if (query) {
				console.log(`sumando producto: ${linea_id}`);
				res.status(200).json('cantidad actualizada');
			} else {
				console.log(query);
				res.status(400).json('error al sumando producto.');
			}
		} else {
			const query = await restarCantidadProductos(linea_id, cantidad);
			if (query) {
				console.log(`restando producto: ${linea_id}`);
				res.status(200).json('cantidad actualizada');
			} else {
				console.log(query);
				res.status(400).json('error al restando producto.');
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.put('/update-proveedor', verify, async (req, res) => {
	const linea_id = req.body.linea_id;
	const proveedor_id = req.body.proveedor_id;

	try {
		const query = await updateProveedorToProducto(linea_id, proveedor_id);
		if (query) {
			console.log(`actualizando de proveedor a producto: ${linea_id}`);
			res.status(200).json('Detalles Actualizados.');
		} else {
			console.log(query);
			res.status(400).json('error al eliminar producto.');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.put('/update-estado', verify, async (req, res) => {
	const id_orden = req.body.id_orden;
	const estado_id = req.body.estado_id;

	try {
		const query = await updateOrdenEstado(id_orden, estado_id);
		if (query) {
			console.log(`actualizando de estado a orden: ${id_orden}`);
			res.status(200).json('Detalles Actualizados.');
		} else {
			console.log(query);
			res.status(400).json('error al actualizar orden.');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/agregar-pago', verify, async (req, res) => {
	const id_orden = req.body.id_orden;
	const id_pedido = req.body.id_pedido;
	const id_tipo = req.body.id_tipo;
	const adjunto = req.body.adjunto;
	const cantidad = req.body.cantidad;
	const user_id = req.user.user_id;
	const fecha_pago = moment().format('YYYY-MM-DD');
	const estatus = 1;

	if (id_tipo !== 1 && adjunto === null)
		return res
			.status(400)
			.json('Todo pago que no sea al contado debe tener su adjunto.');

	try {
		const query = await addPago(
			id_pedido,
			fecha_pago,
			cantidad,
			estatus,
			id_tipo,
			id_orden,
			user_id,
			adjunto,
		);
		if (query) {
			console.log(`agregando pago a la orden: ${id_orden}`);
			res.status(200).json('Pago realizado.');
		} else {
			res.status(400).json('error al agregar pago.');
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;
