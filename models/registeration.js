const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const Registeration = sequelize.define('registeration', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        autoNull: false,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        autoNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        autoNull: false
    },
    email: {
        type: Sequelize.STRING,
        autoNull: false
        //unique: true
    },
    CV: {
        type: Sequelize.STRING,
        autoNull: false
    },
    coverLetter: {
        type: Sequelize.STRING,
        autoNull: false
    },
    phone: {
        type: Sequelize.STRING,
        autoNull: false
    },
    CNIC: {
        type: Sequelize.STRING,
        autoNull: false
       // unique: true
    },
    age: {
        type: Sequelize.INTEGER,
        autoNull: false
    },
    gender: {
        type: Sequelize.CHAR,
        autoNull: false
    },
    DOB: {
        type: Sequelize.STRING,
        autoNull: false
    },
    address: {
        type: Sequelize.STRING,
        autoNull: false
    },
    flag: {
        type: Sequelize.STRING,
        autoNull: false
    },
    status: {
        type: Sequelize.STRING,
        autoNull: false
    }
})

module.exports = Registeration