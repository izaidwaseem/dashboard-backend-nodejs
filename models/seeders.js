const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const seeder = sequelize.define("seeder", {
    index: {
        type: Sequelize.INTEGER,
        autoNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        autoNull: false
    },
    website: {
        type: Sequelize.STRING,
        autoNull: false
    },
    country: {
        type: Sequelize.STRING,
        autoNull: false
    },
    description: {
        type: Sequelize.STRING,
        autoNull: false
    },
    founded: {
        type: Sequelize.STRING,
        autoNull: false
    },
    industry: {
        type: Sequelize.STRING,
        autoNull: false
    },
    num_of_employees: {
        type: Sequelize.STRING,
        autoNull: false
    }
})

module.exports = seeder