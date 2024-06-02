require("dotenv").config();
const express=require('express');
const serverless = require("serverless-http");
const path=require('path');
const router = express.Router();
const mongoose=require('mongoose');
const userRouter=require('./routes/user');
const blogRouter=require('./routes/blog');
const cookieParser=require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/authentication');

const Blog=require('./models/blog');


const app=express();
const PORT=process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL)
.then(e=> console.log("mongoDB connected!!"));

app.set("view engine","ejs");
app.set("views",path.resolve('./views'))

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")))

app.get('/',async(req,res)=>{
    const allBlogs = await Blog.find({});
    return res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});
app.use('/user',userRouter);
app.use('/blog',blogRouter);

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);

app.listen(PORT,()=>{
    console.log(`server running at PORT :: ${PORT}`);
})