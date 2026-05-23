import mongoose, { Schema } from "mongoose";


const ProfileSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bio:{
        type: String,
        default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel:{
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    hourlyRate: {
        type: Number,
        default: 0,
    },
    tagline: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    website: {
        type: String,
        default: ""
    },
    github: {
        type: String,
        default: ""
    },
    linkedin: {
        type: String,
        default: ""
    }
},
{
    timestamps: true,
})

export const Profile = mongoose.model('Profile',ProfileSchema);
export default Profile;