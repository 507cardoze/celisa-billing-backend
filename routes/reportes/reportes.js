const router = require("express").Router();
const verify = require("../../functions/verifytoken");
const moment = require("moment");

const { getAllOrdenesByFechaWithCompra } = require("./model");

router.get("/", async (req, res) => {
  const desde = req.query.desde;
  const hasta = req.query.hasta;
  const fecha = moment().format("DD MM YYYY hh:mm");

  const ordenesFiltradas = await getAllOrdenesByFechaWithCompra(desde, hasta);

  function sumar(array, attrib) {
    return array.reduce((a, b) => {
      return a + b[attrib];
    }, 0);
  }

  const reporte = {
    desde: desde,
    hasta: hasta,
    reporteGenerado: fecha,
    ventasTotales: parseFloat(sumar(ordenesFiltradas, "ventas").toFixed(2)),
    pagosTotales: parseFloat(sumar(ordenesFiltradas, "pagos").toFixed(2)),
    saldosTotales: parseFloat(sumar(ordenesFiltradas, "saldo").toFixed(2)),
    desglose: ordenesFiltradas,
  };

  res.status(200).json(reporte);
});

router.get("/ranking-clientes", async (req, res) => {
  res.status(200).json("ranking clientes");
});

router.get("/ranking-proveedores", async (req, res) => {
  res.status(200).json("ranking proveedores");
});

router.get("/ranking-vendedores", async (req, res) => {
  res.status(200).json("ranking proveedores");
});

module.exports = router;
