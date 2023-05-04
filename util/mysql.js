const Sequelize = require('sequelize')

//connection
const sequelize = new Sequelize(
    'warehouse',
    'me',
    '621654', {
        dialect: 'mysql',
        host: '127.0.0.1',
        logging: false
    },
)

module.exports = sequelize