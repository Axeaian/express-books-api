const express = require("express");
const logger = require("morgan");

const index = require("./routes/index");
const books = require("./routes/books");

const app = express();

app.use(logger("dev"));
app.use(express.json());

app.use("/", index);
app.use("/books", books);

module.exports = app;
