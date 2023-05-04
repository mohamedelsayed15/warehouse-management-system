const express = require('express')
//================ DB connection ==============
const sequelize = require('./util/mysql')
const Sequelize = require('sequelize')
//=============== Calling Routes ==============
const adminRoutes = require('./routes/admin')
const supervisorRoutes = require('./routes/supervisor')
//============== Calling Models ===============
const User = require('./models/user')
const WareHouse = require('./models/warehouse')
const Product = require('./models/product')
//========== Express ============
const app = express()
//========== Parsers ============
app.use(express.json({ limit: "3kb" })); //parser//json data size limitation
//========== Routes =============

app.use('/admin',adminRoutes)
//app.use('/supervisor', supervisorRoutes)

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

//===============  Sync DB  ==============
const jwt = require('jsonwebtoken')
sequelize.sync()//{force : true}//during development only
    .then(async () => {
        // const user = await User.create({
        //     email: process.env.TOP_ADMIN_EMAIL,
        //     password: "123456789",
        //     type:"admin"
        // })
        const user = await User.findOne({ where: { email: process.env.TOP_ADMIN_EMAIL } })
        user.tokens = []
        await user.save()
        const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET)

        // // Add an email address to the user's tokens array
        await User.update(
        {
            tokens: sequelize.literal(`JSON_ARRAY_APPEND(tokens, '$', "${token}")`)
        },
        {
            where: { id: 1 }
        }
        );

        // // Filter the user's tokens array
        // await User.update(
        // {
        //     tokens: sequelize.literal(`JSON_REMOVE(tokens, JSON_UNQUOTE(JSON_SEARCH(tokens, 'one', "${token}" )))`)
        // },
        // {
        //     where: { id: 1 }
        // }
        // );
        
        console.log(token)
    }).catch((err) => {
        console.log(err)
    })

//=================== listener ======================
app.listen(process.env.PORT, () => { 
    console.log(`server is up on 3000`)
})