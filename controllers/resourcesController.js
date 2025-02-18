const Course = require('../models/courseModel');

exports.getAllResources = async (req, res) => {
    try {
        const { page, limit } = req.query;
    
        const query = {};
        const skip = (parseInt(page) - 1) * parseInt(limit || 0);
    
        // Fetch all courses first
        const courses = await Course.find(query).sort({ createdAt: -1 });
    
        // Filter courses that have images or files
        const filteredCourses = courses.filter(course => 
            (course.gallery && course.gallery.length > 0) || 
            (course.materials && course.materials.length > 0)
        );
    
        // Apply pagination to the filtered courses
        const paginatedCourses = limit
            ? filteredCourses.slice(skip, skip + parseInt(limit))
            : filteredCourses;
    
        const totalCount = filteredCourses.length;
        const totalPages = limit ? Math.ceil(totalCount / parseInt(limit)) : 1;
    
        res.status(200).json({
            message: 'All Courses with photo and files are fetched',
            data: paginatedCourses,
            pagination: {
                totalCount,
                totalPages,
                currentPage: limit ? parseInt(page) : null,
                perPage: limit ? parseInt(limit) : totalCount,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};
