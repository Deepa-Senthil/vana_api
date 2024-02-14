const { sign, verify } = require('jsonwebtoken')
const { ACCESS_TOKEN } = require('../constants/Constants')
const createToken = (user) => {

    const accessToken = sign(
        {
            phoneNumber: user.phoneNumber, id: user._id
        },
        ACCESS_TOKEN)

    return accessToken
}

const validateToken = (req, res, next) => {
    const accessToken = req.cookies['access-token']
    if (!accessToken) return res.json("user not authenticated")
    try {
        const validToken = verify(accessToken, process.env.ACCESS_TOKEN)
        if (validToken) {
            req.authenticated = true
            return next()
        }
    } catch (err) {
        res.json(err)
    }
}

module.exports = { createToken, validateToken }