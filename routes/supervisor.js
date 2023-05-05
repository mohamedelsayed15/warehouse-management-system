const express = require('express')
const router = express.Router()

const supervisorController = require('../controllers/supervisor')
const { validateLogin,
    validateIdInParam,
} = require('../validation/validators')

//login supervisor
router.post('/login-supervisor', validateLogin, supervisorController.loginSupervisor)

module.exports = router