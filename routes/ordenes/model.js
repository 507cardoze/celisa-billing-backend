const { database } = require('../../database/database');

const getAllOrdenes = async () => {
	return database
		.select('a.*', 'b.name as nombre', 'b.lastname as apellido')
		.from('ordenes as a')
		.innerJoin('usuarios as b', 'a.id_user', 'b.user_id')
		.then((orden) => {
			return orden;
		})
		.catch((error) => {
			return error;
		});
};

const getAllOrdenesWithPages = async (offset, limit, atrib, order) => {
	return database
		.select('a.*', 'b.name as nombre', 'b.lastname as apellido')
		.from('ordenes as a')
		.innerJoin('usuarios as b', 'a.id_user', 'b.user_id')
		.limit(limit)
		.offset(offset)
		.orderBy(`${atrib}`, `${order}`)
		.then((orden) => {
			return orden;
		})
		.catch((error) => {
			return error;
		});
};

const getOrdenesDataExcel = async () => {
	return database
		.select('a.*', 'b.name as nombre', 'b.lastname as apellido')
		.from('ordenes as a')
		.innerJoin('usuarios as b', 'a.id_user', 'b.user_id')
		.then((orden) => {
			return orden;
		})
		.catch((error) => {
			return error;
		});
};

const paginateQueryResults = async (
	page,
	limit,
	atrib,
	order,
	getAll,
	getWithPages,
) => {
	const offset = limit * page - limit;
	const endIndex = page * limit;
	const results = {};
	const total = await getAll();
	results.total = total.length;

	if (endIndex < total.length) {
		results.next = {
			page: page + 1,
			limit: limit,
		};
	}

	if (page > 1) {
		results.previous = {
			page: page,
			limit: limit,
		};
	}

	results.results = await getWithPages(offset, limit, atrib, order);
	return results;
};

const getOrdenesBySearch = async (text) => {
	return database
		.select('a.*', 'b.name as nombre', 'b.lastname as apellido')
		.from('ordenes as a')
		.innerJoin('usuarios as b', 'a.id_user', 'b.user_id')
		.where('b.name', 'like', `%${text}%`)
		.orWhere('b.lastname', 'like', `%${text}%`)
		.orWhere('a.orden_id', 'like', `%${text}%`)
		.orWhere('a.pedido_id', 'like', `%${text}%`)
		.orWhere('a.nombre_cliente', 'like', `%${text}%`)
		.orWhere('a.numero_cliente', 'like', `%${text}%`)
		.then((data) => {
			return data;
		})
		.catch((err) => {
			return err;
		});
};

const crearOrden = async (obj, id_user, fecha) => {
	return database('ordenes')
		.insert({
			pedido_id: obj.id_pedido,
			id_user: id_user,
			fecha: fecha,
			nombre_cliente: obj.nombre_cliente,
			direccion_cliente: obj.direccion_cliente,
			numero_cliente: obj.numero_cliente,
			estatus: 1,
		})
		.then((orden) => {
			return orden;
		})
		.catch((err) => {
			return err;
		});
};

const crearProducto = async (
	pedido_id,
	producto,
	talla,
	color,
	cantidad,
	precio,
	id_user,
	estatus,
	orden_id,
) => {
	return database('linea_compra')
		.insert({
			pedido_id,
			producto,
			talla,
			color,
			cantidad,
			precio,
			id_user,
			estatus,
			orden_id,
		})
		.then((compra) => {
			return compra;
		})
		.catch((err) => {
			return err;
		});
};

module.exports.getAllOrdenes = getAllOrdenes;
module.exports.getAllOrdenesWithPages = getAllOrdenesWithPages;
module.exports.getOrdenesDataExcel = getOrdenesDataExcel;
module.exports.getOrdenesBySearch = getOrdenesBySearch;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.crearOrden = crearOrden;
module.exports.crearProducto = crearProducto;
