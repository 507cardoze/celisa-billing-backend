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

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //   const { error } = await loginValidation(req.body);
  //   if (error) return res.status(400).json(error.details[0].message);

  try {
    const userData = await validateLoginInfo(username);
    if (!userData) return res.status(400).json(userData);
    if (userData.length === 0)
      return res.status(400).json(`Este usuario no valido o esta desactivado.`);

    if (!bcrypt.compareSync(password, userData[0].password))
      return res.status(400).json(`Contraseña incorrecta.`);
    let user = {
      user_id: userData[0].user_id,
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
});

router.post("/register", async (req, res) => {
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
  //   const { error } = await registerValidation(req.body);
  //   if (error) return res.status(400).json(error.details[0].message);
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
    if (!query) return res.status(400).json(query);
    console.log("registrando usuario ...");
    res.status(201).json("Usuario creado exitosamente.");
  } catch (err) {
    res.status(400).json(`error: ${err}`);
  }
});

router.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.status(401).json("No esta autorizado");

  try {
    const verifingRefreshToken = await verifyRefreshTokenDB(refreshToken);
    if (verifingRefreshToken.length === 0)
      return res.status(401).json("No esta autorizado");
    const verifyRFT = verifyRefreshToken(refreshToken);
    if (!verifyRFT) res.status(401).json("No esta autorizado");

    let user = {
      user_id: verifyRFT.user_id,
    };
    const accessToken = generateAccessToken(user);
    res.json({ accessToken: accessToken });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/reset", verify, async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const hashpass = bcrypt.hashSync(password, 10);
    const query = await resetUserPassword(user_id, hashpass);
    if (query) {
      console.log("cambiando contraseña ... ");
      res.status(200).json("Contraseña cambiada con exito.");
    } else {
      res.status(400).json("error");
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/logout", verify, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const query = await deleteRefreshToken(user_id);
    console.log("deslogeando a usuario ...");
    res.status(200).json("refresh token deleted.");
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/user-data", verify, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const query = await getUserData(user_id);
    console.log("entregando data del usuario ...");
    res.status(200).json(query);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/update-data", verify, async (req, res) => {
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
  console.log(req.body);
  try {
    const query = await updateUserDetails(
      name,
      lastname,
      email,
      number,
      id_pais,
      address,
      user_id,
      rol,
    );
    if (query) {
      console.log("actualizando generales de usuario ... ");
      res.status(200).json("Detalles Actualizados.");
    } else {
      res.status(400).json("error");
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/all-users", verify, async (req, res) => {
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
      res.status(200).json(query);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/search", verify, async (req, res) => {
  const text = req.query.text;
  try {
    const query = await getUserBySearch(text);
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/estado-update", verify, async (req, res) => {
  const estado = req.query.estado;
  const user_id = req.query.user_id;
  try {
    const query = await updateUserEstado(user_id, estado);
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/byUserId", verify, async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const query = await getUserData(user_id);
    console.log(`entregando data del usuario ${user_id} ...`);
    res.status(200).json(query);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
