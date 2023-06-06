const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const sequelize = require('../util/mysql')
const Product = require('../models/product')
const { Op } = require('sequelize')
const path = require('path')
const fs = require('fs')
// 1
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
// 2
exports.logoutSupervisor = async (req, res, next) => {
    try {
        // Filter the user's tokens array
        await User.update({
            tokens: sequelize.literal(`JSON_REMOVE(tokens, JSON_UNQUOTE(JSON_SEARCH(tokens, 'one', "${req.token}" )))`)
        },{
            where: { id: req.user.id }
        })

        res.status(200).send({
            message: "logged out"
        })

    }catch(e){
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 3
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
// 4
exports.addToOrder = async (req, res, next) => {
    try {

        // find order first order id comes from params
        const order = await req.user.getOrders({
            where: {
            id: req.params.orderId
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
        const warehouseProduct = await warehouse.getProducts({ where: { UPC_ID: req.body.UPC_ID } })
        if (warehouseProduct.length === 0) {
            return res.status(401).send({
                error:"product isn't assigned to the warehouse"
            })
        }

        // find the product if its in the order list of orderItems
        let orderItem = await order[0].getProducts({ where: { UPC_ID: req.body.UPC_ID } })

        // if we find the product we replace its quantity with the coming request quantity
        if (orderItem.length > 0) {

            orderItem[0].orderItem.quantity = req.body.quantity
            orderItem = await orderItem[0].orderItem.save()

        } else {
            // else we add the product to to the orderItems list
            const product = await Product.findByPk(req.body.UPC_ID)

            if (!product) {
                return res.status(404).send({
                    error: "couldn't find product"
                })
            }

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
// 5
exports.removeFromOrder = async (req, res, next) => {
    try {

        // find order first order id comes from params
        const order = await req.user.getOrders({
            where: {
            id: req.params.orderId
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
        let orderItem = await order[0].getProducts({ where: { UPC_ID: req.body.UPC_ID } })

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
// 6
exports.getMyOrders = async (req, res, next) => {
    try {

        const limit = 5

        let page = +req.query.page || 1 // converting to number default value = 1

        if (!Number.isInteger(page)) { page = 1 }

        const offset = (page - 1) * limit;

        const orders = await req.user.getOrders({
            limit,
            offset
        })

        res.send({ orders })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 7
exports.getWarehouseProducts = async (req, res, next) => {
    try {

        const limit = 5

        let page = +req.query.page || 1 // converting to number default value = 1

        if (!Number.isInteger(page)) { page = 1 }

        const offset = (page - 1) * limit;

        const warehouse = await req.user.getWarehouse()

        const warehouseProducts = await warehouse.getProducts({
            limit,
            offset
        })

        res.send({ warehouseProducts })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 8
exports.searchProducts = async (req, res, next) => {
    try {

        const limit = 6

        let page = +req.query.page || 1 // converting to number default value = 1

        if (!Number.isInteger(page)) { page = 1 }

        const offset = (page - 1) * limit;

        //search in products that are only assigned to the warehouse

        //first approach
        // const products = await Product.findAndCountAll({
        //     where: {
        //         [Op.or]: [
        //             { UPC_ID: { [Op.like]: `%${req.query.keyword}%` } },
        //             { name: { [Op.like]: `%${req.query.keyword}%` } }
        //         ]
        //     },
        //     offset,
        //     limit,
        //     include: [
        //     {
        //         model: Warehouse,
        //         where: { id: req.user.warehouseId }
        //     }
        //     ],
        // })
        // res.send({products})

        //second approach
        const warehouse = await req.user.getWarehouse()
        const [count, products] = await Promise.all([
            warehouse.countProducts(),
            warehouse.getProducts({
                where: {
                    [Op.or]: [
                        { UPC_ID: { [Op.like]: `%${req.query.keyword}%` } },
                        { name: { [Op.like]: `%${req.query.keyword}%` } }
                    ]
                },
                offset,
                limit,
            }),
        ])

        res.send({ count,products })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 9
exports.readUPCImage = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const warehouse = await req.user.getWarehouse()

        const product = await warehouse.getProducts({
            where: {
            UPC_ID:req.params.UPC_ID
            }
        })

        if (!product[0]) {
            return res.status(404).send({
                error : "Couldn't find product"
            })
        }

        //image path
        const upcPath = path.join('images',`${product[0].UPC_ID}`,`${product[0].UPC_ID}.png`)
        //read stream
        const image = fs.createReadStream(upcPath,
            { highWaterMark: 10000000 })//setting buffer size
        
        // set content to png
        res.type('image/png')
        // pipe image
        image.on('open', () => {
            image.pipe(res)
        })
        //error handling
        image.on('error', function (error) {
            return next(error)
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 10
exports.serveProductImage = async (req,res,next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const warehouse = await req.user.getWarehouse()

        const product = await warehouse.getProducts({
            where: {
            UPC_ID:req.params.UPC_ID
            }
        })

        if (!product[0]) {
            return res.status(404).send({
                error : "Couldn't find product"
            })
        }

        const imagePath = product[0].image

        const image = fs.createReadStream(imagePath,
            { highWaterMark: 10000000 })//setting buffer size

        res.setHeader("Content-Type", "image/jpeg")

        image.on('open', () => {
            image.pipe(res)
        })
        image.on('error', function (error) {
            return next(error)
        })
    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}