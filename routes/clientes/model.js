const { database } = require("../../database/database");

const getAllClientes = async (estado = 0) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .orderBy("a.nombre", "ASC")
    .then((cliente) => {
      if (estado !== 0 && cliente.length > 0)
        return cliente.filter((clt) => clt.activo === estado);
      return cliente;
    })
    .catch((error) => error);
};

const getAllClientesDataExcel = async () => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .orderBy("a.nombre", "ASC")
    .then((cliente) => cliente)
    .catch((error) => error);
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
    .catch((error) => error);
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
            id_admin: 7,
          })
          .then((cliente) => {
            console.log(
              `creacion de datos de cliente del usuario nuevo, ${nombre}`,
              cliente,
            );
            return cliente[0];
          })
          .catch((error) => error);
      } else {
        console.log("get cliente id", cliente);
        return cliente[0].cliente_id;
      }
    })
    .catch((error) => error);
};

const getClientDtails = async (client_id) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .andWhere("a.cliente_id", "=", client_id)
    .orderBy("a.nombre", "ASC")
    .then((cliente) => cliente)
    .catch((error) => error);
};

const updateClientDetails = async (obj) => {
  return database("clientes")
    .update({
      nombre: obj.nombre,
      direccion: obj.direccion,
      id_pais: obj.id_pais,
      observacion: obj.observacion,
      numero: obj.numero,
    })
    .where("cliente_id", "=", obj.id_cliente)
    .then((cliente) => cliente)
    .catch((error) => error);
};

const getClientBySearch = async (text) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .andWhere("a.nombre", "like", `%${text}%`)
    .orderBy("a.nombre", "ASC")
    .then((cliente) => cliente)
    .catch((error) => error);
};

const crearCliente = async (obj) => {
  return database("clientes")
    .insert({
      nombre: obj.nombre,
      direccion: obj.direccion,
      id_pais: obj.id_pais,
      observacion: obj.observacion,
      activo: 1,
      numero: obj.numero,
      user_id: 0,
    })
    .then((cliente) => cliente)
    .catch((error) => error);
};

const updateClientRevendedoraDetails = async (obj) => {
  return database("clientes")
    .update({
      user_id: obj.selectedUsuario,
      id_admin: obj.selectedAdmin,
    })
    .where("cliente_id", "=", obj.id_cliente)
    .then((cliente) => cliente)
    .catch((error) => error);
};

const getClientDetailsByUserID = async (user_id) => {
  return database
    .select("a.*", "b.pais")
    .from("clientes as a")
    .innerJoin("pais as b", "a.id_pais", "b.pais_id")
    .where("a.activo", "=", 1)
    .andWhere("a.user_id", "=", user_id)
    .orderBy("a.nombre", "ASC")
    .then((cliente) => cliente)
    .catch((error) => error);
};

module.exports.getAllClientes = getAllClientes;
module.exports.getAllClientesDataExcel = getAllClientesDataExcel;
module.exports.getAllClientesWithPages = getAllClientesWithPages;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.verifyUserwithClientes = verifyUserwithClientes;
module.exports.getClientDtails = getClientDtails;
module.exports.updateClientDetails = updateClientDetails;
module.exports.getClientBySearch = getClientBySearch;
module.exports.crearCliente = crearCliente;
module.exports.updateClientRevendedoraDetails = updateClientRevendedoraDetails;
module.exports.getClientDetailsByUserID = getClientDetailsByUserID;
