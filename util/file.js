const fs = require('fs')

const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath)
    } catch (e) {
        console.log(e)
    }
}

module.exports = { deleteFile }