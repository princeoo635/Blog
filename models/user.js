const {Schema,model}=require('mongoose');
const {createHmac,randomBytes}=require('crypto');
const { createTokenForUser } = require('../service/authentication');

const userSchema=new Schema({
    fullName:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    salt:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    profileImageUrl:{
        type:String,
        default:'/images/defaultUser.png',
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },
},{timestamps:true});

userSchema.pre("save",function (next){
    const user=this;

    if(!user.isModified("password")) return;
    const salt=randomBytes(16).toString();
    const hashedpassword=createHmac("sha256",salt)
        .update(user.password)
        .digest("hex");

        this.salt=salt;
        this.password=hashedpassword;
        next();
});

userSchema.static('matchedPasswordAndGenerateToken',async function(email,password){
    const user=await this.findOne({email});
    if(!user) throw new Error('User not Found!');
    const salt=user.salt;
    const hashedpassword=user.password;
    const userProvidedHash=createHmac("sha256",salt)
    .update(password)
    .digest("hex");

    if(hashedpassword!==userProvidedHash)throw new Error('Incorrect Password!');

    const token=createTokenForUser(user);
    return token;
});


const User=model("user",userSchema);

module.exports=User;
