const { database } = require("../../database/database");

const sumar = (array, attrib) => {
  return parseFloat(
    array
      .reduce((a, b) => {
        return a + b[attrib];
      }, 0)
      .toFixed(2),
  );
};

const getAllOrdenesByFechaWithCompra = async (desde, hasta) => {
  return database
    .select(
      "a.pedido_id",
      "a.orden_id",
      "a.nombre_cliente",
      "a.direccion_cliente as direccion",
      "a.fecha",
      "a.estado",
      "e.nombre_status",
      database.raw(`CONCAT(d.name,' ', d.lastname) as vendedor`),
      database.raw(`SUM(ventas.ventas)  AS ventas`),
      database.raw(`IFNULL(ROUND(pago.pagos,2),0) as pagos`),
      database.raw(
        `SUM(ventas.ventas) - IFNULL(ROUND(pago.pagos,2),0) as saldo`,
      ),
    )
    .from("ordenes AS a")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(cantidad * precio),2) as ventas`),
        )
        .from("linea_compra")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("ventas"),
      "ventas.orden_id",
      "a.orden_id",
    )
    .leftJoin(
      database
        .select("orden_id", database.raw(`ROUND(SUM(cantidad),2) as pagos`))
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "a.orden_id",
    )
    .innerJoin("usuarios as d", "a.id_user", "d.user_id")
    .innerJoin("status as e", "a.estado", "e.status_id")
    .where("a.estatus", "=", 1)
    .whereBetween("a.fecha", [desde, hasta])
    .groupBy("a.orden_id")
    .orderBy("a.orden_id", "DESC")
    .then((ordenes) => {
      return ordenes;
    })
    .catch((error) => {
      return error;
    });
};

const getAllProveedoresVentas = async (desde, hasta) => {
  return database
    .select(
      "a.proveedor",
      database.raw(`SUM(IFNULL(b.cantidad,0)) as productos`),
      database.raw(`IFNULL(ROUND(SUM(b.cantidad * b.precio),2),0) as ventas`),
    )
    .from("proveedores as a")
    .leftJoin("linea_compra as b", "b.proveedor_id", "a.proveedor_id")
    .innerJoin("ordenes as c", "b.orden_id", "c.orden_id")
    .whereBetween("c.fecha", [desde, hasta])
    .andWhere("a.estatus", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.proveedor")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const getAllProveedoresVentasTotal = async () => {
  return database
    .select(
      "a.proveedor",
      database.raw(`SUM(IFNULL(b.cantidad,0)) as productos`),
      database.raw(`IFNULL(ROUND(SUM(b.cantidad * b.precio),2),0) as ventas`),
    )
    .from("proveedores as a")
    .leftJoin("linea_compra as b", "b.proveedor_id", "a.proveedor_id")
    .andWhere("a.estatus", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.proveedor")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};
const getAllProductosSinProveedor = async () => {
  return database
    .select("a.linea_id", "a.proveedor_id")
    .from("linea_compra as a")
    .where("a.estatus", "=", 1)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const getAllVendedoresConVentas = async (desde, hasta) => {
  return database
    .select(
      "a.name",
      "a.lastname",
      database.raw(`COUNT(b.orden_id) as ventas`),
      database.raw(`SUM(ventas.ventasTotal) as ventas_total`),
      database.raw(`IFNULL(ROUND(SUM(pago.pagos),2),0) as pagado`),
    )
    .from("usuarios as a")
    .innerJoin("ordenes as b", "b.id_user", "a.user_id")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw("ROUND(SUM(cantidad * precio),2) as ventasTotal"),
        )
        .from("linea_compra")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("ventas"),
      "ventas.orden_id",
      "b.orden_id",
    )
    .leftJoin(
      database
        .select("orden_id", database.raw(`ROUND(SUM(cantidad),2) as pagos`))
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "b.orden_id",
    )
    .whereBetween("b.fecha", [desde, hasta])
    .andWhere("a.estado", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.user_id")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const getAllVendedoresConVentasTotal = async () => {
  return database
    .select(
      "a.name",
      "a.lastname",
      database.raw(`COUNT(b.orden_id) as ventas`),
      database.raw(`SUM(ventas.ventasTotal) as ventas_total`),
      database.raw(`IFNULL(ROUND(SUM(pago.pagos),2),0) as pagado`),
    )
    .from("usuarios as a")
    .innerJoin("ordenes as b", "b.id_user", "a.user_id")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw("ROUND(SUM(cantidad * precio),2) as ventasTotal"),
        )
        .from("linea_compra")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("ventas"),
      "ventas.orden_id",
      "b.orden_id",
    )
    .leftJoin(
      database
        .select("orden_id", database.raw(`ROUND(SUM(cantidad),2) as pagos`))
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "b.orden_id",
    )
    .andWhere("a.estado", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.user_id")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const getVentasPorFecha = async (desde, hasta) => {
  return database
    .select(
      "a.fecha",
      database.raw(`SUM(ventas.ventas)  AS ventas`),
      database.raw(`IFNULL(ROUND(SUM(pago.pagos),2),0) as pagado`),
    )
    .from("ordenes AS a")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(cantidad * precio),2) as ventas`),
        )
        .from("linea_compra")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("ventas"),
      "ventas.orden_id",
      "a.orden_id",
    )
    .leftJoin(
      database
        .select("orden_id", database.raw(`ROUND(SUM(cantidad),2) as pagos`))
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "a.orden_id",
    )
    .where("a.estatus", "=", 1)
    .whereBetween("a.fecha", [desde, hasta])
    .groupBy("a.fecha")
    .orderBy("a.fecha", "DESC")
    .then((ordenes) => {
      return ordenes;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
};

const getProductosPorFecha = async (desde, hasta) => {
  return database
    .select(
      "a.linea_id",
      "a.producto",
      "a.orden_id",
      "a.precio",
      "a.talla",
      "a.color",
      "a.cantidad",
      "b.fecha",
      database.raw(`CONCAT(c.name,' ', c.lastname) as vendedor`),
    )
    .from("linea_compra as a")
    .innerJoin("ordenes as b", "b.orden_id", "a.orden_id")
    .innerJoin("usuarios as c", "c.user_id", "b.id_user")
    .whereBetween("b.fecha", [desde, hasta])
    .where("a.estatus", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .orderBy("b.fecha", "DESC")
    .then((ordenes) => {
      return ordenes;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
};

module.exports.getAllOrdenesByFechaWithCompra = getAllOrdenesByFechaWithCompra;
module.exports.sumar = sumar;
module.exports.getAllProveedoresVentas = getAllProveedoresVentas;
module.exports.getAllProveedoresVentasTotal = getAllProveedoresVentasTotal;
module.exports.getAllProductosSinProveedor = getAllProductosSinProveedor;
module.exports.getAllVendedoresConVentas = getAllVendedoresConVentas;
module.exports.getAllVendedoresConVentasTotal = getAllVendedoresConVentasTotal;
module.exports.getVentasPorFecha = getVentasPorFecha;
module.exports.getProductosPorFecha = getProductosPorFecha;
