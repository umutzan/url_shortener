const express = require("express");
const linkAdderC = require("../controllers/linkController")

const pageController = require("../controllers/pageController")

const pagesRouter = express.Router();

pagesRouter.route("/").get(pageController.index); //it's main page
pagesRouter.route("/:id").get(linkAdderC.link);  //it's the router


module.exports = pagesRouter;