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
      "a.id_cliente",
      "f.nombre as nombre_cliente",
      "f.direccion as direccion",
      "f.id_admin as revendedoraRef",
      "f.user_id as usuarioRef",
      "a.fecha",
      "a.estado",
      "e.nombre_status",
      "d.user_id as id_vendedores",
      database.raw(`CONCAT(d.name,' ', d.lastname) as vendedor`),
      database.raw(`SUM(IFNULL(ventas.ventas,0))  AS ventas`),
      database.raw(`ROUND(IFNULL(pago.pagos,0),2) as pagos`),
      database.raw(
        `SUM(IFNULL(ventas.ventas,0)) - ROUND(IFNULL(pago.pagos,0),2) as saldo`,
      ),
    )
    .from("ordenes AS a")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(
            `ROUND(SUM(IFNULL(cantidad,0) * IFNULL(precio,0)),2) as ventas`,
          ),
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
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(IFNULL(cantidad,0)),2) as pagos`),
        )
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "a.orden_id",
    )
    .innerJoin("usuarios as d", "a.id_user", "d.user_id")
    .innerJoin("status as e", "a.estado", "e.status_id")
    .innerJoin("clientes as f", "a.id_cliente", "f.cliente_id")
    .where("a.estatus", "=", 1)
    .whereBetween("a.fecha", [desde, hasta])
    .groupBy("a.orden_id")
    .orderBy("a.orden_id", "DESC")
    .then((ordenes) => {
      return ordenes;
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
};

const getAllProveedoresVentas = async (desde, hasta) => {
  return database
    .select(
      "a.proveedor_id",
      "a.proveedor",
      database.raw(`SUM(IFNULL(b.cantidad,0)) as productos`),
      database.raw(
        `ROUND(SUM(IFNULL(b.cantidad,0) * IFNULL(b.precio,0)),2) as ventas`,
      ),
    )
    .from("proveedores as a")
    .leftJoin("linea_compra as b", "b.proveedor_id", "a.proveedor_id")
    .innerJoin("ordenes as c", "b.orden_id", "c.orden_id")
    .whereBetween("c.fecha", [desde, hasta])
    .andWhere("a.estatus", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.proveedor")
    .orderBy("ventas", "DESC")
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
      "a.proveedor_id",
      "a.proveedor",
      database.raw(`SUM(IFNULL(b.cantidad,0)) as productos`),
      database.raw(
        `ROUND(SUM(IFNULL(b.cantidad,0) * IFNULL(b.precio,0)),2) as ventas`,
      ),
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
      "a.user_id",
      "a.name",
      "a.lastname",
      database.raw(`COUNT(b.orden_id) as ventas`),
      database.raw(`SUM(IFNULL(ventas.ventasTotal,0)) as ventas_total`),
      database.raw(`ROUND(SUM(IFNULL(pago.pagos,0)),2) as pagado`),
    )
    .from("usuarios as a")
    .innerJoin("ordenes as b", "b.id_user", "a.user_id")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(
            "ROUND(SUM(IFNULL(cantidad,0) * IFNULL(precio,0)),2) as ventasTotal",
          ),
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
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(IFNULL(cantidad,0)),2) as pagos`),
        )
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
      "a.user_id",
      "a.name",
      "a.lastname",
      database.raw(`COUNT(b.orden_id) as ventas`),
      database.raw(`SUM(IFNULL(ventas.ventasTotal,0)) as ventas_total`),
      database.raw(`ROUND(SUM(IFNULL(pago.pagos,0)),2) as pagado`),
    )
    .from("usuarios as a")
    .innerJoin("ordenes as b", "b.id_user", "a.user_id")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(
            "ROUND(SUM(IFNULL(cantidad,0) * IFNULL(precio,0)),2) as ventasTotal",
          ),
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
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(IFNULL(cantidad,0)),2) as pagos`),
        )
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
      database.raw(`ROUND(SUM(IFNULL(pago.pagos,0)),2) as pagado`),
    )
    .from("ordenes AS a")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(
            `ROUND(SUM(IFNULL(cantidad,0) * IFNULL(precio,0)),2) as ventas`,
          ),
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
        .select(
          "orden_id",
          database.raw(`ROUND(SUM(IFNULL(cantidad,0)),2) as pagos`),
        )
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

const getTotalClientes = () => {
  return database("clientes")
    .distinct()
    .where("activo", "=", 1)
    .orderBy("nombre", "ASC")
    .then((clientes) => clientes)
    .catch((err) => err);
};

const getAllClientesConVentas = async (desde, hasta) => {
  return database
    .select(
      "a.cliente_id",
      "a.nombre",
      "a.direccion",
      "a.observacion",
      "a.numero",
      database.raw(`COUNT(b.orden_id) as numero_ventas`),
      database.raw(`SUM(IFNULL(ventas.ventasTotal,0)) as ventas_total`),
      database.raw(`ROUND(SUM(IFNULL(pago.pagos,0)),2) as pagado`),
      database.raw(
        `SUM(IFNULL(ventas.ventasTotal,0)) - ROUND(SUM(IFNULL(pago.pagos,0)),2) as saldo`,
      ),
    )
    .from("clientes as a")
    .innerJoin("ordenes as b", "b.id_cliente", "a.cliente_id")
    .leftJoin(
      database
        .select(
          "orden_id",
          database.raw(
            `IFNULL(ROUND(SUM(cantidad * precio),2),0) as ventasTotal`,
          ),
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
        .select(
          "orden_id",
          database.raw(`IFNULL(ROUND(SUM(cantidad),2),0) as pagos`),
        )
        .from("linea_pago")
        .where("estatus", "=", 1)
        .groupBy("orden_id")
        .as("pago"),
      "pago.orden_id",
      "b.orden_id",
    )
    .whereBetween("b.fecha", [desde, hasta])
    .andWhere("a.activo", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.cliente_id")
    .orderBy("ventas_total", "DESC")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const getAllClientesConSaldosAltos = async (desde, hasta) => {
  return database
    .select(
      "a.cliente_id",
      "a.nombre",
      "a.direccion",
      "a.observacion",
      "a.numero",
      database.raw(`COUNT(b.orden_id) as numero_ventas`),
      database.raw(`SUM(IFNULL(ventas.ventasTotal,0)) as ventas_total`),
      database.raw(`ROUND(SUM(IFNULL(pago.pagos,0)),2) as pagado`),
      database.raw(
        `SUM(IFNULL(ventas.ventasTotal,0)) - ROUND(SUM(IFNULL(pago.pagos,0)),2) as saldo`,
      ),
    )
    .from("clientes as a")
    .innerJoin("ordenes as b", "b.id_cliente", "a.cliente_id")
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
    .andWhere("a.activo", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .groupBy("a.cliente_id")
    .orderBy("saldo", "DESC")
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.log(err);
      return err;
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
module.exports.getTotalClientes = getTotalClientes;
module.exports.getAllClientesConVentas = getAllClientesConVentas;
module.exports.getAllClientesConSaldosAltos = getAllClientesConSaldosAltos;
