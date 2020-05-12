exports.gethomepage = (req, res, next) =>
{
    let messages=req.flash('success')
    console.log(messages)
    if(messages.length>0)
    {
        messages=messages[0]
    }
    else{
        messages=null
    }
    res.render("homepage.ejs", {messages:messages})
}

exports.get404 = (req, res, next) => {
    res.status(404).render('404');
  };
  
  exports.get500 = (req, res, next) => {
    res.status(500).render('500');
  };
  