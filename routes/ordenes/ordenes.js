const router = require("express").Router();
const verify = require("../../functions/verifytoken");
const moment = require("moment");

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
} = require("./model.js");

router.get("/all-ordenes", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const atrib = req.query.atrib;
  const order = req.query.order;
  const excel = req.query.excel;
  const estado = parseInt(req.query.estado);

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
        req.query.order === undefined &&
        req.query.estado === undefined
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

// my orders

router.get("/my-ordenes", verify, async (req, res) => {
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
      console.log("dataset de tabla de ordenes completa ...");
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
      console.log("entregando todos los ordenes ...");
      res.status(200).json(query);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// search

router.get("/search", verify, async (req, res) => {
  const text = req.query.text;
  const privado = req.query.privado;
  const user_id = req.user.user_id;
  try {
    if (privado === undefined) {
      const query = await getOrdenesBySearch(text);
      console.log("entregando todas las ordenes segun busqueda ...");
      res.status(200).json(query.filter((orden) => orden.estatus === 1));
    } else {
      const query = await getOrdenesBySearch(text);
      console.log("entregando todas las ordenes segun busqueda ...");
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

router.post("/crear", verify, async (req, res) => {
  const orden = req.body.orden;
  const user_id = req.user.user_id;
  //verificar que el pedido exista y este activo

  //verificar que tiene productos
  if (orden.productos.length === 0)
    return res.status(400).json("no hay productos para esta orden");

  //guardar la orden en tabla de ordenes
  const guardarOrden = await crearOrden(
    orden,
    user_id,
    moment().format("YYYY-MM-DD"),
  );
  if (!guardarOrden) res.status(400).json("error al guardar la orden");
  console.log("orden creada..");

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
    console.log("producto creado...");
  });

  res.status(200).json("orden creada exitosamente");
});

router.get("/get-orden-details/:id_orden", async (req, res) => {
  const id_orden = parseInt(req.params.id_orden);
  const orden = {
    id_orden: id_orden,
    id_pedido: 0,
    nombre_vendedor: "",
    email_vendedor: "",
    numero_vendedor: "",
    direccion_vendedor: "",
    nombre_cliente: "",
    numero_cliente: "",
    direccion_cliente: "",
    fecha_creacion: "",
    estado: "",
    productos: [],
    pagos: [],
  };

  try {
    const ordenDetail = await getOrdenDetailById(id_orden);

    if (ordenDetail.length === 0)
      return res.status(400).json("orden no existe");
    if (ordenDetail[0].estatus === 0)
      return res.status(400).json("orden eliminada");

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

module.exports = router;
