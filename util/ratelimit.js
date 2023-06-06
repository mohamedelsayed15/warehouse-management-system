const rateLimit = require('express-rate-limit')


// limiting 100 requests every 30 mins
const limiter = rateLimit({
    windowsMs:1800000 ,//30 * 60 * 1000//30 mins
    max: 100
})

module.exports = limiter