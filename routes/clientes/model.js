const { database } = require("../../database/database");

const getAllClientes = async (estado = 0) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .then((cliente) => {
      if (estado !== 0 && cliente.length > 0)
        return cliente.filter((clt) => clt.activo === estado);
      return cliente;
    })
    .catch((error) => {
      return error;
    });
};

const getAllClientesDataExcel = async () => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .then((cliente) => {
      return cliente;
    })
    .catch((error) => {
      return error;
    });
};

const getAllClientesWithPages = async (
  offset,
  limit,
  atrib,
  order,
  estado = 0,
) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((cliente) => {
      if (estado !== 0 && cliente.length > 0)
        return cliente.filter((clt) => clt.activo === estado);
      return cliente;
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
  estado,
) => {
  const offset = limit * page - limit;
  const endIndex = page * limit;
  const results = {};
  const total = await getAll(estado);
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

const verifyUserwithClientes = async (
  user_id,
  nombre,
  direccion,
  id_pais,
  numero,
) => {
  return database
    .select("cliente_id")
    .from("clientes")
    .where("user_id", "=", user_id)
    .then((cliente) => {
      if (cliente.length === 0) {
        return database("clientes")
          .insert({
            nombre,
            direccion,
            id_pais,
            observacion: "Revendedora",
            activo: 1,
            numero,
            user_id,
          })
          .then((cliente) => {
            console.log(
              "creacion de revendedora en tabla de clientes: ",
              cliente,
            );
            return cliente[0];
          })
          .catch((err) => {
            return err;
          });
      } else {
        console.log("get cliente id", cliente);
        return cliente[0].cliente_id;
      }
    })
    .catch((err) => {
      return err;
    });
};

module.exports.getAllClientes = getAllClientes;
module.exports.getAllClientesDataExcel = getAllClientesDataExcel;
module.exports.getAllClientesWithPages = getAllClientesWithPages;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.verifyUserwithClientes = verifyUserwithClientes;
