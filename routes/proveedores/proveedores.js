const router = require("express").Router();
const verify = require("../../functions/verifytoken");

const {
  getAllProveedores,
  getAllProveedoresWithPages,
  paginateQueryResults,
  getProveedorBySearch,
  getProveedorDetails,
  updateProveedorDetails,
  crearProveedor,
} = require("./model.js");

router.get("/all-proveedores", verify, async (req, res) => {
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
    const query = await getAllProveedores();
    console.log("dataset de tabla de proveedores completa ...");
    res.status(200).json(query);
  } else {
    const query = await paginateQueryResults(
      page,
      limit,
      atrib,
      order,
      getAllProveedores,
      getAllProveedoresWithPages,
    );
    console.log("entregando todos los proveedores ...");
    res.status(200).json(query);
  }
});

router.get("/proveedorSearch", verify, async (req, res) => {
  const texto = req.query.texto;

  try {
    const query = await getProveedorBySearch(texto);
    console.log("buscando proveedores");
    console.log(query);
    res.status(200).json(query);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/proveedorDetails", verify, async (req, res) => {
  const proveedor_id = req.query.proveedor_id;

  try {
    const query = await getProveedorDetails(proveedor_id);
    console.log("sacando detalles de proveedor");
    res.status(200).json(query);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/proveedorDetails", verify, async (req, res) => {
  const objdata = req.body;
  try {
    const validacion = await getProveedorDetails(objdata.proveedor_id);
    if (validacion.length === 0)
      return res.status(400).json("proveedor existe");
    await updateProveedorDetails(objdata);
    console.log("modificando detalles de proveedor");
    res.status(200).json(`Detalles Actualizados.`);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/proveedorDetails", verify, async (req, res) => {
  const objdata = req.body;
  try {
    await crearProveedor(objdata);
    console.log("Proveedor Creado");
    res.status(200).json(`Proveedor Creado.`);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
