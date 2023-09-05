const links = require("../models/links");


const linkMW = async (req, res, next) => {


    function randomLinler() {  //this function is creat a nuber between 10000 to 99999
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    try {
        let { link } = req.body;

        let isUnique = false;


        if (link == undefined || link == null || link == "") {

            while (isUnique == false) {
                console.log("aaaaaa")
                let newLink = randomLinler().toString(); //get a nuber form the function

                await links.findOne({ where: { link: newLink } }).then((data) => {
                    if (data == null) {
                        req.body.link = newLink;
                        isUnique = true;
                    }
                });

                next();


            }



        } else {
            let linkCheck = await links.findOne({ where: { link: link } });

            if (linkCheck == null) { //if specefic link is allrady using, the code will throw an error
                next();
            } else {
                res.json({
                    error: "Same link is alrady using"
                });
            }
        }

    } catch (error) {
        res.error(error);
    }


}


module.exports = linkMW;

