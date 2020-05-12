var express = require('express')

var router = express.Router()

var bodyparser   =  require("body-parser")

var methodOverride = require("method-override")

var cartcontroller= require("../controllers/cartcontroller")

var middleware= require("../middleware/auth")

router.use(bodyparser.urlencoded({extended: true}));

router.use(methodOverride("_method"))

//routes start here

router.get("/cart",middleware.isloggedin , cartcontroller.getcart)

router.post("/cart", middleware.isloggedin, cartcontroller.postcart)

router.post("/cart_delete_item", middleware.isloggedin,cartcontroller.postdeletcart)

router.post("/cart_clear",middleware.isloggedin, middleware.isthesameuser,cartcontroller.postclearcart)

router.get("/checkout", middleware.isloggedin, cartcontroller.getcheckout)

router.get("/get_orders", middleware.isloggedin, cartcontroller.getorder)

router.get("/checkout/success", middleware.isloggedin, cartcontroller.getcheckoutsuccess)

router.get("/checkout/cancel", middleware.isloggedin, cartcontroller.getcheckout)

router.get("/orders/:orderid", middleware.isloggedin, cartcontroller.getinvoice)

module.exports = router