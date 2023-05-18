const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const sequelize = require('../util/mysql')
const WareHouse = require('../models/WarehouseProduct')
const Product = require('../models/product')
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

exports.createOrder = async (req, res, next) => {
    try {
        // initiate order
        const order = await req.user.createOrder({ warehouseId: req.user.warehouseId })

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

exports.addToOrder = async (req, res, next) => {
    try {

        // find order first order id comes from params
        const order = await req.user.getOrders({
            where: {
            id: req.params.id
            }
        })

        const warehouse = await req.user.getWarehouse()

        if (order.length === 0) {
            return res.status(404).send({
                error:"Couldn't find Order"
            })
        }
        // once order accepted by an admin supervisor cant add to it 
        if (order[0].accepted !== false) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        // warehouse validation check if product is assigned to warehouse
        const warehouseProduct = await warehouse.getProducts({ where: { id: req.body.productId } })
        if (warehouseProduct.length === 0) {
            return res.status(401).send({
                error:"product isn't assigned to the warehouse"
            })
        }

        console.log(warehouseProduct[0].toJSON())

        // find the product if its in the order list of orderItems
        let orderItem = await order[0].getProducts({ where: { id: req.body.productId } })

        // if we find the product we replace its quantity with the coming request quantity
        if (orderItem.length > 0) {

            orderItem[0].orderItem.quantity = req.body.quantity
            orderItem = await orderItem[0].orderItem.save()

        } else {
            // else we add the product to to the orderItems list
            const product = await Product.findByPk(req.body.productId)
            if(!product){return res.status(404).send({error:"couldn't find product"})}
            orderItem = await order[0].addProduct(warehouseProduct, {
                through: {
                quantity: req.body.quantity
                }
            })
        }

        res.status(201).send({
            orderItem
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
exports.removeFromOrder = async (req, res, next) => {
    try {

        // find order first order id comes from params
        const order = await req.user.getOrders({
            where: {
            id: req.params.id
            }
        })

        if (order.length === 0) {
            return res.status(404).send({
                error:"Couldn't find Order"
            })
        }
        // once order accepted by an admin supervisor cant add to it 
        if (order[0].accepted !== false) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }


        // find the product if its in the order list of orderItems
        let orderItem = await order[0].getProducts({ where: { id: req.body.productId } })

        if (orderItem.length === 0) {
            return res.status(404).send({
                error: "couldn't find product in order list"
            })
        }

        // if we find the product
        if (orderItem.length > 0) {

            orderItem = await orderItem[0].orderItem.destroy()

        }

        res.status(200).send({
            orderItem
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}