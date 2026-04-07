import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [5, "password must be at least 5 characters long"],
        minlength: 5
    },
    role: {
        type: String,
        enum: ['client', 'freelancer', 'admin'],
        default: 'freelancer'
    },
    avatar: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        timestamps: true
    }

}, { timestamps: true });


export const User = mongoose.model("User", userSchema);
export default User;
