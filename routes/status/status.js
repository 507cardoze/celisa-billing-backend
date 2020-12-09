const router = require('express').Router();
const verify = require('../../functions/verifytoken');

const {
	getAllStatus,
	getAllStatusWithPages,
	paginateQueryResults,
} = require('./model.js');

router.get('/all-status', verify, async (req, res) => {
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
		const query = await getAllStatus();
		console.log('dataset de tabla de status completa ...');
		res.status(200).json(query);
	} else {
		const query = await paginateQueryResults(
			page,
			limit,
			atrib,
			order,
			getAllStatus,
			getAllStatusWithPages,
		);
		console.log('entregando todos los status ...');
		res.status(200).json(query);
	}
});

module.exports = router;
