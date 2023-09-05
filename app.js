const express = require("express");
const cors = require("cors");
const database = require("./database/databese_connection");
const apiRouter = require("./routes/apiRouter.js");
const pagesRouter = require("./routes/pagesRouter");
const cookieParser = require("cookie-parser");

const app = express();

database.sync().then((result) => {
    app.use(cors());
    app.use(express.static("public"));
    app.use(cookieParser());

    app.set("view engine", "ejs");
    app.use(express.json());
    app.use("/api", apiRouter); //api for link creating
    app.use("/", pagesRouter);  //main page

    app.listen(80, () => {
        console.log("listening port 80");
    });

}).catch((err) => {
    console.log(err);

});
