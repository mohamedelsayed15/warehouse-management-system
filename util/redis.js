const redis = require("redis")
const client = redis.createClient({
    url:process.env.REDIS_URL
})
exports.client =  client
/*
In the Redis command client.set('key', 'value', { EX: 10, NX: true }),

the NX: true option means "only set the key if it does not already exist."

The NX option stands for "Not eXists" and is used in combination with the SET command

to ensure that the key is set only if it does not exist in Redis.

If the key already exists, the command will not update the value and will 

return null instead of overwriting the existing value.
*/

exports.redisSetUser = async (id, data) => {
    try {
        //await client.connect()

        const response = await client.set(
            `user-${id}`,
            JSON.stringify(data),
            { EX: 10 }
        )

        return response

    } catch (e) {
        throw e
    } finally {
        try {
            //await client.disconnect()
        } catch(e) {
            throw e
        }
    }
}
exports.redisGetUser = async (id) => {
    try {
        //await client.connect()

        const data = await client.get(`user-${id.toString()}`)

        return JSON.parse(data)

    } catch (e) {
        throw e
    }finally {
        try {
            //await client.disconnect()
        } catch(e) {
            throw e
        }
    }
}