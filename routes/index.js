var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload= require("./multer");
const postModel= require("./post");


passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});
router.post('/fileupload',isLoggedIn,upload.single("image"),async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user})
  if(req.file){
    user.profileImage = req.file.filename;
  }
  await user.save()
  res.redirect("/profile")

});
router.get('/login', async function(req, res, next) {
  
  res.render('index');
});
router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user}).populate("posts")
  console.log(user)
  res.render('profile',{user});
});
router.get('/show/posts',isLoggedIn, async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user}).populate("posts")
  res.render('show',{user});
});
router.get('/feed',isLoggedIn, async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user})
  const posts = await postModel.find().populate("user")
  res.render('feed',{user,posts});
});
router.get('/add',isLoggedIn, async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user})
  res.render('edit',{user});
});
router.post('/createPost',isLoggedIn,upload.single("Postimage"), async function(req, res, next) {
  const user =  await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    Postimage:req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
});
router.post('/register', function(req, res, next) {
  const user = new userModel({
    username:req.body.username,
    contact:req.body.contact,
    email:req.body.email,
    name:req.body.name
    
  
  })
  userModel.register(user, req.body.password)
.then(function(){
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile")
  })
});

})

router.post('/login',passport.authenticate("local",{
failureRedirect:"/",
successRedirect:"/profile"
}) ,function(req, res, next) {
});
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
  {
    return next()
 
  } 
  res.redirect("/login")
}     
 


module.exports = router;
