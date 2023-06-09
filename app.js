const express = require('express')
const cors = require('cors')
const apicache = require('apicache')
//================ utils connection ==============
const sequelize = require('./util/mysql')
const rateLimit = require('./util/ratelimit')
//=============== Calling Routes ==============
const adminRoutes = require('./routes/admin.route')
const supervisorRoutes = require('./routes/supervisor.route')
//============== Calling Models ===============
const User = require('./models/users.model')
const WareHouse = require('./models/warehouses.model')
const Product = require('./models/products.model')
const WarehouseProduct = require('./models/WarehouseProducts.model')
const { Order, OrderItem } = require('./models/orders.model')
//========== Express ============
const app = express()
//========== Parsers ============
app.use(express.json({ limit: "3kb" })); //parser//json data size limitation
app.use(cors())
app.use(rateLimit)//from util/ratelimit.js
app.set('trust proxy',1)
//==========  Routes ============

app.use('/admin',adminRoutes)
app.use('/supervisor', supervisorRoutes)

app.use('/', (req, res) => {
    res.send("warehouse management system")
})

//error handler
app.use((error, req, res, next) => { 
    try {
        console.log(error)
        res.redirect('/500')
    } catch (e) { 
        console.log(e)
    }
})
//500
app.get('/500', (req, res, next) => { 
    try {

        res.status(500).send({
            error:"internal server error"
        })

    } catch (e) {
        console.log(e)
    }
})
//404
app.use('/*', (req, res, next) => { 
    try {

        res.status(404).send({
            error:"Invalid route"
        })

    } catch (e) {
        console.log(e)
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }
})
//=============== Relations ==============

User.belongsTo(WareHouse, { constraints: true, onDelete: 'CASCADE' })
WareHouse.hasMany(User)
//Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })

// 1 : M relation between user and order
User.hasMany(Order)
Order.belongsTo(User)
// N : M relation between order and product
Order.belongsToMany(Product,  { through: OrderItem })// this can be a custom table or a sequelize
Product.belongsToMany(Order, { through: OrderItem })// made table by inputting text instead of table
// 1 : M relation between order and warehouse
Order.belongsTo(WareHouse)
WareHouse.hasMany(Order)

WareHouse.hasMany(WarehouseProduct)
WarehouseProduct.belongsTo(WareHouse)
Product.hasMany(WarehouseProduct)
WarehouseProduct.belongsTo(Product)
//second approach
WareHouse.belongsToMany(Product, { through: WarehouseProduct })
Product.belongsToMany(WareHouse, { through: WarehouseProduct })

//===============  Sync DB  ============== 
const { client } = require("./util/redis")
client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error(err));
sequelize.sync()//{force : true}//during development only
    .then(async () => {
        // const user = await User.create({
        //     email: process.env.TOP_ADMIN_EMAIL,
        //     password: "123456789",
        //     type:"admin"
        // })
        // const warehouse = await WareHouse.create({
        //     name: "naser city",
        //     location: "naser city, cairo egypt"
        // })
        // const supervisor = warehouse.createUser({
        //     email: "mo.eert21654@gmail.com",
        //     password: "15d198799",
        //     type: "supervisor"
        // })
        // const product = await Product.findByPk(1)
        // const addtoWarehouse = await await warehouse.addProduct(product, { through: { quantity: 1 } })
        //await client.connect()
    }).catch((err) => {
        console.log(err)
    })

//=================== listener ======================
app.listen(process.env.PORT, () => { 
    console.log(`server is up on ${process.env.PORT}`)
})