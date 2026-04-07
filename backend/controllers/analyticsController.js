import { User } from "../models/User.model.js";
import job from '../models/Job.model.js';
import Escrow from '../models/Escrow.model.js';
import transaction from '../models/Transaction.model.js';
import Review from '../models/Review.model.js';


//platform analytics (admin)
export const analyticsDashboard = async(req,res)=>{
    try {
        //user analytics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({status: 'active'});
        const suspendedUsers = await User.countDocuments({status: 'suspended'});
        const totalClients = await User.countDocuments({role: 'client'});
        const totalFreelancers = await User.countDocuments({role: 'freelancer'});
        const Isactive = await User.countDocuments({isActive: true}); 

        //job analtics
        const totalJobs = await job.countDocuments();
        const openJobs = await job.countDocuments({status: 'open'});
        const completedJobs = await job.countDocuments({status: 'completed'});

        //financial analytics
        const totalEscrowAmount = await Escrow.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount:{$sum: '$amount'},
                }
            }
        ]);
        const totalRevenue = await transaction.aggregate([
            { $match:{status: 'success'}},
            { $group: {_id: null, totalRevenue: {$sum: '$amount'}}}
        ]);
        //review analytics
        const avgRating = await Review.aggregate([{
            $group:{_id: null, averageRating: {$avg: '$rating'}}
        }]);
        //trending skills
        const trendingSkills = await job.aggregate([
      { $unwind: "$requiredSkills" },
      {
        $group: {
          _id: "$requiredSkills",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
        success: true,
        analytics: {
            users:{
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalClients,
                totalFreelancers,
                Isactive,
            },
            jobs:{
                totalJobs,
                openJobs,
                completedJobs,
            },
            finane: {
                totalEscrowAmount: totalEscrowAmount[0] ? totalEscrowAmount[0].totalAmount: 0,
                totalRevenue: totalRevenue[0] ? totalRevenue[0].totalRevenue : 0,
            },
            reviews:{
                avgRating : avgRating[0] ? avgRating[0].averageRating.toFixed(2) : 0,
            },
            trendingSkills,
        },
    })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'server error',
            success:false,
        })
    }
}