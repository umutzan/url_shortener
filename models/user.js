const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/databese_connection");

class User extends Model { }

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        mail: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            minLength: [6, "6 karekterden uzun olmalı"],
        },
        preminum: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        moduleName: "user",
    }
);

module.exports = User;
