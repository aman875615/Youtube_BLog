const { Router} = require('express');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const Blog =  require("../models/blog");
const Comment = require("../models/comment");

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("WARNING: Cloudinary configuration variables are missing in process.env!");
  console.warn("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Found" : "Missing");
  console.warn("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Found" : "Missing");
  console.warn("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Found" : "Missing");
} else {
  console.log("Cloudinary configuration loaded successfully.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });


router.get("/add-new", (req,res)=>{
    return res.render('addBlog',{
        user: req.user,
    });
});
router.get("/:id", async(req,res)=>{
  
    const blog = await Blog.findById(req.params.id).populate("createdBy") ; 
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    return res.render("blog",{
        user: req.user,
        blog, 
      comments,
    })
});

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user.id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single('coverImage'), async(req,res)=>{
    const {title, body} = req.body; 
    let coverImageURL = null;

    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "blogify"
            });
            coverImageURL = result.secure_url;
            
            // Delete local file after upload
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting local temp file:", err);
            });
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            // Fallback to local file URL if Cloudinary fails
            coverImageURL = `/uploads/${req.file.filename}`;
        }
    }

    try {
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user.id,
            coverImageURL: coverImageURL,
        });
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).send("Error creating blog");
    }
});

module.exports = router;
