const { database } = require("../../database/database");

const getAllPedidos = async () => {
  return database
    .select("*")
    .from("pedidos")
    .then((pedido) => {
      return pedido;
    })
    .catch((error) => {
      return error;
    });
};

const getAllPedidosWithPages = async (offset, limit, atrib, order) => {
  return database
    .select("*")
    .from("pedidos")
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((pedido) => {
      return pedido;
    })
    .catch((error) => {
      return error;
    });
};

const getPedidosDataExcel = async () => {
  return database
    .select(
      "pedido_id as #",
      "fecha",
      "gasto_operacion as Gasto de Operación",
      "estatus as estado",
    )
    .from("pedidos")
    .then((pedido) => {
      return pedido;
    })
    .catch((error) => {
      return error;
    });
};

const paginateQueryResults = async (
  page,
  limit,
  atrib,
  order,
  getAll,
  getWithPages,
) => {
  const offset = limit * page - limit;
  const endIndex = page * limit;
  const results = {};
  const total = await getAll();
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

  results.results = await getWithPages(offset, limit, atrib, order);
  return results;
};

const getPedidoBySearch = async (text) => {
  return database
    .select("*")
    .from("pedidos")
    .where("pedido_id", "like", `%${text}%`)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

const getAllPedidosByEstado = async (estado) => {
  return database
    .select("*")
    .from("pedidos")
    .where("estatus", "=", estado)
    .then((pedido) => {
      return pedido;
    })
    .catch((error) => {
      return error;
    });
};

const setNewPedido = async (fecha, estado) => {
  return database("pedidos")
    .insert({
      fecha: fecha,
      estatus: estado,
    })
    .then((pedido) => {
      return pedido;
    })
    .catch((err) => {
      return err;
    });
};

const updateEstadoAllPedidos = async (estado) => {
  return database("pedidos")
    .update({
      estatus: estado,
    })
    .then((pedido) => {
      return pedido;
    })
    .catch((err) => {
      return err;
    });
};

module.exports.getAllPedidos = getAllPedidos;
module.exports.getPedidosDataExcel = getPedidosDataExcel;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.getAllPedidosWithPages = getAllPedidosWithPages;
module.exports.getPedidoBySearch = getPedidoBySearch;
module.exports.getAllPedidosByEstado = getAllPedidosByEstado;
module.exports.setNewPedido = setNewPedido;
module.exports.updateEstadoAllPedidos = updateEstadoAllPedidos;
