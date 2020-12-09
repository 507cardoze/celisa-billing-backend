const { database } = require('../../database/database');

const getAllTipoPagos = async () => {
	return database
		.select('*')
		.from('tipo_pago')
		.where('estatus', '=', 1)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			return error;
		});
};

const getAllTipoPagosWithPages = async (offset, limit, atrib, order) => {
	return database
		.select('*')
		.from('tipo_pago')
		.where('estatus', '=', 1)
		.limit(limit)
		.offset(offset)
		.orderBy(`${atrib}`, `${order}`)
		.then((res) => {
			return res;
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

module.exports.getAllTipoPagos = getAllTipoPagos;
module.exports.getAllTipoPagosWithPages = getAllTipoPagosWithPages;
module.exports.paginateQueryResults = paginateQueryResults;
