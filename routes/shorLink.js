const express = require("express");
const linkAdderC = require("../controllers/linkController")

const shorLink = express.Router();


shorLink.route("/:id").get(linkAdderC.link);

module.exports = shorLink;