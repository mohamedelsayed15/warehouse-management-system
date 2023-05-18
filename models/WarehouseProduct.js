const { DataTypes } = require('sequelize')
const sequelize = require('../util/mysql')
//=============user model==============
const WarehouseProduct = sequelize.define('warehouseProduct', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
})

module.exports = WarehouseProduct