const Product = require('../Schemamodules/productmod')
const path = require('path')
const PDFDOC  = require('pdfkit')
const Order=require("../Schemamodules/order")
const fs = require('fs')
const stripe=require('stripe')('sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx')

//cart routes start here

exports.getcart = (req, res, next) =>
{
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user =>
        {
            const products = user.cart.items
            const cartquan = user.cart
            console.log(products)
            res.render("cart.ejs", {products:products, cartquan:cartquan})
        }).catch(err =>
            {
                console.log(err)
                res.redirect("/products")
            })
}

exports.postcart = (req, res, next) =>
{
    const prodId1=req.body.prodId;
    Product.findById(prodId1).then(product =>
        {
            return req.user.addtocart(product)
        }).then(result =>
            {
                res.redirect("/cart")
            }).catch(err =>
                {
                    const error = new Error(err)
                    error.httpStatusCode = 500;
                    return next(error)
                })

}

exports.postdeletcart =(req, res, next) =>
{
   const prodIddel=req.body.prodId
   console.log(prodIddel)
   req.user
   .removeproduct(prodIddel)
   .then(result =>
    {
        res.redirect("/cart")
    })
   .catch(err =>
        {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })
}

exports.postclearcart = (req, res, next) =>
{
    const userId=req.user._id
    req.user.clearcart().then(result =>
        {
            console.log("Cart is cleared==============================")
            res.redirect("/products")
        })
}

/* exports.getorderitems = (req, res, next) */

exports.getcheckout = (req, res, next) =>
{
    let products
    let totalsum=0
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user =>
        {
            products = user.cart.items
            products.forEach(prod =>
                {
                    totalsum += (prod.quantity * prod.productId.price)
                })

                return stripe.checkout.sessions.create({
                    payment_method_types : ['card'],
                    line_items : products.map(p =>
                        {
                           const mailrec=req.user.email
                            return   {
                                        name: p.productId.title,
                                        description: p.productId.description,
                                        amount: p.productId.price * 100,
                                        currency: 'inr',
                                        quantity: p.quantity,

                                    }
                        }), 
                        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                        cancel_url:  req.protocol + '://' + req.get('host') + '/checkout/cancel'
                })

        }).then( session =>
            {
                console.log("55555555555555555555566666666666666666666666666666666666666666555555555555555555555555555555555555577777777777777777777")
                console.log(session.id)

                res.render('checkout.ejs', {
                    products:products,
                    totalsum:totalsum,
                    sessionId:session.id
                })

            }).catch(err =>
            {
                const error = new Error(err)
                error.httpStatusCode = 500;
                return next(error)
            })
}

//cart routes end here

exports.getorder = (req, res, next) =>
{
    let message=req.flash('success')
    if(message.length>0)
    {
        message=message[0]
    }
    else{
        message=null
    }
    Order.find({'user.userId':req.user})
    .then(orders =>
        {
            console.log(orders)
            console.log(orders.length)
            res.render('orders.ejs', {orders:orders, message:message})
        }).catch(err =>
            {
                const error = new Error(err)
                error.httpStatusCode = 500;
                return next(error)
            })
}

exports.getcheckoutsuccess=(req, res, next) =>
{
    const mailid=req.user.email
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user =>
        {
            const products=user.cart.items.map(p =>
                {
                    return {quantity: p.quantity, product: {...p.productId._doc}};
                });
                const order = new Order({
                    products: products,
                    user: {
                      email: req.user.email,
                      userId: req.user
                    }
                  });
                  return order.save();

        })
        .then(result =>
            {
                return req.user.clearcart()
            })
        .then (() =>
            {
                req.flash('success', 'Order Placed Successfully! Click on the Invoice to download it')
                res.redirect("/get_orders")
            })
        .catch(err =>{
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
            }
              )
}

exports.getinvoice =(req, res, next) =>
{
    const orderid=req.params.orderid
    const mailid=req.user.email

    Order.findById(orderid).then(order =>
        {
            if(!order)
            {
                return next(new Error('No order found.'));
            }
            if(!order.user.userId._id.equals(req.user._id))
            {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderid + '.pdf'

            const invoicePath = path.join('invoice', invoiceName)

            const orderpdf = new PDFDOC()

            res.setHeader('content-type', 'application/pdf')
            
            res.setHeader('Content-Disposition' , 'inline; filename="'+ invoiceName + '"')

            orderpdf.pipe(fs.createWriteStream(invoicePath))

            orderpdf.pipe(res)

            let totalprice=0

            order.products.forEach(prod => {

                orderpdf.fontSize(36).text('Product Title '+ ' - ' + prod.product.title)

                orderpdf.fontSize(10).text("Seller" + ' - ' + prod.product.owner)

                orderpdf.text('----------------------------------------------------')

                let productimage=prod.product.imageurl

                orderpdf.image(productimage, {scale: 0.25})

                orderpdf.fontSize(2).text(' ')

                orderpdf.fontSize(5).text('product Preview')

                orderpdf.fontSize(7).text(' ')

                orderpdf.fontSize(16).text("Quantity" + ' - ' + prod.quantity)

                orderpdf.fontSize(7).text(' ')

                orderpdf.fontSize(16).text("Price" + " - " + prod.product.price + ' INR' + ' * ' +prod.quantity)

                totalprice += ((prod.product.price)*(prod.quantity))

                orderpdf.fontSize(10).text('------------------------------------------------------------------------------------')

                orderpdf.fontSize(32).text(' ')

            });

            orderpdf.text('Total Price' + ' - ' + totalprice +' INR')

            orderpdf.end()
            })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error)
        })
}
