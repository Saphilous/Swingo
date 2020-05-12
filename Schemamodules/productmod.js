var mongoose = require('mongoose')

var productschema = new mongoose.Schema({

    title:String,

    imageurl: String,

    description:String,

    owner:String,

    price: {type: Number},
    
    //connects the product to a user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
      }

})

module.exports = mongoose.model("Product", productschema)