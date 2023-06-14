const jwt = require('jsonwebtoken')
const User = require('../models/users.model')

// custom function turning verify callback into promise
const jwtVerify = (headerToken) => {
    // trimming is faster than .replace('Bearer ','')
    // because replace will search for the substring and then remove it
    // we are sure that header contains 'Bearer '
    // because we validate in the middleware with .startsWith('Bearer ')
    // still faster than .replace() because we letting search to know
    // that it is in the first
    // trimming first 7 characters since we know it starts with 'Bearer '
    
    return new Promise((resolve, reject) => {
        jwt.verify(
            headerToken,
            process.env.JWT_SECRET,
            //callback
            (err, decoded) => {
                if (err) {
                    return reject(err)
                }
                resolve(decoded)
            })
        })
    }

exports.adminAuth = async (req, res, next) => {
    try {
        let headerToken = req.header('Authorization')

        if (!headerToken || !headerToken.startsWith('Bearer ')){
            return res.status(422).send({
                error:"the request is missing bearer token"
            })
        }
        headerToken = headerToken.substring(7)
        //custom function (promise) also trims 'Bearer '
        const decoded = await jwtVerify(headerToken)
        if (!decoded) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        const user = await User.findByPk(decoded.id,{
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        }) 
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
        let headerToken = req.header('Authorization')

        if (!headerToken || !headerToken.startsWith('Bearer ')){
            return res.status(422).send({
                error:"the request is missing bearer token"
            })
        } 
        headerToken = headerToken.substring(7)
        //custom function (promise) also trims 'Bearer '
        const decoded = await jwtVerify(headerToken)

        if (!decoded) {
            return res.status(401).send({
                error:"unauthorized"
            })
        }

        const user = await User.findByPk(decoded.id,{
            attributes: { exclude: ['password','email', 'createdAt', 'updatedAt'] },
        }) 
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
