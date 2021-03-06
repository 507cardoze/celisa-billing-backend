const router = require("express").Router();
const bcrypt = require("bcryptjs");
const verify = require("../../functions/verifytoken");
const moment = require("moment");
const {
  validateLoginInfo,
  generateAccessToken,
  generateRefreshToken,
  setNewUser,
  saveRefreshToken,
  verifyRefreshTokenDB,
  verifyRefreshToken,
  resetUserPassword,
  deleteRefreshToken,
  getUserData,
  updateUserDetails,
  getAllUsers,
  getAllUsersWithPages,
  paginateQueryResults,
  getUserBySearch,
  updateUserEstado,
} = require("./model.js");

const { verifyUserwithClientes } = require("../clientes/model");

router
  .post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const userData = await validateLoginInfo(username);
      if (!userData) return res.status(400).json(userData);
      if (userData.length === 0)
        return res
          .status(400)
          .json(`Este usuario no valido o esta desactivado.`);

      if (!bcrypt.compareSync(password, userData[0].password))
        return res.status(400).json(`Contraseña incorrecta.`);
      let user = {
        user_id: userData[0].user_id,
        rol: userData[0].rol,
      };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const saveRefreshDB = await saveRefreshToken(
        refreshToken,
        username,
        moment().format("YYYY-MM-D HH:mm:ss"),
      );
      if (!saveRefreshDB) res.status(400).json(saveRefreshDB);
      console.log("Usuario logiando ...");
      res
        .status(201)
        .json({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  })
  .post("/register", verify, async (req, res) => {
    const {
      username,
      password,
      repeat_password,
      name,
      lastname,
      address,
      rol,
      contact_number,
      correo_electronico,
      id_pais,
    } = req.body;
    if (password !== repeat_password)
      return res.status(400).json("Contraseña no coinciden.");
    try {
      const userData = await validateLoginInfo(username);
      if (!userData) return res.status(400).json(userData);
      if (userData.length > 0)
        return res.status(400).json(`Este usuario ya existe.`);

      const hashpass = bcrypt.hashSync(password, 10);

      const query = await setNewUser(
        username,
        hashpass,
        rol,
        contact_number,
        correo_electronico,
        name,
        lastname,
        address,
        id_pais,
      );
      // crear plantilla de cliente por si tiene posibles ventas
      await verifyUserwithClientes(
        query[0],
        `${name} ${lastname}`,
        address,
        id_pais,
        contact_number,
      );
      console.log("registrando usuario ...");
      res.status(201).json("Usuario creado exitosamente.");
    } catch (err) {
      console.log(err);
      res.status(500).json(`error: ${err}`);
    }
  })
  .post("/token", async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.status(401).json("No esta autorizado");
    console.log("refrescando token .......");
    try {
      const verifyRFT = verifyRefreshToken(refreshToken);
      if (!verifyRFT) res.status(401).json("No esta autorizado");

      const verifingRefreshToken = await verifyRefreshTokenDB(refreshToken);
      if (verifingRefreshToken.length === 0)
        return res.status(401).json("No esta autorizado");

      const user = {
        user_id: verifyRFT.user_id,
      };

      const accessToken = generateAccessToken(user);
      console.log("usando refresh token para adquirir nuevo token");
      res.json({ accessToken: accessToken });
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .post("/reset", verify, async (req, res) => {
    const { user_id, password } = req.body;
    try {
      const hashpass = bcrypt.hashSync(password, 10);
      await resetUserPassword(user_id, hashpass);
      console.log("cambiando contraseña ... ");
      res.status(200).json("Contraseña cambiada con exito.");
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .delete("/logout", verify, async (req, res) => {
    const user_id = req.user.user_id;
    try {
      await deleteRefreshToken(user_id);
      console.log("deslogeando a usuario ...");
      res.status(200).json("refresh token deleted.");
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .get("/user-data", verify, async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const query = await getUserData(user_id);
      console.log("entregando data del usuario ...");
      res.status(200).json(query);
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .put("/update-data", verify, async (req, res) => {
    const {
      name,
      lastname,
      email,
      number,
      id_pais,
      address,
      user_id,
      rol,
    } = req.body;
    try {
      await updateUserDetails(
        name,
        lastname,
        email,
        number,
        id_pais,
        address,
        user_id,
        rol,
      );
      console.log("actualizando generales de usuario ... ");
      res.status(200).json("Detalles Actualizados.");
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .get("/all-users", verify, async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const atrib = req.query.atrib;
    const order = req.query.order;

    try {
      if (
        req.query.page === undefined &&
        req.query.limit === undefined &&
        req.query.atrib === undefined &&
        req.query.order === undefined
      ) {
        const query = await getAllUsers();
        console.log("dataset de tabla de usuario completa ...");
        res.status(200).json(query);
      } else {
        const query = await paginateQueryResults(
          page,
          limit,
          atrib,
          order,
          getAllUsers,
          getAllUsersWithPages,
        );
        console.log("entregando todos los usuarios ...");
        res.status(200).json(query);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .get("/search", verify, async (req, res) => {
    const text = req.query.text;
    try {
      const query = await getUserBySearch(text);
      console.log("entregando todos los usuarios segun busqueda ...");
      res.status(200).json(query);
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .get("/estado-update", verify, async (req, res) => {
    let estado = req.query.estado;
    const user_id = req.query.user_id;

    try {
      await updateUserEstado(user_id, estado === "true" ? 1 : 0);
      console.log("moviendo el estado del usuario ...");
      res.status(200).json("changed");
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .get("/byUserId", verify, async (req, res) => {
    const user_id = req.query.user_id;
    try {
      const query = await getUserData(user_id);
      console.log(`entregando data del usuario ${user_id} ...`);
      res.status(200).json(query);
    } catch (error) {
      res.status(500).json(error);
    }
  });

module.exports = router;
