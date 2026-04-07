import { User } from "../models/User.model.js";
import Analytics from "../models/Analytics.model.js";
import job from '../models/Job.model.js';
import { use } from "react";

//get all users
export const getAllUsers = async (req,res)=>{
    try {
        const getUsers = await User.find().select('-password');
        res.status(200).json({
            success: true,
            message: 'users fetched successfully',
            count: getUsers.length,
            getUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success: false,
        })
    }
}

//delete user
export const deleteUser = async(req,res)=>{
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if(!user)
        {
            return res.status(404).json({
                message: 'user not found',
                success: false,
            })
        }
        res.status(200).json({
            message: "user deleted successfully",
            success: true,
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success: false,
        })
    }
}
//suspend or activate user
export const UserStatus = async(req,res)=>{
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user)
        {
            res.status(404).json({
                message: 'user not found',
                success: false,
            })
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({
            success: true,
            message: `user ${user.isActive ? 'activated' : 'suspended'} successfully`,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success: false,
        })
    }
}
//get all jobs
export const GetAllJobs = async(req,res)=>{
    try {
        const jobs = await job.find.populate('client', 'name email');
        res.status(200).json({
            success: true,
            message: 'jobs fetched successfully',
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success: false,
        })
    }
}
//delete job
export const deleteJob = async(req,res)=>{
    try {
        const JobId = req.params.jobId;
        const job = await job.findByIdAndDelete(JobId);
        if(!job)
        {
            return res.status(404).json({
                message: 'job not found',
                success: false,
            })
        }
        res.status(200).json({
            message: 'job deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success:false,
        })
    }
}
//get analytics
export const getAnalytics = async (req,res)=>{
    try {
        const analytics = await Analytics.findOne();
        if(!analytics)
        {
            return res.status(404).json({
                message: 'analytics not found',
                success: false,
            })
        }
        res.status(200).json({
            message: 'analytics fetched successfully',
            success: true,
            analytics,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success:false,
        })
    }
}