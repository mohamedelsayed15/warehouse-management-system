const express = require('express')
//================ DB connection ==============
const sequelize = require('./util/mysql')
//=============== Calling Routes ==============
const adminRoutes = require('./routes/admin')
const supervisorRoutes = require('./routes/supervisor')
//============== Calling Models ===============
const User = require('./models/user')
const WareHouse = require('./models/warehouse')
const Product = require('./models/product')
const WarehouseProduct = require('./models/WarehouseProduct')
const { Order, OrderItem } = require('./models/orders')
//========== Express ============
const app = express()
//========== Parsers ============
app.use(express.json({ limit: "3kb" })); //parser//json data size limitation
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
// one to many relation between user(supervisor) and warehouse
// a warehouse can be assigned to more than one user
// a user can only be assigned to one warehouse
User.belongsTo(WareHouse, { constraints: true, onDelete: 'CASCADE' })
WareHouse.hasMany(User)
// many to many relation between warehouse and product
// a product can be in many warehouses through WarehouseProduct(quantity)
// a warehouse has more than a one product
// we perform N:M relation between both entities in 2 different ways 
// so we have a full access to all sequelize queries
//first approach
WareHouse.hasMany(WarehouseProduct)
WarehouseProduct.belongsTo(WareHouse)
Product.hasMany(WarehouseProduct)
WarehouseProduct.belongsTo(Product)
//second approach
WareHouse.belongsToMany(Product, { through: WarehouseProduct })
Product.belongsToMany(WareHouse, { through: WarehouseProduct })
// we get full access to 
// User.findAll({ include: Profile }); Many-to-Many
// Profile.findAll({ include: User }); Many-to-Many
// User.findAll({ include: Grant }); double One-to-Man
// Profile.findAll({ include: Grant }); double One-to-Man
// Grant.findAll({ include: User }); double One-to-Man
// Grant.findAll({ include: Profile }); double One-to-Man
// orders to be approved
// //first approach
// User.hasMany(Order)
// Order.belongsTo(User)
// Product.hasMany(Order)
// Order.belongsTo(Product)
// //second approach
User.belongsToMany(Order, { through: OrderItem })
Order.belongsToMany(User, { through: OrderItem })
Order.belongsTo(User,{ constraints: true, onDelete: 'CASCADE' })
User.hasMany(Order)
// User.hasMany(OrderItem)
// OrderItem.belongsTo(User)
// Order.hasMany(OrderItem)
// OrderItem.belongsTo(Order,{ constraints: true, onDelete: 'CASCADE' })
// Product.belongsToMany(Order, { through: OrderItem })
// Order.belongsToMany(Product, { through: OrderItem })
// Product.hasMany(OrderItem)
// OrderItem.belongsTo(Product,{ constraints: true, onDelete: 'CASCADE' })
// Order.hasMany(OrderItem)
// OrderItem.belongsTo(Order,{ constraints: true, onDelete: 'CASCADE' })
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Order)
//Many to Many M:N we resolve many to many by a third table
Order.belongsToMany(Product, { through: OrderItem })// this can be a custom table or a sequelize
Product.belongsToMany(Order, { through: OrderItem })// made table by inputting text instead of table
OrderItem.belongsTo(Order, { constraints: true, onDelete: 'CASCADE' })
Order.hasMany(OrderItem)
OrderItem.belongsTo(Product, { constraints: true, onDelete: 'CASCADE' })
//===============  Sync DB  ============== 
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
    }).catch((err) => {
        console.log(err)
    })

//=================== listener ======================
app.listen(process.env.PORT, () => { 
    console.log(`server is up on 3000`)
})