const jwt = require("jsonwebtoken");
const { database } = require('../database/database');
const moment = require('moment');

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

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json("No esta autorizado");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json("No esta autorizado");
    req.user = user;
    const registerActivity = await updateActivity(
      req.user.user_id,
      moment().format('YYYY-MM-D HH:mm:ss'),
    );
    if (registerActivity) {
      console.log("registrando actividad...")
    }
    if(!registerActivity) return res.status(401).json("server error");
    next();
  });
};