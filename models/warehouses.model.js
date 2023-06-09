const { DataTypes } = require('sequelize')
const sequelize = require('../util/mysql')
//=============user model==============
const Warehouse = sequelize.define('warehouse', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
})

module.exports = Warehouse