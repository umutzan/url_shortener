const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/databese_connection");

class Links extends Model { }

Links.init(
  {
    usersID: {
      type: String,
    },
    linkID: {
      type: String,
      unique: true,
    },
    link: {
      type: String,
    },
  },
  {
    sequelize,
    moduleName: "links",
  }
);

module.exports = Links;
