const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");

//Middlewares
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(helmet());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);
app.use(express.json({ limit: "5mb" }));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cors());
app.use(compression());

// importando rutas
const auth = require("./routes/auth/auth");
const pais = require("./routes/pais/pais");
const pedidos = require("./routes/pedidos/pedidos");
const ordenes = require("./routes/ordenes/ordenes");
const proveedores = require("./routes/proveedores/proveedores");
const status = require("./routes/status/status");
const tipoPago = require("./routes/tipoPago/tipoPago");
const reportes = require("./routes/reportes/reportes");
const clientes = require("./routes/clientes/clientes");
// rutas
app.use("/v1/auth", auth);
app.use("/v1/pais", pais);
app.use("/v1/pedidos", pedidos);
app.use("/v1/ordenes", ordenes);
app.use("/v1/proveedores", proveedores);
app.use("/v1/status", status);
app.use("/v1/tipoPago", tipoPago);
app.use("/v1/reportes", reportes);
app.use("/v1/clientes", clientes);

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`servidor escuchando: localhost:${port}`);
});
