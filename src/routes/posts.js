const express = require('express')
const router = new express.Router()

const auth = require('../middleware/auth')
const Post = require('../models/posts')

router.post('/post', auth, async (req, res) => {
    const post = new Post({ 
        ...req.body, 
        ownerId: req.user._id 
    })

    try {
        await post.save()
        
        res.status(201).send({ post })
    } catch (e) {
        res.status(500).send({ 'message': 'Error occured while creating post' })
    }
})

router.post('/like', auth, async (req, res) => {
    const _id = req.body.postId
    
    try {
        var post = await Post.findOne({_id})
        
        if (!post)
            res.status(404).send()

        var likeId
        post.likes.forEach(e => {
            if (e.userId.equals(req.user._id))
                likeId = e._id
        })

        if(likeId) {
            post.likes.id(likeId).remove()
            post = await post.save()
        } else {
            post = await Post.findByIdAndUpdate(_id, { $addToSet: { 'likes': { 'userId': req.user._id } } }, { new: true, runValidators: true, useFindAndModify: false })
        }

        res.send(post)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find()

        res.send(posts)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(!post)
            res.status(404).send()

        res.send(post)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/post/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const post = await Post.findOneAndDelete({ _id, ownerId: req.user._id })

        if(!post)
            res.status(404).send()

        res.send(post)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/post/:id', auth, async (req, res) => {
    const _id = req.params.id
    const validUpdateKeys = ['title', 'body']
    const updateKeys = Object.keys(req.body)
    const isValidUpdate = updateKeys.every(updateKey => validUpdateKeys.includes(updateKey))

    if(!isValidUpdate)
        res.status(400).send()

    try {
        const post = await Post.findOne({ _id, ownerId: req.user._id })

        if (!post)
            res.status(404).send()

        updateKeys.forEach(updateKey => post[updateKey] = req.body[updateKey])

        await post.save()
    
        res.send(post)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router