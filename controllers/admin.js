const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const sequelize = require('../util/mysql')
const WareHouse = require('../models/warehouse')
const Product = require('../models/product')
const fs = require('fs')
const path = require('path')
const { deleteFile }= require('../util/file')
const WarehouseProduct = require('../models/WarehouseProduct')

exports.loginAdmin = async (req, res, next) => {
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

        // mysql query to manipulate json data
        // append to tokens array in user
        await User.update({
                tokens: sequelize.literal(`JSON_ARRAY_APPEND(tokens, '$', "${token}")`)
            },{
                where: { id: user.id }
            })

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

exports.logoutAdmin = async (req, res, next) => {
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

exports.createSupervisorForWarehouse = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const warehouseId = req.params.warehouseId

        const warehouse = await WareHouse.findByPk(warehouseId)

        if (!warehouse) {
            return res.status(404).send({
                error: "couldn't find warehouse"
            })
        }

        const supervisor = await warehouse.createUser({
            email: req.body.email,
            password: req.body.password,
            type: "supervisor"
        })

        res.status(201).send({
            message: "created"
        })

    } catch(e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.createAdmin = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        //only one admin can add another admin
        if (req.user.email !== process.env.TOP_ADMIN_EMAIL) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        await User.create({
            email: req.body.email,
            password: req.body.password,
            type: "admin"
        })

        res.status(201).send({
            message: "created"
        })
    } catch(e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.deactivateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const user = await User.findByPk(req.params.id)

        if (!user) {
            return res.status(404).send({
                error: "couldn't find user"
            })
        }

        //top admin may only deactivate or activate an account if its type is admin
        if (user.type === "admin" && req.user.email !== process.env.TOP_ADMIN_EMAIL) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //prevent deactivation of top admin
        if (user.email === process.env.TOP_ADMIN_EMAIL) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        user.active = false
        //logging out all tokens
        user.tokens = []

        await user.save()

        res.status(200).send({
            message: "deactivated user"
        })
    } catch(e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.activateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const user = await User.findByPk(req.params.id)

        if (!user) {
            return res.status(404).send({
                error: "couldn't find user"
            })
        }

        //top admin may only deactivate or activate an account if its type is admin
        if (user.type === "admin" && req.user.email !== process.env.TOP_ADMIN_EMAIL) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        user.active = true

        await user.save()

        res.status(200).send({
            message: "activated user"
        })

    } catch(e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.createWarehouse = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const warehouse = await WareHouse.create({
            name: req.body.name,
            location: req.body.location,
        })

        res.status(201).send({
            message: "created"
        })
    }catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
exports.assignProductToWarehouse = async (req, res, next) => {
    try {
        const warehouse = await WareHouse.findByPk(req.body.warehouseId)

        const product = await Product.findByPk(req.body.productId)

        const warehouseProduct = await warehouse.addProduct(product)

        res.send({
            warehouseProduct
        })

    }catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}

exports.addProduct = async (req,res,next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        if (!req.file) {
            res.status(422).send({
                error : "couldn't receive your image"
            })
        }
        // total stock is counted each time the product gets 
        // increased and decreased in a warehouse 
        const product = await Product.create({
            name: req.body.name,
            description : req.body.description,
            image : req.file.path,
            //stock: by developer
        })
        res.status(201).send({
            message: "created"
        })
    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
exports.editProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const productId = req.params.productId

        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).send({
                error: "couldn't find product"
            })
        }
        if (req.file) {
            // deleting past image
            deleteFile(path.join(__dirname,product.image))// from file/util
            product.image = req.file.path
        }
        if (req.body.name) {
            product.name = req.body.name
        }
        if (req.body.description) {
            product.description = req.body.description
        }

        await product.save()

        res.send({
            message : "altered"
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
exports.serveProductImage = async (req,res,next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const productId = req.params.productId
        
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).send({
                error: "couldn't find product"
            })
        }

        const imagePath = product.image

        const image = fs.createReadStream(imagePath)

        image.on('error', function (error) {
            return next(error)
        })

        res.setHeader("Content-Type", "image/png")
        
        image.pipe(res)

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}