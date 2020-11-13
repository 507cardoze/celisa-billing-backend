const router = require("express").Router();
const verify = require("../../functions/verifytoken");

const {
  getAllOrdenes,
  getAllOrdenesWithPages,
  getOrdenesDataExcel,
  paginateQueryResults,
  getOrdenesBySearch,
} = require("./model.js");

router.get("/all-ordenes", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const atrib = req.query.atrib;
  const order = req.query.order;
  const excel = req.query.excel;

  if (excel) {
    try {
      const query = await getOrdenesDataExcel();
      console.log("data de ordenes para excel ...");
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
        const query = await getAllOrdenes();
        console.log("dataset de tabla de ordenes completa ...");
        res.status(200).json(query);
      } else {
        const query = await paginateQueryResults(
          page,
          limit,
          atrib,
          order,
          getAllOrdenes,
          getAllOrdenesWithPages,
        );
        console.log("entregando todos los ordenes ...");
        res.status(200).json(query);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

// search

router.get("/search", verify, async (req, res) => {
  const text = req.query.text;
  try {
    const query = await getOrdenesBySearch(text);
    console.log("entregando todas las ordenes segun busqueda ...");
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
