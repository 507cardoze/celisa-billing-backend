const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

//Middlewares
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// importando rutas
const auth = require('./routes/auth/auth');
const pais = require('./routes/pais/pais');
const pedidos = require('./routes/pedidos/pedidos');
const ordenes = require('./routes/ordenes/ordenes');
const proveedores = require('./routes/proveedores/proveedores');
const status = require('./routes/status/status');
// rutas
app.use('/v1/auth', auth);
app.use('/v1/pais', pais);
app.use('/v1/pedidos', pedidos);
app.use('/v1/ordenes', ordenes);
app.use('/v1/proveedores', proveedores);
app.use('/v1/status', status);

app.listen(process.env.PORT, () =>
	console.log(`server running on localhost:${process.env.PORT}`),
);
