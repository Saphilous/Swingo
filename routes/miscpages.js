var express = require('express')

var router = express.Router()

var bodyparser   =  require("body-parser")

var { check, body } = require("express-validator")

var User= require("../Schemamodules/usermod")

var authcontroller=require("../controllers/authcontroller")

var misccontroller = require("../controllers/misccontrollers")

var middleware= require("../middleware/auth")

router.use(bodyparser.urlencoded({extended: true}));

//home and error routes

router.get("/", misccontroller.gethomepage)

//signup and login routes

router.get("/login",middleware.isnotloggedin, authcontroller.getlogin);

router.post("/login", [check('email').isEmail().withMessage('Enter a Valid Email').isLength({min: 8})], middleware.isnotloggedin,authcontroller.postlogin);

router.get("/signup",middleware.isnotloggedin , authcontroller.getsignup);

router.post("/signup", [check('email').isEmail().withMessage('Enter a Valid Mail Id'), body('password', 'Password must be 8 characters long and should contain only alphabets or numbers').isLength({min:8}).isAlphanumeric(), body('confirmpassword').custom((value, {req})=>
{
    if(value !== req.body.password)
    {
        throw new Error('Password and Confirm Password do not match')
    }
    return true
})], middleware.isnotloggedin, authcontroller.postsignup);

router.get("/logout", middleware.isloggedin ,authcontroller.getlogout);

router.get("/reset-password", authcontroller.getresetpassword)

router.post("/reset-password", authcontroller.postresetpassword)

router.get("/reset-password/:token", authcontroller.getnewpassword)

router.post("/new-password", authcontroller.postnewpassword)

module.exports=router