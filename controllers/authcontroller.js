const crypto = require("crypto")

const {validationResult} = require("express-validator")

const bcrypt = require('bcrypt');

const nodemailer=require("nodemailer")

var User=require('../Schemamodules/usermod')

const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth: {
        user: 'xxxxx@gmail.com',
        pass: 'xxxxxxxx'
    }
});

exports.getlogin = (req, res, next) => {
    let message=req.flash('error')
    if(message.length>0)
    {
        message=message[0]
    }
    else{
        message=null
    }
    let messages=req.flash('success')
    if(messages.length>0)
    {
        messages=messages[0]
    }
    else{
        messages=null
    }
    res.render("loginform.ejs", {message:message, email:"", messages:messages, validationErrors:[]})
}

exports.getsignup = (req, res, next) => {
    let message=req.flash('error')
    if(message.length >0)
    {
        message=message[0]
    }
    else{
        message=null
    }
    res.render("signupform.ejs", {message:message, email:"", validationErrors: []})
}

exports.postlogin = (req, res, next) => {
    const email = req.body.email
    const errors=validationResult(req)
    const password = req.body.password

    if(!errors.isEmpty())
    {
        console.log(errors.array())
        return res.status(422).render("loginform.ejs", {messages:'', email:email, message:errors.array()[0].msg, validationErrors:errors.array()})
    }

    User.findOne({email:email})
    .then(user => 
        {
            if(!user)
            {
               return res.status(422).render("loginform.ejs", {messages:'', email:email, message:'Email Id or Password is incorrect or does not exist', validationErrors:errors.array()})
            }

    bcrypt.compare(password, user.password).then(domatch =>
        {
            if(domatch)
            {
                 req.session.loggedin = true;
                req.session.user=user;
                return req.session.save(err =>{  
                    if(err)
                    {
                        console.log(err)
                    }    //if the match is correct, the function will return the session
                    req.flash('success', 'Succesfully Logged in')
                    res.redirect("/products")
                })
            }
            else{
                return res.status(422).render("loginform.ejs", {messages:'', email:email, message:'Incorrect Password! Please Check Again', validationErrors:errors.array()})
                }
        }).catch(err =>
            {
                const error = new Error(err)
                error.httpStatusCode = 500;
                return next(error)

            })
}).catch(err =>
    {
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.postsignup = (req, res, next) => {
    const email=req.body.email
    const username=req.body.username
    const errors=validationResult(req)
    const password=req.body.password
    const confirmpassword=req.body.confirmpassword

    //add a confrim password if you would like
    if(!errors.isEmpty())
    {
        console.log(errors.array())
        return res.status(422).render("signupform.ejs", {message:errors.array()[0].msg, email:email, validationErrors:errors.array()}
        )
    }

        bcrypt.hash(password, 11).then(hashedpassword =>
            {
                
        newuser= {email:email, username:username, password:hashedpassword, cart: { items: [] }}
        User.create(newuser, function(err, newus)
        {
            if(err)
            {
                console.log(err)
                res.redirect("/signup")
            }
            else{
                req.flash('success', 'User Registered! Please Login to Continue')
                res.redirect("/login")
                return transporter.sendMail({
                    from: 'jaswa5237@gmail.com',
                    to: email,
                    subject:"Sign up Succesfull for Swingo",
                    text:"Now, Enjoy shopping online at the lowest prices!",
                    html: `<b><h1>Enjoy Shopping on Swingo</h1></b>
                            <h3>Now, Enjoy shopping online at the lowest prices!</h3>`
                }).catch(err =>
                    {
                        const error = new Error(err)
                        error.httpStatusCode = 500;
                        return next(error)
                    })
            }
        })
    })
}

exports.getlogout = (req, res, next) =>
{
    req.flash('success', 'Succesfully Logged Out! Please Come Bcak Soon')
    
    req.session.destroy(err =>
        {
            if(err)
            {
                console.log("Unable to distroy the session !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            }
            else{

                
                res.redirect("/")
            }
        })
}

exports.getresetpassword = (req, res, next) =>
{
    let message=req.flash('error')
    if(message.length >0)
    {
        message=message[0]
    }
    else{
        message=null
    }

    res.render("reset-password_email.ejs", {message:message})
}

exports.postresetpassword = (req, res, next) =>
{
    crypto.randomBytes(32, (err, buffer) =>
    {
        if(err)
        {
            console.log(err)
            req.flash('error', 'Something is worng! Please Try again')
            res.redirect("/reset-password")
        }
        const token=buffer.toString('hex')

        const emailid=req.body.email

        User.findOne({email:emailid}).then(user =>
            {
                if (!user) {

                    req.flash('error', 'No account with that email found.');

                    return res.redirect('/reset');

                  }

                user.ResetToken=token

                user.Tokenlife= Date.now() + 3600000
                return user.save() 

            }).then((result)=>
            {
                req.flash('success', 'Please Check your Mail to receive the password reset link')
                res.redirect('/')
                transporter.sendMail({
                    from: 'jaswa5237@gmail.com',
                    to: emailid,
                    subject:"Password Reset Requested From Swingo!",
                    text:"You have recently made a Password Reset Request on Swingo! If this is not you, please secure your account!",
                    html: `<b><h1>Swingo! Click on te below link to reset your password</h1></b>
                          <a href = "http://localhost:3000/reset-password/${token}"> Reset Pasword </a>
                          `
                }).catch(err =>
                    {
                        const error = new Error(err)
                        error.httpStatusCode = 500;
                        return next(error)
                    })
            })
    })
}

exports.getnewpassword = (req, res, next) =>
{
    const token = req.params.token
    User.findOne({ResetToken:token, Tokenlife:{$gt: Date.now()}}).then(user =>
        {
            let message=req.flash('error')
    if(message.length >0)
    {
        message=message[0]
    }
    else
    {
        message=null
    }    res.render("new-password.ejs", {userId:user._id.toString(), passwordtoken:token})
    }).catch(err =>
        {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })
}

exports.postnewpassword = (req, res, next) =>
{
    const passwordtoken= req.body.passwordtoken
    const userId=req.body.userId
    const newpassword=req.body.password
    let resetuser
    User.findOne({ResetToken:passwordtoken, Tokenlife:{$gt: Date.now()}, _id:userId}).then(user =>
        {
            resetuser=user
           return bcrypt.hash(newpassword, 11).then(passcode =>
                {
                    resetuser.password=passcode
                    resetuser.ResetToken=undefined
                    resetuser.Tokenlife=undefined
                    return user.save()
                }).then(result =>
                    {
                        console.log(result)
                        req.flash('success', 'Password changed successfully! Please Login to Continue')
                        res.redirect("/login")
                    })
                    .catch(err => {
                        const error = new Error(err)
                        error.httpStatusCode = 500;
                        return next(error)
                    })
        })
}
