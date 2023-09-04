const links = require("../models/links.js");

class linkController {
    async link(req, res) {

        const id = req.params.id;
        await links.findOne({ where: { link: id } }).then((data) => {
            if (data == null) {
                res.status(500).send("31");

            } else {
                res.redirect(data.url);
            }
        })
    }


}

module.exports = new linkController();
