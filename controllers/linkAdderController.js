const links = require("../models/links.js");

class linkAdderCntroller {
    async linkAdder(req, res) {

        links.create(req.body)

            .then((data) => {

                console.log("kayıt başarılı");
                res.status(200).json(data);


            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }


}

module.exports = new linkAdderCntroller();
