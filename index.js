const path  = require ('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");

const Blog = require('./models/blog');

const userRouter = require ('./routes/user');
const blogRouter = require ('./routes/blog');


const { 
    cheakForAutnenticationCookie 
} = require ('./middlewares/authentication');



const app = express();
const PORT = process.env ||8000;

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(cheakForAutnenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

mongoose
.connect("mongodb://localhost:27017/blogify")
.then(()=> console.log("Connected to MongoDB"));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', async(req,res)=>{
    const allBlogs = await Blog.find({});
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user",userRouter);
app.use("/blog",blogRouter);


app.listen(PORT,()=> console.log(`Server is runnig on poprt ${PORT}`));
