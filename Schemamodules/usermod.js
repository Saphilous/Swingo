var mongoose = require("mongoose")
var bcrypt=require("bcrypt")


const userschema = new mongoose.Schema
(
    {
        email: {type: String, required:true},
        username:{type:String, required:true},
        password: {type: String, required:true},
        ResetToken: {type: String},
        Tokenlife:{type: Date},
        cart: {
          items: [{
              productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
              }, quantity: { type: Number }
            }], 
            
        }
    }
)

userschema.methods.addtocart= function(product) {
  const cartproductindex = this.cart.items.findIndex(cp => {
    return cp.productId.toString()===product._id.toString()
  })
  let newquantity=1
  const updatedcartitems = [...this.cart.items]
  if (cartproductindex >= 0) {
    newquantity = this.cart.items[cartproductindex].quantity + 1;
    updatedcartitems[cartproductindex].quantity = newquantity;
  }
  else {
    updatedcartitems.push({
      productId: product._id,
      quantity: newquantity
    })
  }
  const updatedcart={
    items:updatedcartitems
  }
  this.cart=updatedcart
  return this.save()
}

userschema.methods.removeproduct= function(productid) {
  const updatedcartitems = this.cart.items.filter(item =>
    {
      return item.productId.toString() !== productid.toString()
    })
    this.cart.items=updatedcartitems
    return this.save()
}

userschema.methods.clearcart= function() {
  this.cart= {items: []}
  return this.save()
}

module.exports= mongoose.model("User", userschema)