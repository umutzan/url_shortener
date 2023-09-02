const User = require("../models/user");
const jwt = require("jsonwebtoken")


const jwtMW = async (req, res, next) => {
    console.log(req.cookies)

    try {
        const token = req.cookies.token;

        if (!token) {
            res.redirect("/admin/login")
            console.log("1")
        } else {
            console.log("2")

            theUser = await User.findByPk(
                jwt.verify(token, "theKey").id
            );
            if (theUser) {
                req.theUserid = jwt.verify(token, "theKey").id
                next();
            } else {
            console.log("3")

                res.redirect("/admin/login")

            }
        }
    } catch (error) {
        console.log(error)
        res.redirect("/admin/login")

    }
}


module.exports = jwtMW;