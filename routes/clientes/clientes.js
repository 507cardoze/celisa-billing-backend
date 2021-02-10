const router = require("express").Router();
const verify = require("../../functions/verifytoken");

const {
  getAllClientes,
  getAllClientesDataExcel,
  getAllClientesWithPages,
  paginateQueryResults,
  verifyUserwithClientes,
} = require("./model");

const { getUserData } = require("../auth/model");

router.get("/all-clientes", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const atrib = req.query.atrib;
  const order = req.query.order;
  const excel = req.query.excel;
  const estado = parseInt(req.query.estado);

  if (excel) {
    try {
      const query = await getAllClientesDataExcel();
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
        req.query.order === undefined &&
        req.query.estado === undefined
      ) {
        const query = await getAllClientes();
        console.log("dataset de tabla de ordenes completa ...");
        res.status(200).json(query);
      } else {
        const query = await paginateQueryResults(
          page,
          limit,
          atrib,
          order,
          getAllClientes,
          getAllClientesWithPages,
          estado,
        );
        console.log("entregando todos los ordenes ...");
        res.status(200).json(query);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

router.get("/verify-loggedUser", verify, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const verifyUser = await getUserData(user_id);

    if (verifyUser.length > 0) {
      const query = await verifyUserwithClientes(
        verifyUser[0].user_id,
        `${verifyUser[0].name} ${verifyUser[0].lastname}`,
        verifyUser[0].address,
        verifyUser[0].id_pais,
        verifyUser[0].contact_number,
      );
      console.log("query", query);
      res.status(200).json(query);
    } else {
      console.log("query", query);
      res.status(400).json("usuario no existe");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
