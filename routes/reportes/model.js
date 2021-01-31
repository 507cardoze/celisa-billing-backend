const { database } = require("../../database/database");

const getAllOrdenesByFechaWithCompra = async (desde, hasta) => {
  return database
    .raw(
      `SELECT a.pedido_id ,a.orden_id, a.nombre_cliente, a.direccion_cliente as direccion, CONCAT(d.name,' ', d.lastname) as vendedor , ROUND(SUM(b.precio),2) AS ventas , IFNULL(ROUND(pago.pagos,2),0) as pagos, ROUND(SUM(b.precio),2) - IFNULL(ROUND(pago.pagos,2),0) as saldo
      FROM ordenes AS a
      LEFT JOIN linea_compra AS b ON b.orden_id = a.orden_id
      LEFT JOIN (SELECT orden_id, SUM(cantidad) AS pagos FROM linea_pago WHERE estatus = 1 GROUP BY orden_id) AS pago ON pago.orden_id = a.orden_id
      INNER JOIN usuarios as d ON a.id_user = d.user_id
      WHERE a.estatus = 1 AND b.estatus = 1 AND a.fecha BETWEEN '${desde}' AND '${hasta}'
      GROUP BY a.orden_id
      ORDER BY a.orden_id DESC`,
    )
    .then((ordenes) => {
      return ordenes[0];
    })
    .catch((error) => {
      return error;
    });
};

module.exports.getAllOrdenesByFechaWithCompra = getAllOrdenesByFechaWithCompra;
