const { DataTypes } = require('sequelize')
const sequelize = require('../util/mysql')
//=============order model==============
const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

const OrderItem = sequelize.define('orderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})


module.exports = { Order, OrderItem }