const redis = require("redis")

const client =  redis.createClient({
    url:process.env.REDIS_URL
})

exports.redisSetUser = async (id, data) => {
    try {
        await client.connect()

        const response = await client.set(
            `user-${id.toString()}`,
            JSON.stringify(data),
            { EX: 10 }
        )

        await client.disconnect()

        return response
    } catch (e) {
        console.log(e)
    }
}
exports.redisGetUser = async (id) => {
    try {
        await client.connect()

        const data = await client.get(`user-${id.toString()}`)

        await client.disconnect()

        return JSON.parse(data)
    } catch (e) {
        console.log(e)
    }
}