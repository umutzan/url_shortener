var sha256 = require("sha256");

const sha256MW = async (req, res, next) => {

    try {
        req.body.password = sha256(req.body.password)

        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = sha256MW;