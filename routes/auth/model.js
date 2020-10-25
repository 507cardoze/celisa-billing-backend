const jwt = require('jsonwebtoken');
const { database } = require('../../database/database');

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
};

const validateLoginInfo = async (username) => {
  return database
    .select('a.*',"b.pais")
    .from('usuarios as a')
    .innerJoin("pais as b", "b.pais_id","a.id_pais")
    .where('a.username', '=', username)
    .andWhere("a.estado", "=", 1)
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
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
  id_pais
) => {
  return database('usuarios')
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
      estado: 0
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const saveRefreshToken = async (refreshToken, username, time) => {
  return database('usuarios')
    .where('username', '=', username)
    .update({
      RT: refreshToken,
      login_time: time,
      last_activity: time,
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const verifyRefreshTokenDB = async (refreshToken) => {
  return database
  .select('a.*',"b.pais")
  .from('usuarios as a')
  .innerJoin("pais as b", "b.pais_id","a.id_pais")
    .where('a.RT', '=', refreshToken)
    .andWhere("a.estado","=",1)
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const resetUserPassword = async (username, password) => {
  return database('usuarios')
    .where('username', '=', username)
    .update({
      password: password,
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const deleteRefreshToken = async (user_id) => {
  return database('usuarios')
    .where('user_id', '=', user_id)
    .update({
      RT: null,
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const updateActivity = async (id_user, time) => {
  return database('usuarios')
    .where('user_id', '=', id_user)
    .update({
      last_activity: time,
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
};

const getUserData = async (user_id) => {
  return database
  .select('a.*',"b.pais")
  .from('usuarios as a')
  .innerJoin("pais as b", "b.pais_id","a.id_pais")
    .where('a.user_id', '=', user_id)
    .then(user => {
      return user;
    }).catch(error => {
      return error;
  })
}

const updateUserDetails = async (name, lastname, email, number, id_pais, address, user_id) => {
  return database('usuarios')
    .where('user_id', '=', user_id)
    .update({
      name: name,
      lastname: lastname,
      correo_electronico: email,
      contact_number: number,
      id_pais: id_pais,
      address:address
    })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
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
module.exports.updateActivity = updateActivity;
module.exports.getUserData = getUserData;
module.exports.updateUserDetails = updateUserDetails;
