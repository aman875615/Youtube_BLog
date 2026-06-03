const dotenv = require('dotenv');
dotenv.config();


const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');

const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

const {
    cheakForAutnenticationCookie
} = require('./middlewares/authentication');

const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cheakForAutnenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.log("MongoDB Error:", err));

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.get('/', async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.render("home", {
            user: req.user,
            blogs: allBlogs,
        });
    } catch (error) {
        console.log("Error fetching blogs:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));