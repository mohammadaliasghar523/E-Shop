const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv/config");
app.use(cors());
app.options("*", cors());

const port = process.env.SERVER_PORT;
const api_url = process.env.API_URL;

const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use(`/public/uploads`, express.static(__dirname + `/public/uploads`));

//Routers
app.use(`${api_url}/products`, productsRouter);
app.use(`${api_url}/categories`, categoriesRouter);
app.use(`${api_url}/orders`, ordersRouter);
app.use(`${api_url}/users`, usersRouter);

//Connection
mongoose.set("strictQuery", true);
console.log(process.env.CONNECTION_STRING);
mongoose
	.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		dbName: "E-shop",
	})
	.then(() => {
		console.log("Database Connected");
	})
	.catch((err) => {
		console.log(err);
	});

app.listen(port, () => {
	console.log("Server is Running on PORT", port);
});
