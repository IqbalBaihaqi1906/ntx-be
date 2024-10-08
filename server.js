const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const http = require('http');
const server = http.createServer(app);

const corsOptions = {
  origin: ["http://localhost:8080"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const { callmeWebSocket } = require("./app/controllers/exampleController");

db.sequelize.sync()
  .then(() => console.log('tables created successfully.'))
  .catch(err => console.error('Unable to create table:', err));

// never enable the code below in production
// force: true will drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and Resync Database with { force: true }");
//   // initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

// routes
require("./app/routes/exampleRoutes")(app);
require("./app/routes/userRoutes")(app);
// app.use(router);

callmeWebSocket(server);

// set port, listen for requests
const PORT = process.env.PORT || 7878;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;