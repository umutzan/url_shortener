const express = require("express");
const linkAdderC = require("../controllers/linkController")

const pageController = require("../controllers/pageController")

const pagesRouter = express.Router();

pagesRouter.route("/").get(pageController.index);
pagesRouter.route("/:id").get(linkAdderC.link);


module.exports = pagesRouter;