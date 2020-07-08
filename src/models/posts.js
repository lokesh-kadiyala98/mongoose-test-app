const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const likeSchema = {
    userId: {
        type: ObjectId,
        required: [true, 'User ID required! Like is associated with an user'],
        ref: 'User'
    }
}

const postSchema = {
    title: {
        type: String,
        required: [true, 'Post title is required!'],
        trim: true
    },
    body: {
        type: String,
        required: [true, 'Post content is required!'],
        trim: true
    },
    likes: [
        likeSchema
    ],
    ownerId: {
        type: ObjectId,
        required: [true, 'User ID is required! Post is associated with an user'],
        ref: 'User'
    }
}

const Post = new mongoose.model('Post', postSchema)

module.exports = Post