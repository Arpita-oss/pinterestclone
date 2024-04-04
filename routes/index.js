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
router.get('/show/posts/:postid', isLoggedIn, async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user});
  const posts = await postModel.findById(req.params.postid).populate("user");
  res.render('cardid',{user,posts, nav: true});
})
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
//muje ek user chaiye jo loggin ho
//uske baad muje jis user ki post mai khul rhi hu uski postbade area mai chaiye
//jis  user ki post pe click kru bs whi khulni chaiye
//abhi aisa aa rha h ki jonlogin h uakinpost bs badi honri h
//but I wamt ki jis user ki post openn kru uski post khulni chaiye
//USKE liye chaiye muje ki user ki post id or usi user ko m populate kr
// ... (your existing code)

router.get('/userpin/posts/:postid', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts');
  const post = await postModel.findById(req.params.postid);
  res.render('userpin',{user,post, nav: true});
});


// router.get('/userpost/:postId', isLoggedIn, async function(req, res, next) {
//   const postId = req.params.postId;
//   const post = await postModel.findById(postId).populate("user")
  
//   if (!post) {
//     // Handle post not found
//     res.render('error', { message: 'Post not found', error: { status: 404 } });
//     return;u
//   }

//   res.render('userpost', { user: post.user, post: post });
// });

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
