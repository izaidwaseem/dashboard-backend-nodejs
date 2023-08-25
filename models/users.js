const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        autoNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        autoNull: false
    },
    email: {
        type: Sequelize.STRING,
        autoNull: false
    },
    password: {
        type: Sequelize.STRING,
        autoNull: false
    }
})

module.exports = User