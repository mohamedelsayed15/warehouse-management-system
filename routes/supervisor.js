const express = require('express')
const router = express.Router()

const supervisorController = require('../controllers/supervisor')
const { validateLogin,
    validateIdInParam,
} = require('../validation/validators')
const { supervisorAuth } = require('../middleware/auth')

//login supervisor
router.post(
    '/login-supervisor',
    validateLogin,
    supervisorController.loginSupervisor)
//create order first approach
router.post(
    '/create-order-1',
    supervisorAuth,
    supervisorController.createOrder)
//request to make order takes and array of ids [] gets handled from the front end 
/*
[
    {
        itemId: id,
        itemQuantity : quantity
    }
]
*/
// router.post(
//     '/create-order-2',
//     supervisorAuth,
//     supervisorController.createOrder)



module.exports = router