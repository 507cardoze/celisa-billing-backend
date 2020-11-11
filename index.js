const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

//Middlewares
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// importando rutas
const auth = require("./routes/auth/auth");
const pais = require("./routes/pais/pais");
// rutas
app.use("/v1/auth", auth);
app.use("/v1/pais", pais);

app.listen(process.env.PORT, () =>
  console.log(`server running on localhost:${process.env.PORT}`),
);
