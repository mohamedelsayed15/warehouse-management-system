const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const sequelize = require('../util/mysql')
exports.createSupervisor = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(422).send({
                validationError: errors
            })
        }

        await User.create({
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