const jwt = require("jsonwebtoken");
const { database } = require("../../database/database");

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
  });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

const verifyRefreshToken = (refreshToken) =>
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

const validateLoginInfo = async (username) => {
  return database
    .select("a.*", "b.pais")
    .from("usuarios as a")
    .innerJoin("pais as b", "b.pais_id", "a.id_pais")
    .where("a.username", "=", username)
    .andWhere("a.estado", "=", 1)
    .then((user) => user)
    .catch((err) => err);
};

const setNewUser = async (
  username,
  hashpass,
  rol,
  contact_number,
  correo_electronico,
  name,
  lastname,
  address,
  id_pais,
) => {
  return database("usuarios")
    .insert({
      username: username,
      password: hashpass,
      rol: rol,
      contact_number: contact_number,
      correo_electronico: correo_electronico,
      name,
      lastname,
      address,
      id_pais,
      estado: 0,
    })
    .then((user) => user)
    .catch((err) => err);
};

const saveRefreshToken = async (refreshToken, username, time) => {
  return database("usuarios")
    .where("username", "=", username)
    .update({
      RT: refreshToken,
      login_time: time,
      last_activity: time,
    })
    .then((user) => user)
    .catch((err) => err);
};

const verifyRefreshTokenDB = async (refreshToken) => {
  return database
    .select("a.*", "b.pais")
    .from("usuarios as a")
    .innerJoin("pais as b", "b.pais_id", "a.id_pais")
    .where("a.RT", "=", refreshToken)
    .andWhere("a.estado", "=", 1)
    .then((user) => user)
    .catch((err) => err);
};

const resetUserPassword = async (user_id, password) => {
  return database("usuarios")
    .where("user_id", "=", user_id)
    .update({
      password: password,
    })
    .then((user) => user)
    .catch((err) => err);
};

const deleteRefreshToken = async (user_id) => {
  return database("usuarios")
    .where("user_id", "=", user_id)
    .update({
      RT: null,
    })
    .then((user) => user)
    .catch((err) => err);
};

const getUserData = async (user_id) => {
  return database
    .select("a.*", "b.pais")
    .from("usuarios as a")
    .innerJoin("pais as b", "b.pais_id", "a.id_pais")
    .where("a.user_id", "=", user_id)
    .then((user) => user)
    .catch((err) => err);
};

const getUserDataExcel = async () => {
  return database
    .select(
      "a.username",
      "a.rol",
      "a.contact_number",
      "a.correo_electronico",
      "a.name",
      "a.lastname",
      "a.address",
      "b.pais",
    )
    .from("usuarios as a")
    .innerJoin("pais as b", "b.pais_id", "a.id_pais")
    .then((user) => user)
    .catch((err) => err);
};

const updateUserDetails = async (
  name,
  lastname,
  email,
  number,
  id_pais,
  address,
  user_id,
  rol,
) => {
  return database("usuarios")
    .where("user_id", "=", user_id)
    .update({
      name: name,
      lastname: lastname,
      correo_electronico: email,
      contact_number: number,
      id_pais: id_pais,
      address: address,
      rol: rol,
    })
    .then((user) => user)
    .catch((err) => err);
};

const getUserByPermiso = (array, permiso) => {
  return array.filter((user) => user.rol === permiso).length;
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
  const definitivo_total = await getAll();
  results.dashboard = {
    total: definitivo_total.length,
    administrador: getUserByPermiso(definitivo_total, "Administrador"),
    vendedor: getUserByPermiso(definitivo_total, "Usuario Final"),
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

  results.results = await getWithPages(offset, limit, atrib, order);
  return results;
};

const getAllUsers = async () => {
  return database
    .select("*")
    .from("usuarios")
    .then((user) => user)
    .catch((err) => err);
};

const getAllUsersWithPages = async (offset, limit, atrib, order) => {
  return database
    .select("*")
    .from("usuarios")
    .limit(limit)
    .offset(offset)
    .orderBy(`${atrib}`, `${order}`)
    .then((user) => user)
    .catch((err) => err);
};

const getUserBySearch = (text) => {
  return database
    .select("*")
    .from("usuarios")
    .where("name", "like", `%${text}%`)
    .orWhere("lastname", "like", `%${text}%`)
    .orWhere("contact_number", "like", `%${text}%`)
    .orWhere("correo_electronico", "like", `%${text}%`)
    .orWhere("address", "like", `%${text}%`)
    .then((user) => user)
    .catch((err) => err);
};

const updateUserEstado = async (user_id, estado) => {
  return database("usuarios")
    .where("user_id", "=", user_id)
    .update({
      estado: estado,
    })
    .then((user) => user)
    .catch((err) => err);
};

module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.generateAccessToken = generateAccessToken;
module.exports.setNewUser = setNewUser;
module.exports.validateLoginInfo = validateLoginInfo;
module.exports.saveRefreshToken = saveRefreshToken;
module.exports.verifyRefreshTokenDB = verifyRefreshTokenDB;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.resetUserPassword = resetUserPassword;
module.exports.deleteRefreshToken = deleteRefreshToken;
module.exports.getUserData = getUserData;
module.exports.updateUserDetails = updateUserDetails;
module.exports.getAllUsers = getAllUsers;
module.exports.getAllUsersWithPages = getAllUsersWithPages;
module.exports.paginateQueryResults = paginateQueryResults;
module.exports.getUserBySearch = getUserBySearch;
module.exports.updateUserEstado = updateUserEstado;
module.exports.getUserDataExcel = getUserDataExcel;
