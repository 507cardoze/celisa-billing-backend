const { database } = require("../../database/database");

const getAllProveedores = async () => {
  return database
    .select("*")
    .from("proveedores")
    .where("estatus", "=", 1)
    .then((res) => {
      return res;
    })
    .catch((error) => {
      return error;
    });
};

const getAllProveedoresWithPages = async (offset, limit, atrib, order) => {
  return database
    .select("*")
    .from("proveedores")
    .where("estatus", "=", 1)
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((res) => {
      return res;
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

const getProveedorBySearch = async (text) => {
  return database
    .select("*")
    .from("proveedores")
    .where("estatus", "=", 1)
    .andWhere("proveedor", "like", `%${text}%`)
    .orderBy("proveedor", "ASC")
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

const getProveedorDetails = async (proveedor_id) => {
  return database
    .select("*")
    .from("proveedores")
    .where("estatus", "=", 1)
    .andWhere("proveedor_id", "=", proveedor_id)
    .orderBy("proveedor", "ASC")
    .then((proveedores) => {
      return proveedores;
    })
    .catch((error) => {
      return error;
    });
};

const updateProveedorDetails = async (obj) => {
  return database("proveedores")
    .update({
      proveedor: obj.proveedor,
    })
    .where("proveedor_id", "=", obj.proveedor_id)
    .then((proveedores) => {
      return proveedores;
    })
    .catch((error) => {
      return error;
    });
};

const crearProveedor = async (obj) => {
  return database("proveedores")
    .insert({
      proveedor: obj.proveedor,
      estatus: 1,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

module.exports.getAllProveedores = getAllProveedores;
module.exports.getAllProveedoresWithPages = getAllProveedoresWithPages;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.getProveedorBySearch = getProveedorBySearch;
module.exports.getProveedorDetails = getProveedorDetails;
module.exports.updateProveedorDetails = updateProveedorDetails;
module.exports.crearProveedor = crearProveedor;
