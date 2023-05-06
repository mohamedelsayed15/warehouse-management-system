const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const sequelize = require('../util/mysql')
const WareHouse = require('../models/WarehouseProduct')
exports.loginSupervisor = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const user = await User.findOne({ where: { email: req.body.email } })

        if (!user) {
            return res.status(404).send({
                error: "couldn't find a user"
            })
        }
        if (user.active === false) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (match === false) {
            return res.status(404).send({
                error: "couldn't find a user"
            })
        }

        const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        
        await User.update(
            {
                tokens: sequelize.literal(`JSON_ARRAY_APPEND(tokens, '$', "${token}")`)
            },
            {
                where: { id: user.id }
            }
        );

        user.password = ""
        user.tokens = []

        res.status(200).send({ user, token })

    }catch(e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.requestToAddToWarehouse = async (req, res, next) => {
    try {
        //const warehouse = await req.user.getWarehouses()

        //console.log(req.user)

        const warehouse = await WareHouse.findByPk(req.user.warehouseId)

        //console.log(warehouse)

        console.log(await req.user.getWarehouse())

        //const users = await warehouse.getUser()

        res.send()

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        console.log(req.user)

        const order = await req.user.createOrder()

        console.log(order.toJSON())

        res.status(201).send({
            order: order
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

