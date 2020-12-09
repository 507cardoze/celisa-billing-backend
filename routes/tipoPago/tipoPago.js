const router = require('express').Router();
const verify = require('../../functions/verifytoken');

const {
	getAllTipoPagos,
	getAllTipoPagosWithPages,
	paginateQueryResults,
} = require('./model.js');

router.get('/all-tipo-pagos', verify, async (req, res) => {
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);
	const atrib = req.query.atrib;
	const order = req.query.order;

	if (
		req.query.page === undefined &&
		req.query.limit === undefined &&
		req.query.atrib === undefined &&
		req.query.order === undefined
	) {
		const query = await getAllTipoPagos();
		console.log('dataset de tabla de tipo de pagos completa ...');
		res.status(200).json(query);
	} else {
		const query = await paginateQueryResults(
			page,
			limit,
			atrib,
			order,
			getAllTipoPagos,
			getAllTipoPagosWithPages,
		);
		console.log('entregando todos los tipo de pagos ...');
		res.status(200).json(query);
	}
});

module.exports = router;
