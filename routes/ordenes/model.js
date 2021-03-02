const { database } = require("../../database/database");

const getAllOrdenes = async (estado = 0) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.estatus", "=", 1)
    .then((orden) => {
      if (estado !== 0 && orden.length > 0) {
        return orden.filter((ord) => ord.estado === estado);
      } else {
        return orden;
      }
    })
    .catch((error) => {
      return error;
    });
};

const getAllMyOrdenes = async (estado = 0, id_user) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.id_user", "=", id_user)
    .andWhere("a.estatus", "=", 1)
    .then((orden) => {
      if (estado !== 0 && orden.length > 0) {
        return orden.filter((ord) => ord.estado === estado);
      } else {
        return orden;
      }
    })
    .catch((error) => {
      return error;
    });
};

const getAllOrdenesWithPages = async (
  offset,
  limit,
  atrib,
  order,
  estado = 0,
) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.estatus", "=", 1)
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((orden) => {
      if (estado !== 0 && orden.length > 0) {
        return orden.filter((ord) => ord.estado === estado);
      } else {
        return orden;
      }
    })
    .catch((error) => {
      return error;
    });
};

const getAllMyOrdenesWithPages = async (
  offset,
  limit,
  atrib,
  order,
  estado = 0,
  id_user,
) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.id_user", "=", id_user)
    .andWhere("a.estatus", "=", 1)
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((orden) => {
      if (estado !== 0) {
        if (orden.length > 0)
          return orden.filter((ord) => ord.estado === estado);
        return orden;
      } else {
        return orden;
      }
    })
    .catch((error) => {
      return error;
    });
};

const getOrdenesDataExcel = async () => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status as estado de la orden",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.estatus", "=", 1)
    .then((orden) => {
      return orden;
    })
    .catch((error) => {
      return error;
    });
};

const getOrdersByEstado = (array, estado) => {
  return array.filter((orden) => orden.estado === estado).length;
};

const paginateQueryResults = async (
  page,
  limit,
  atrib,
  order,
  getAll,
  getWithPages,
  estado,
) => {
  const offset = limit * page - limit;
  const endIndex = page * limit;
  const results = {};
  const total = await getAll(estado);
  const definitivo_total = await getAll(estado);
  results.dashboard = {
    total: definitivo_total.length,
    pendiente: getOrdersByEstado(definitivo_total, 1),
    aprobadas: getOrdersByEstado(definitivo_total, 2),
    llego: getOrdersByEstado(definitivo_total, 3),
    saldo_pendiente: getOrdersByEstado(definitivo_total, 4),
    completadas: getOrdersByEstado(definitivo_total, 5),
    canceladas: getOrdersByEstado(definitivo_total, 6),
  };
  results.total = total.length;

  if (endIndex < total.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (page > 1) {
    results.previous = {
      page: page,
      limit: limit,
    };
  }

  results.results = await getWithPages(offset, limit, atrib, order, estado);
  return results;
};

const paginateQueryMyResults = async (
  page,
  limit,
  atrib,
  order,
  getAll,
  getWithPages,
  estado,
  id_user,
) => {
  const offset = limit * page - limit;
  const endIndex = page * limit;
  const results = {};
  const total = await getAll(estado, id_user);
  const definitivo_total = await getAll(0, id_user);
  results.dashboard = {
    total: definitivo_total.length,
    pendiente: getOrdersByEstado(definitivo_total, 1),
    aprobadas: getOrdersByEstado(definitivo_total, 2),
    llego: getOrdersByEstado(definitivo_total, 3),
    saldo_pendiente: getOrdersByEstado(definitivo_total, 4),
    completadas: getOrdersByEstado(definitivo_total, 5),
    canceladas: getOrdersByEstado(definitivo_total, 6),
  };
  results.total = total.length;

  if (endIndex < total.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (page > 1) {
    results.previous = {
      page: page,
      limit: limit,
    };
  }

  results.results = await getWithPages(
    offset,
    limit,
    atrib,
    order,
    estado,
    id_user,
  );
  return results;
};

const getOrdenesBySearch = async (text) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "c.nombre_status as estado de la orden",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.estatus", "=", 1)
    .where("d.nombre", "like", `%${text}%`)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

const crearOrden = async (obj, id_user, fecha) => {
  return database("ordenes")
    .insert({
      pedido_id: obj.id_pedido,
      id_user: id_user,
      fecha: fecha,
      id_cliente: obj.id_cliente,
      estatus: 1,
      estado: 1,
    })
    .then((orden) => {
      return orden;
    })
    .catch((err) => {
      return err;
    });
};

const crearProducto = async (
  pedido_id,
  producto,
  talla,
  color,
  cantidad,
  precio,
  id_user,
  estatus,
  orden_id,
) => {
  return database("linea_compra")
    .insert({
      pedido_id,
      producto,
      talla,
      color,
      cantidad,
      precio,
      id_user,
      estatus,
      orden_id,
    })
    .then((compra) => {
      return compra;
    })
    .catch((err) => {
      return err;
    });
};

const getOrdenDetailById = async (id_orden) => {
  return database
    .select(
      "a.orden_id",
      "a.pedido_id",
      "a.id_user",
      "a.fecha",
      "a.estatus",
      "a.estado",
      "b.name as nombre",
      "b.lastname as apellido",
      "b.correo_electronico",
      "b.contact_number",
      "b.address",
      "c.nombre_status",
      "a.estado as estado_id",
      "d.nombre as nombre_cliente",
      "d.direccion as direccion_cliente",
      "d.numero as numero_cliente",
      "a.id_cliente",
    )
    .from("ordenes as a")
    .innerJoin("usuarios as b", "a.id_user", "b.user_id")
    .innerJoin("status as c", "a.estado", "c.status_id")
    .innerJoin("clientes as d", "a.id_cliente", "d.cliente_id")
    .where("a.estatus", "=", 1)
    .andWhere("a.orden_id", "=", id_orden)
    .then((orden) => {
      return orden;
    })
    .catch((err) => {
      return err;
    });
};

const getAllProductosByOrdenId = async (id_orden) => {
  return database
    .select(
      "linea_id",
      "producto as descripcion",
      "talla",
      "color",
      "cantidad",
      "precio",
      "proveedor_id",
      "id_user",
      "orden_id",
    )
    .from("linea_compra")
    .where("orden_id", "=", id_orden)
    .andWhere("estatus", "=", 1)
    .then((orden) => {
      return orden;
    })
    .catch((error) => {
      return error;
    });
};

const getAllPagosByOrdenId = async (id_orden) => {
  return database
    .select("a.*", "b.tipo", "c.name", "c.lastname")
    .from("linea_pago as a")
    .innerJoin("tipo_pago as b", "b.tipo_id", "a.tipo_id")
    .innerJoin("usuarios as c", "c.user_id", "a.id_user")
    .where("a.orden_id", "=", id_orden)
    .andWhere("a.estatus", "=", 1)
    .andWhere("b.estatus", "=", 1)
    .orderBy("a.pago_id", "desc")
    .then((orden) => {
      return orden;
    })
    .catch((error) => {
      return error;
    });
};

// const updateOrderDetails = async (
//   id_orden,
//   nombre_cliente,
//   numero_cliente,
//   direccion_cliente,
// ) => {
//   return database("ordenes")
//     .where("orden_id", "=", id_orden)
//     .update({
//       nombre_cliente: nombre_cliente,
//       numero_cliente: numero_cliente,
//       direccion_cliente: direccion_cliente,
//     })
//     .then((orden) => {
//       return orden;
//     })
//     .catch((err) => {
//       return err;
//     });
// };

const updateProductoEstatus = async (linea_id, estatus) => {
  return database("linea_compra")
    .where("linea_id", "=", linea_id)
    .update({
      estatus: estatus,
    })
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

const updateProveedorToProducto = async (linea_id, proveedor_id) => {
  return database("linea_compra")
    .where("linea_id", "=", linea_id)
    .update({
      proveedor_id: proveedor_id,
    })
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

const addCantidadProductos = async (linea_id, cantidad) => {
  return database("linea_compra")
    .where("linea_id", "=", linea_id)
    .update({
      cantidad: cantidad + 1,
    })
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

const restarCantidadProductos = async (linea_id, cantidad) => {
  return database("linea_compra")
    .where("linea_id", "=", linea_id)
    .update({
      cantidad: cantidad - 1,
    })
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

const updateOrdenEstado = async (id_orden, estado) => {
  return database("ordenes")
    .where("orden_id", "=", id_orden)
    .update({
      estado: estado,
    })
    .then((orden) => {
      return orden;
    })
    .catch((err) => {
      return err;
    });
};

const addPago = async (
  pedido_id,
  fecha_pago,
  cantidad,
  estatus,
  tipo_id,
  orden_id,
  id_user,
  adjunto,
) => {
  return database("linea_pago")
    .insert({
      pedido_id: pedido_id,
      fecha_pago: fecha_pago,
      cantidad: cantidad,
      tipo_id: tipo_id,
      id_user: id_user,
      estatus: estatus,
      orden_id: orden_id,
      adjunto: adjunto,
    })
    .then((pago) => {
      return pago;
    })
    .catch((err) => {
      return err;
    });
};

const updatePagoEstatus = async (pago_id, estatus) => {
  return database("linea_pago")
    .where("pago_id", "=", pago_id)
    .update({
      estatus: estatus,
    })
    .then((pago) => {
      return pago;
    })
    .catch((err) => {
      return err;
    });
};

const getProductoById = (linea_id) => {
  return database
    .select("producto as descripcion", "talla", "color", "precio")
    .from("linea_compra")
    .where("linea_id", "=", linea_id)
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

const updateProductoCampos = async (
  linea_id,
  descripcion,
  talla,
  color,
  precio,
) => {
  return database("linea_compra")
    .where("linea_id", "=", linea_id)
    .update({
      producto: descripcion,
      talla,
      color,
      precio,
    })
    .then((producto) => {
      return producto;
    })
    .catch((err) => {
      return err;
    });
};

module.exports.getAllOrdenes = getAllOrdenes;
module.exports.getAllOrdenesWithPages = getAllOrdenesWithPages;
module.exports.getOrdenesDataExcel = getOrdenesDataExcel;
module.exports.getOrdenesBySearch = getOrdenesBySearch;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.crearOrden = crearOrden;
module.exports.crearProducto = crearProducto;
module.exports.getAllMyOrdenes = getAllMyOrdenes;
module.exports.getAllMyOrdenesWithPages = getAllMyOrdenesWithPages;
module.exports.paginateQueryMyResults = paginateQueryMyResults;
module.exports.getOrdenDetailById = getOrdenDetailById;
module.exports.getAllProductosByOrdenId = getAllProductosByOrdenId;
module.exports.getAllPagosByOrdenId = getAllPagosByOrdenId;
//module.exports.updateOrderDetails = updateOrderDetails;
module.exports.updateProductoEstatus = updateProductoEstatus;
module.exports.addCantidadProductos = addCantidadProductos;
module.exports.restarCantidadProductos = restarCantidadProductos;
module.exports.updateProveedorToProducto = updateProveedorToProducto;
module.exports.updateOrdenEstado = updateOrdenEstado;
module.exports.addPago = addPago;
module.exports.updatePagoEstatus = updatePagoEstatus;
module.exports.getProductoById = getProductoById;
module.exports.updateProductoCampos = updateProductoCampos;
