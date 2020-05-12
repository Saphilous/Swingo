var express = require('express')

var router = express.Router()

var bodyparser   =  require("body-parser")

var {check, body} = require("express-validator")

var methodOverride = require("method-override")

var Product = require('../Schemamodules/productmod')

var productcontroller = require("../controllers/productcontroller")

var middleware= require("../middleware/auth")

router.use(bodyparser.urlencoded({extended: true}));

router.use(methodOverride("_method"))

//code begins here ---------------------------------------------------------------------------------------------------------
router.get("/products" ,productcontroller.getallproducts)

router.post("/products", [check('productname').isLength({min:4}).withMessage('Enter a Title with 12 or more characters'), check('description').isLength({min:24}).withMessage("Enter a description of 24 or more characters"), 
 check('owner').isLength({min:4}, {max:50}).withMessage('Please enter an Owner name between 4 and 50 characters'), check('price').isNumeric().isLength({min:1}).withMessage('Please enter of price of atleast 1 rupee')],middleware.isloggedin ,productcontroller.postproduct)

router.get("/products/new",middleware.isloggedin , productcontroller.getaddproduct)

router.get("/products/:id" ,productcontroller.getoneproducts)

router.get("/products/:id/edit",middleware.isloggedin , middleware.isthesameuser, productcontroller.geteditproduct)

router.put("/products/:id",middleware.isloggedin , middleware.isthesameuser,productcontroller.posteditproduct)

router.delete("/products/:id",middleware.isloggedin , middleware.isthesameuser,productcontroller.getdeleteproduct)

module.exports=router
  