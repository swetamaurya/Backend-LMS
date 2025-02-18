const Course = require('../models/courseModel');

exports.getAllResources = async (req, res) => {
    try {
        const { page , limit} = req.query; // Default page = 1, limit = 10
  
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalCount = await Course.countDocuments();

        // Fetch filtered courses directly from DB
        const courses = await Course.find({
            $or: [
                { gallery: { $exists: true, $not: { $size: 0 } } },
                { materials: { $exists: true, $not: { $size: 0 } } }
            ]
        }).skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

 
        res.status(200).json({
            message: 'All Courses with photos and files are fetched',
            data: courses,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page),
                pageSize: parseInt(limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
