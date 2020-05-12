const User = require("../Schemamodules/usermod")
const Product = require("../Schemamodules//productmod")

exports.isloggedin = (req, res, next) =>
{
    if(req.session.user)
    {
        userpresent=true
        next()
    }
    else{
        console.log("must login to do that")
        res.redirect('back')
    }
}

exports.isnotloggedin = (req, res, next) =>
{
    if(req.session.user)
    {
        console.log("You are already logged in")
        res.redirect('back')
    }
    else{
        userabsent=true
        next()
    }
}

exports.isthesameuser = (req, res, next) =>
{
    if(req.session.user)
    {
        Product.findById(req.params.id).then(result =>
            {
                console.log(result)
                if(result.user._id.equals(req.session.user._id))
                {
                    console.log("You are authorized")
                    next()
                }
                else
                {
                    console.log("Disgraceful Thief Spotted!!!!")
                    res.redirect('back')
                }
            })
    }
    else{
        console.log("You have to login first")
        res.redirect("/login")
    }
}