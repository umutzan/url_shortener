const express = require("express");
const cors = require("cors");
const database = require("./database/databese_connection");
const apiRouter = require("./routes/apiRouter.js");
const shorLink = require("./routes/shorLink.js");
const pagesRouter = require("./routes/pagesRouter");

const app = express();

database.sync().then((result) => {
    app.use(cors());
    app.use(express.json());
    app.use("/api", apiRouter);
    app.use("/", shorLink);
    app.use("/admin", pagesRouter);

    app.listen(80, () => {
        console.log("listening port 80");
    });

}).catch((err) => {
    console.log(err);

});
