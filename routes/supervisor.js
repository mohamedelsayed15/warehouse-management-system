const express = require('express')
const router = express.Router()
const supervisorController = require('../controllers/supervisor')
const { validateLogin,
    validateIdInParam,
} = require('../validation/validators')
const { supervisorAuth } = require('../middleware/auth')
/* note each point is numbered to meet its corresponding in the controller */
//login supervisor
router.post( // 1
    '/login-supervisor',
    validateLogin,
    supervisorController.loginSupervisor)
// logout supervisor
router.get( // 2
    '/logout-supervisor',
    validateLogin,
    supervisorController.logoutSupervisor)
//create order first approach
router.post( // 3
    '/create-order-1',
    supervisorAuth,
    supervisorController.createOrder)
//add to order first approach
router.post( // 4
    '/add-to-order-1/:id',
    supervisorAuth,
    supervisorController.addToOrder)
//remove item from order
router.post( // 5
    '/remove-from-order-1/:id',
    supervisorAuth,
    supervisorController.removeFromOrder)

router.get( // 6
    '/get-my-orders',
    supervisorAuth,
    supervisorController.getMyOrders)

router.get( // 7
    '/get-warehouse-Products',
    supervisorAuth,
    supervisorController.getWarehouseProducts)

router.get( // 8
    '/search-product-in-warehouse',
    supervisorAuth,
    supervisorController.searchProducts)

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