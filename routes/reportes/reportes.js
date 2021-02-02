const router = require("express").Router();
const verify = require("../../functions/verifytoken");
const moment = require("moment");

const {
  getAllOrdenesByFechaWithCompra,
  sumar,
  getAllProveedoresVentas,
  getAllProveedoresVentasTotal,
  getAllProductosSinProveedor,
  getAllVendedoresConVentas,
  getAllVendedoresConVentasTotal,
} = require("./model");

const { getAllProveedores } = require("../proveedores/model");

router.get("/", async (req, res) => {
  const desde = req.query.desde;
  const hasta = req.query.hasta;
  const fecha = moment().format("DD-MM-YYYY hh:mm a");
  const reporte = {
    desde,
    hasta,
    reporteGenerado: fecha,
  };

  try {
    const ordenesFiltradas = await getAllOrdenesByFechaWithCompra(desde, hasta);
    reporte.ventasTotales = sumar(ordenesFiltradas, "ventas");
    reporte.pagosTotales = sumar(ordenesFiltradas, "pagos");
    reporte.saldosTotales = sumar(ordenesFiltradas, "saldo");
    reporte.desglose = ordenesFiltradas;

    res.status(200).json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

router.get("/ranking-proveedores", async (req, res) => {
  const desde = req.query.desde;
  const hasta = req.query.hasta;
  const fecha = moment().format("DD-MM-YYYY hh:mm a");
  const reporte = {
    desde,
    hasta,
    reporteGenerado: fecha,
  };
  try {
    const proveedoresData = await getAllProveedoresVentas(desde, hasta);
    const proveedoresTotal = await getAllProveedoresVentasTotal();
    const productosSinProveedor = await getAllProductosSinProveedor();
    const TodosProveedores = await getAllProveedores();

    reporte.productosTotal = productosSinProveedor.length;
    reporte.productosSinproveedor = productosSinProveedor.filter(
      (producto) => producto.proveedor_id === null,
    ).length;
    reporte.porFecha = proveedoresData;
    reporte.total = proveedoresTotal;
    reporte.proveedoresList = TodosProveedores;

    res.status(200).json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

router.get("/ranking-vendedores", async (req, res) => {
  const desde = req.query.desde;
  const hasta = req.query.hasta;
  const fecha = moment().format("DD-MM-YYYY hh:mm a");
  const reporte = {
    desde,
    hasta,
    reporteGenerado: fecha,
  };

  try {
    const usuariosConVentas = await getAllVendedoresConVentas(desde, hasta);
    const usuariosConVentasTotal = await getAllVendedoresConVentasTotal();
    reporte.usuariosConVenta = usuariosConVentas;
    reporte.usuariosConVentaTotal = usuariosConVentasTotal;
    res.status(200).json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

module.exports = router;
