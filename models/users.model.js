const {DataTypes} = require('sequelize')
const sequelize = require('../util/mysql')
const bcrypt = require('bcryptjs')
//==========user model==============
const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull:false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull:false,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min:8
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    type: {
        type: DataTypes.ENUM('admin', 'supervisor'),
        allowNull:false
    },
    tokens: {
        type: DataTypes.JSON,
        defaultValue:[]
    }
},{
    indexes: [{
        unique: true,
        fields: ['email']
    }]
})

User.beforeSave(async (user) => {
    if (user.changed('password')) {

        user.password = await bcrypt.hash(user.password, 8)

    }
})

module.exports = User