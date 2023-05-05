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
//========== Express ============
const app = express()
//========== Parsers ============
app.use(express.json({ limit: "3kb" })); //parser//json data size limitation
//========== Routes =============

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
//===============  Sync DB  ============== 
sequelize.sync()//{force : true}//during development only
    .then(async () => {
        // const user = await User.create({
        //     email: process.env.TOP_ADMIN_EMAIL,
        //     password: "123456789",
        //     type:"admin"
        // })
    }).catch((err) => {
        console.log(err)
    })

//=================== listener ======================
app.listen(process.env.PORT, () => { 
    console.log(`server is up on 3000`)
})