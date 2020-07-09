const express = require('express')
const router = new express.Router()

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

router.get('/user_posts', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        await user.populate('posts').execPopulate()

        res.send(user.posts)
    } catch (e) {
        console.log(e)
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