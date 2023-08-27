const express = require("express");
const linkIdMW = require("../middlewares/linkIdMidelware")
const linkAdderC = require("../controllers/linkAdderController")

const pagesRouter = express.Router();


pagesRouter.route("/login").get();
pagesRouter.route("/register").get();
pagesRouter.route("/profile").get();

module.exports = pagesRouter;