const jwt = require('jsonwebtoken')
const User = require('../models/users.model')

exports.adminAuth = async (req, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '')

        const decoded = jwt.verify(headerToken, process.env.JWT_SECRET) 

        if (!decoded) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        const user = await User.findByPk(decoded.id) 
        //case there is no user
        if (!user) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case account doesn't have the token
        if (!user.tokens.some(token => token === headerToken)) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case its not an admin
        if (user.type !== 'admin') {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case account is deactivated
        if (user.active !== true) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        req.user = user
        req.token = headerToken

        next()

    } catch (e) {
        console.log(e)
        return res.status(401).send({
            error:"unauthorized"
        })
    }
}

exports.supervisorAuth = async (req, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '')

        const decoded = jwt.verify(headerToken, process.env.JWT_SECRET) 

        if (!decoded) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        const user = await User.findByPk(decoded.id) 
        //case there is no user
        if (!user) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case account doesn't have the token
        if (!user.tokens.some(token => token === headerToken)) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case its not an admin
        if (user.type !== 'supervisor') {
            return res.status(401).send({
                error:"unauthorized"
            })
        }
        //case account is deactivated
        if (user.active !== true) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        req.user = user
        req.token = headerToken

        next()

    } catch (e) {
        console.log(e)
        return res.status(401).send({
            error:"unauthorized"
        })
    }
}


