//jshint esversion:6
//READ ME
// run npm init and then npm back.js ... it will run (on ejs templates)
//it's other files are in views folder which hosts the front-end stuff
// I have added it just so a person can run them.
// In the final product we will just REMOVE the res.redirect("") and res.render("")
// in our GET and POST Routes and it will become completely backend


const express=require("express"); 
const bodyParser=require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const session = require('express-session'); // reqd for creating session
const passport = require('passport'); // google passport module for auth
const passportLocalMongoose = require('passport-local-mongoose');//passport x mongoose

const app=express();

app.use(express.static("public")); 
app.set('view engine', 'ejs');//This is used to render ejs files (i think we won't need this but just let it be here untill everyghing is running)
app.use(bodyParser.urlencoded({extended: true})); //used to catch the post requests

app.use(session({
    secret: "Keyboard Warrior Ninja",
    resave: false,
    saveUninitialized: false 
}));

//Creating a session
app.use(passport.initialize());
app.use(passport.session())

//Local mongoDB hosting
mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true);


//Schema can be changed 
const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    name:String,
    college:String,
    branch:String //More parameters can be added
}); 
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

//Serializing-Deserializing Cookies
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");//To be changed once we connect with our frontend.
    // Also all these pages are in views fold from where it is being renedered
})

app.get("/gallery",function(req,res){
    //isAuthenticate is used to Authenticate the user. Iguess only the res.render part will be changed
    if(req.isAuthenticated()){
        User.find({"name":{$ne:null}}, function(err,foundUsers){
            if(err){
                console.log(err);
            }else{
                if(foundUsers){
                    // here
                    res.render("gallery",{usersData: foundUsers});//Sending all data to Gallery page
                }
            }
        });
    }else{
        res.redirect("/login");//redirecting to login page
        //
    }
});

//login page
app.get("/login",function(req,res){
    res.render("login");
});

//I guess here we will Catch our Username and Password from the form in Frontend
app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }),function(req, res) {
        res.redirect('/gallery');//iska kuch karna hai--- or I think we dont have to do anything
        //It will just tell front end to go ahead
}); 

//Register the user
app.get("/register",function(req,res){
    res.render("register");
});

//Cathing the user 
app.post("/register",function(req,res){
    User.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/gallery");
            })
        }
    })
});



//Updating the user details page 
app.get("/updateData",function(req,res){
    if(req.isAuthenticated()){
        res.render("updateData");
    }else{
        res.redirect("/login");
    }
});

//Catching the user details
app.post("/updateData",function(req,res){
    const name=req.body.name;
    const college=req.body.college;
    const branch=req.body.branch;
    // console.log(req.user);
    User.findById(req.user.id, function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                foundUser.name=name;
                foundUser.college=college;
                foundUser.branch=branch;
                foundUser.save(function(){
                    res.redirect("/gallery");
                })
            }
        }
    })
});

//Log out method from passport
app.get("/logout",function(req,res){
    req.logout();//The main method
    res.redirect("/");// redirecting to home page
});

//starting server on port 5000
app.listen(5000, function() {
    console.log("Server has started successfully");
});