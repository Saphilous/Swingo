var Product = require('../Schemamodules/productmod')

var {validationResult} = require('express-validator')

const itemsperpage=5

exports.getallproducts = (req, res, next) =>
{

  const page = +req.query.page || 1

  let totalitems

  let messages=req.flash('success')

    console.log(messages)

    if(messages.length>0)
    {
        messages=messages[0]
    }
    else
    {
        messages=null
    }

    Product.find().countDocuments().then(numproducts =>
      {
        totalitems=numproducts
        return Product.find().skip((page-1)*itemsperpage).limit(itemsperpage)
      }).then(products =>
        {
          res.render("products.ejs", {Products:products, 
            messages:messages,
            totalitems:totalitems,
            currentpage:page,
            hasnextpage: itemsperpage * page < totalitems,
            hasPreviousPage: page > 1,
            nextpage: page + 1,
            previouspage: page-1,
            lastpage:Math.ceil(totalitems/itemsperpage)
          })
        }).catch(err =>
          {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
          })
}

exports.postproduct = (req, res, next) =>
{
    var error = validationResult(req) 
    var title = req.body.productname
    var image= req.file
    var description=req.body.description
    var owner= req.body.owner
    var price= req.body.price
    var userpsid = req.session.user._id
    var imageurl= image.path
    console.log(imageurl)

    if(!error.isEmpty()) 
    {
      console.log(error)
      return res.status(400).render("addingform.ejs", {message:error.array()[0].msg, validationerrors:error.array(), title:title, description:description, owner:owner, price:price})
    }
    if(!image)
    {
      return res.status(422).redirect('/products/new')
    }

    var newproduct = {title:title, imageurl:imageurl, description:description, owner:owner, price:price, user: userpsid}
    Product.create(newproduct, function(err, success)
    {
        if(err)
        {
            console.log(err)
        }
        else{
            console.log(success)
            res.redirect("/products")
      }
  })
}

exports.getaddproduct= (req, res, next) =>
{
  let message=req.flash('failure')
  if(message.length>0)
  {
    message=message[0]
  }
  else{
    message=null
  }
    res.render("addingform.ejs", {message:message, validationerrors:[], title:'', description:'', owner:'', price:''})
}

exports.getoneproducts= (req, res, next) =>
{
    Product.findById(req.params.id, function(err, foundprod)
    {
      if(err)
      {
        console.log(err)
      }
      else{
        res.render("oneproduct.ejs", {foundprod:foundprod})
      }
    })
}

exports.geteditproduct = (req, res, next) =>
{
    Product.findById(req.params.id, function(err, edit)
    {
      if(err)
      {
        console.log(err)
      }
      else{
        res.render("editform.ejs", {edit:edit})
     }
    })
}

exports.posteditproduct= (req, res, next) =>
{
  Product.findByIdAndUpdate(req.params.id, req.body.edit, function(err, update)
    {
      if(err)
      {
      console.log(err)
      }
      else{
        console.log(update)
        res.redirect("/products/"+req.params.id)
      }
    })
}

exports.getdeleteproduct = (req, res, next) =>
{
    Product.findByIdAndDelete(req.params.id, function(err, del)
  {
    if(err)
    {
      console.log(err)
    }
    else{
      res.redirect("/products")
    }
  })
}