const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/databese_connection");

class Links extends Model { }

Links.init(
  {
    link: {
      type: String,
      unique: true,
    },
    url: {
      type: String,
    },
  },
  {
    sequelize,
    moduleName: "links",
  }
);

module.exports = Links;
