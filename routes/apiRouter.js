const express = require("express");
const linkMW = require("../middlewares/linkMidelware.js")
const linkAdderC = require("../controllers/linkAdderController.js")

const apiRouter = express.Router();


apiRouter.route("/newlink").post(linkMW, linkAdderC.linkAdder);   //new link creator

module.exports = apiRouter;
