const jwt = require('jsonwebtoken')
const User = require('../models/users.model')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const {redisSetUser, redisGetUser} =require("../util/redis")
const sequelize = require('../util/mysql')
const WareHouse = require('../models/warehouses.model')
const Product = require('../models/products.model')
const fs = require('fs')
const path = require('path')
const { deleteFile,
    makeDirectory,
    saveProductImage,
    generateUPCImage2 } = require('../util/file')
const { Order } = require('../models/orders.model')
const { Op } = require('sequelize')
const  {upload}  = require('../util/multer')
//const { generateUPCImage, generateUPCImage2 } = require('../util/generateupcimage')

// 1
exports.loginAdmin = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        const user = await User.findOne({
            where: { email: req.body.email },
        })

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

        user.password = ''

        user.tokens.push(token)

        const response = await redisSetUser(user.id, user)

        const redisuser = await redisGetUser(user.id)

        console.log('controller',redisuser)

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
exports.logoutAdmin = async (req, res, next) => {
    try {
        
        // Filter the user's tokens array
        await User.update({
            tokens: sequelize.literal(`JSON_REMOVE(tokens, JSON_UNQUOTE(JSON_SEARCH(tokens, 'one', "${req.token}" )))`)
        },{
            where: { id: req.user.id }
        })

        const index = req.user.tokens.findIndex(token => {
            token === req.token
        })

        req.user.tokens.splice(index, 1)
        
        await redisSetUser(req.user.id, req.user)

        const redisuser = await redisGetUser(req.user.id)

        console.log('controller',redisuser)

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
// 4
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
// 5
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
// 6
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
// 7
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
// 8
exports.assignProductToWarehouse = async (req, res, next) => {
    try {
        const warehouse = await WareHouse.findByPk(req.body.warehouseId)

        const product = await Product.findByPk(req.body.UPC_ID)

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
// 9
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
        const filemimeType = req.file.mimetype.split('/')[1]
        const UPC_ID = req.body.UPC_ID
        const filePath = `images/${UPC_ID}/productImageFs-${UPC_ID}.${filemimeType}`

        // total stock is counted each time the product gets 
        // increased and decreased in a warehouse 

        const product = await Product.create({
            UPC_ID,
            name: req.body.name,
            description : req.body.description,
            image : filePath,
            //stock: by developer
        })
        // await client.connect()
        // const response = await client.set(product.UPC_ID, JSON.stringify(product))
        // const data = await client.get(product.UPC_ID)
        // console.log(JSON.parse(data))
        // console.log(response)
        // const response1 = await client.set(product.UPC_ID, "JSON.stringify(product)")
        // const data1 = await client.get(product.UPC_ID)
        // console.log(data1)
        // await client.disconnect()
        // console.log(response1)
        // //create directory for product 
        // await makeDirectory(product.UPC_ID)
        //generating upc image code path util/generateupcimage
        //save image into the file system

        await Promise.all([
            generateUPCImage2(product.UPC_ID),
            saveProductImage(req.file.buffer,filePath)//
        ])

        res.status(201).send({
            message: "created"
        })
    } catch (e) {
        try {
            const product = await Product.findByPk(req.body.UPC_ID)
            if (product) {
                await product.destroy()
            }
            deleteFile(`images/${product.UPC_ID}/${product.UPC_ID}.png`)
            deleteFile(product.image)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        } catch {
            
        }
    }
}
// 10
exports.editProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const UPC_ID = req.params.UPC_ID

        const product = await Product.findByPk(UPC_ID)

        if (!product) {
            return res.status(404).send({
                error: "couldn't find product"
            })
        }
        console.log()

        if (req.file) {
            // deleting past image
            await deleteFile(product.image)// from file/util
            const filemimeType = req.file.mimetype.split('/')[1]
            const UPC_ID = product.UPC_ID
            const filePath = `images/${UPC_ID}/productImageFs-${UPC_ID}.${filemimeType}`
            product.image = filePath
            await saveProductImage(req.file.buffer,filePath)
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
// 11
exports.serveProductImage = async (req,res,next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        const UPC_ID = req.params.UPC_ID

        const product = await Product.findByPk(UPC_ID, {
            attributes: ['image', 'UPC_ID']
        })

        if (!product) {
            return res.status(404).send({
                error: "couldn't find product"
            })
        }

        const imagePath = product.image

        const image = fs.createReadStream(imagePath,
            { highWaterMark: 6000 })//setting buffer size/

        res.setHeader("Content-Type", "image/png")

        image.on('open', () => {
            image.pipe(res)
        })

        let totalChunk = 0
        image.on('data', (chunk) => {
            let chunkLength = chunk.byteLength
            console.log('Chunk length :', chunkLength)
            totalChunk+= chunkLength
            console.log('Total chunk length :', totalChunk)

        })
        image.on('end', () => {
            res.end()
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
// 12
exports.acceptOrder = async (req,res,next) => {
    try {

        const order = await Order.findByPk(req.params.orderId)

        if(order.accepted === true) {
            return res.status(400).send({
                error: "order is already accepted"
            })
        }

        const [warehouse, orderProducts] = await Promise.all([
                order.getWarehouse(),
                order.getProducts()
            ])

        const UPC_IDs = orderProducts.map((orderProduct) => {
            return orderProduct.UPC_ID
        })

        const products = await warehouse.getProducts({
            where: {
                UPC_ID :UPC_IDs
            },
            limit:UPC_IDs.length
        })

        for (let i = 0; i < products.length; i++){
            products[i].warehouseProduct.quantity += orderProducts[i].orderItem.quantity
            products[i].stock += orderProducts[i].orderItem.quantity
            await Promise.all([
                products[i].warehouseProduct.save(),
                products[i].save()
            ])
        }

        order.accepted = true

        await order.save()

        res.send({ order })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 13
exports.viewOrder = async (req,res,next) => {
    try {

        const order = await Order.findByPk(req.params.orderId)

        if (!order) {
            return res.status(404).json({
                    error: "couldn't find the specified order"
                })
        }

        const orderProducts = await order.getProducts()

        res.send({ order , orderProducts })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 14 
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
// 15
exports.searchProducts = async (req, res, next) => {
    try {
        console.log(req.query)

        const limit = 6

        let page = +req.query.page || 1 // converting to number default value = 1

        if (!Number.isInteger(page)) { page = 1 }

        const offset = (page - 1) * limit;

        const products = await Product.findAndCountAll({
            where: {
                [Op.or]: [
                    { UPC_ID: { [Op.like]: `%${req.query.keyword}%` } },
                    { name: { [Op.like]: `%${req.query.keyword}%` } }
                ]
            },
            offset,
            limit,
        })
        res.send({products})

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 16
exports.ViewPendingOrders = async (req, res, next) => {
    try {

        const limit = 4

        let page = +req.query.page || 1 // converting to number default value = 1

        if (!Number.isInteger(page)) { page = 1 }

        const offset = (page - 1) * limit;

        const orders = await Order.findAndCountAll({
            where: {
                accepted:false
            },
            offset,
            limit,
        })
        res.send({ orders })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
}
// 17
exports.readUPCImage = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }
        //getting product
        const product = await Product.findByPk(req.params.UPC_ID, {
            attributes: ['UPC_ID']
        })

        // validation
        if (!product) {
            return res.status(404).send({
                error : "Couldn't find product"
            })
        }
        //image path
        const upcPath = path.join('images',`${product.UPC_ID}`,`${product.UPC_ID}.png`)
        //read stream
        /*Unlike the 16 KiB default highWaterMark for a <stream.Readable>, 
        the stream returned by this method has a default highWaterMark of 64 KiB. */
        const image = fs.createReadStream(upcPath,
            { highWaterMark: 120000 })//setting buffer size
        
        // set content to png
        res.type('image/png')
        // pipe image
        image.on('open', () => {
            image.pipe(res)
        })
        let totalChunk = 0
        image.on('data', (chunk) => {
            let chunkLength = chunk.byteLength
            console.log('Chunk length :', chunkLength)
            totalChunk+= chunkLength
            console.log('Total chunk length :', totalChunk)

        })
        image.on('end', () => {
            res.end()
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
