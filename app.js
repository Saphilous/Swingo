var express = require('express')

const app = express()

var path=require("path")

var bodyparser = require('body-parser')

var multer=require('multer')

//mongoose connection

var mongoose = require('mongoose')


var sessions=require('express-session')

var MongoDBStore = require('connect-mongodb-session')(sessions);

const csrf=require("csurf")

mongoose.connect('mongodb+srv://Jaswanth:d5YTh1lgtJVLr9K2@cluster0-8srz3.azure.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

var store = new MongoDBStore({uri: 'mongodb+srv://Jaswanth:d5YTh1lgtJVLr9K2@cluster0-8srz3.azure.mongodb.net/test?retryWrites=true&w=majority', collection: 'sessions'
})
store.on('error', function(error)
{
  console.log(error)
})

const csrfProtection=csrf()

const flash=require("connect-flash")

const fileFilter= (req, file, cb) =>
{
  if(file.mimetype ==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
  {
    cb(null, true)
  }
  else
  {
    cb(null, false)
  }
}

const fileStorage = multer.diskStorage({

  destination: (req, file, cb) => 
  {
    cb(null, 'images');

  },
  filename :(req, file, cb) =>
  {
    cb(null, file.originalname)
  }
});

app.use(express.static(__dirname+"/public"))

app.use('/images', express.static(path.join(__dirname, 'images')));

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({extended: true}));

app.use(
  multer({ storage: fileStorage, fileFilter:fileFilter}).single('imageurl')
);
//mongoose connection end

var products1 = require('./routes/products')

var miscpages = require('./routes/miscpages')

var cart1 = require('./routes/cart')

var misccon=require('./controllers/misccontrollers')

var User=require("./Schemamodules/usermod")




app.use(require('express-session')({

    secret: env.SECRET,

    resave: false,

    saveUninitialized: false,

    store:store
  }))

app.use(csrfProtection)

app.use((req, res, next) =>
  {
    if(!req.session.user)
    {

      return next()
    }
    User.findById(req.session.user._id).then(user =>
      {
        req.user=user

        next()
      }).catch(err =>
        {
          console.log("Line no ------------------------------------------------ 59 node app.js")
        })
  })

app.use((req, res, next) =>
{
  res.locals.userejs=req.session.user
  res.locals.csrftoken=req.csrfToken()
  next()
})

app.use(flash())

//Routes Start Here

app.use(( error, req, res, next) =>
{
  res.status(500).render('500')
})

app.use(miscpages)

app.use(products1)

app.use(cart1)

app.use(misccon.get404)

app.use(misccon.get500)




//products start here



























































const port = 3000
app.listen(port, () => console.log(`Example app listening on port port!`))
