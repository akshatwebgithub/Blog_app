const mongoose = require("mongoose");
const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");

//GET ALL BLOGS
exports.getAllBlogsController = async (req, res) => {
    try {
        const blogs = await blogModel.find({}).populate("user");
        if (!blogs) {
            return res.status(200).send({
                success: false,
                message: "No Blogs Found",
            });
        }
        return res.status(200).send({
            success: true,
            BlogCount: blogs.length,
            message: "All Blogs lists",
            blogs,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Error While Getting Blogs",
            error,
        });
    }
};

//Create Blog
exports.createBlogController = async (req, res) => {
    try {
        const { title, description, image, user } = req.body;
        //validation
        if (!title || !description || !image || !user) {
            return res.status(400).send({
                success: false,
                message: "Please Provide ALl Fields",
            });
        }
        const exisitingUser = await userModel.findById(user);
        //validaton
        if (!exisitingUser) {
            return res.status(404).send({
                success: false,
                message: "Unable to Find User",
            });
        }

        const newBlog = new blogModel({ title, description, image, user });
        const session = await mongoose.startSession();
        session.startTransaction();
        await newBlog.save({ session });
        exisitingUser.blogs.push(newBlog);
        await exisitingUser.save({ session });
        await session.commitTransaction();
        await newBlog.save();
        return res.status(201).send({
            success: true,
            message: "Blog Created!",
            newBlog,
        });
    } catch (error) {

        return res.status(400).send({
            success: false,
            message: "Error While Creating Blog",
            error,
        });
    }
};

//Update Blog
exports.updateBlogController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image } = req.body;
        const blog = await blogModel.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        );
        return res.status(200).send({
            success: true,
            message: "Blog Updated!",
            blog,
        });
    } catch (error) {

        return res.status(400).send({
            success: false,
            message: "Error While Updating Blog",
            error,
        });
    }
};

//SIngle Blog
exports.getBlogByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogModel.findById(id);
        if (!blog) {
            return res.status(404).send({
                success: false,
                message: "Blog Not Found with this Id",
            });
        }
        return res.status(200).send({
            success: true,
            message: "Fetch Single Blog",
            blog,
        });
    } catch (error) {

        return res.status(400).send({
            success: false,
            message: "Error While Getting Single Blog",
            error,
        });
    }
};

//Delete Blog
exports.deleteBlogController = async (req, res) => {
    try {
        const blog = await blogModel
            // .findOneAndDelete(req.params.id)
            .findByIdAndDelete(req.params.id)
            .populate("user");
        await blog.user.blogs.pull(blog);
        await blog.user.save();
        return res.status(200).send({
            success: true,
            message: "Blog Deleted!",
        });
    } catch (error) {

        return res.status(400).send({
            success: false,
            message: "Erorr While Deleting Blog",
            error,
        });
    }
};

//GET USER BLOG
exports.userBlogController = async (req, res) => {
    try {
        const userBlog = await userModel.findById(req.params.id).populate("blogs");

        if (!userBlog) {
            return res.status(404).send({
                success: false,
                message: "Blogs Not Found with this Id",
            });
        }
        return res.status(200).send({
            success: true,
            message: "User Blogs",
            userBlog,
        });
    } catch (error) {

        return res.status(400).send({
            success: false,
            message: "Error in User Blog",
            error,
        });
    }
};