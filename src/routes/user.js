const express = require('express')
const router = new express.Router()
const multer = require('multer')

const auth = require('../middleware/auth')
const User = require('../models/user')

router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(500).send({ 'message': 'Error occured while creating user' }) 
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        
        const token = await user.generateAuthToken()

        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/logout_all_devices', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image'))
        
        cb(undefined, true)
    }
})

router.post('/user/profile/pic', auth, upload.single('profile_pic'), async (req, res) => {
    req.user.profile_pic = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/user/profile/pic', auth, async (req, res) => {
    req.user.profile_pic = undefined
    await req.user.save()
    res.send()
})

router.get('/user/profile/pic/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.profile_pic) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.profile_pic)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/user/profile', auth, (req, res) => {
    res.send(req.user)
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        if(!users)
            return res.status(404).send()
            
        res.status(200).send(users)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user)
            res.status(404).send()
        
        res.send(user)
    } catch (e) {   
        res.status(500).send()
    }
})

router.get('/user_posts', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'posts'
        }).execPopulate()
        
        res.send(req.user.posts)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/user', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const validUpdateKeys = ['name', 'email', 'password', 'age']
    const isValidUpdate = updateKeys.every(updateKey => validUpdateKeys.includes(updateKey))

    if(!isValidUpdate) {
        return res.status(400).send({ 'message': 'Invalid update operation' })
    }

    try {
        // few methods does not run the mongoose middleware moreover it requires us to explicitly command to validate
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        
        const user = req.user
        
        if(!user)
            return res.status(404).send()

        updateKeys.forEach(key => user[key] = req.body[key])

        await user.save()

        res.status(200).send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/user', auth, async (req, res) => {
    try {
        await req.user.remove()

        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router