# warehouse-management-system
Express / Rest API/  Sequelize / MySQL

![drawSQL-warehouse-export-2023-05-21 (2)](https://github.com/mohamedelsayed15/warehouse-management-system/assets/105708066/92d2de43-b8d9-478f-88ca-5f06e733a377)

https://documenter.getpostman.com/view/21060881/2s93m32NzK
 multi-warehouse management system

Tech Stack: Node.js, Express.js, Sequelize.js, MySQL, REST API, multer, bcryptjs, express-validator, jsonwebtoken, jsbarcode, canvas.

Functionality :
3 types of users ( top admin, admin, supervisor ),
only the top admin could manage other admins, admins manage supervisors, admins could deactivate a supervisor, admins could add a warehouse, assign supervisors to the warehouse. admins also could add a product and assign it to a specific warehouse. supervisors place orders of products from the warehouse products to increase the stock of the warehouse assigned to them. admins could accept the order or decline it.
admins and supervisors could search products with their id or name, supervisors could only search products that are assigned to the warehouse assigned to them.

product id is based on a UPC format. a product has a photo. when the order gets created and a UPC barcode image gets generated and saved in a file system, so admins and supervisors can retrieve it when needed, a product has an overall quantity in all stocks. and warehouse product has the quantity of the product in warehouse


