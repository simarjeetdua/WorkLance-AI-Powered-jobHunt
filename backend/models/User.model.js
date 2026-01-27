import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [5,"password must be at least 5 characters long"],
        minlength : 5
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now,
        timestamps: true
    }

},{timestamps: true});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password =bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isCorrectPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        username: this.username,
        role: this.role
    
    },
   process.env.ACCESS_TOKEN_SECRET,
   {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
   }
)}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    },
   process.env.REFRESH_TOKEN_SECRET,
   {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
   }
)}

export const User = mongoose.model("User", userSchema);
