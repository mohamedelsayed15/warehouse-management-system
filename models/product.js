const { DataTypes } = require('sequelize')
const sequelize = require('../util/mysql')
//=============user model==============
const Product = sequelize.define('product', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        //allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        //allowNull: false,
        defaultValue: 0,
    }
})

module.exports = Product