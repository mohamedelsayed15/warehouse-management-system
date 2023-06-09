const { DataTypes } = require('sequelize')
const sequelize = require('../util/mysql')
//=============user model==============
const Product = sequelize.define('product', {
    UPC_ID: {// note that product id is better to be a number 
            //  as cpu compare numbers faster than strings
        type: DataTypes.STRING,
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
},{
    indexes: [{
        unique: false,
        fields: ['name']
    }]
})

module.exports = Product