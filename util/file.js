const fs = require('fs')
const path = require('path')

const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath)
    } catch (e) {
        console.log(e)
    }
}

const makeDirectory = async (UPC_ID) => {
    try {
        await fs.promises.mkdir('images/'+`${UPC_ID}`)
    } catch (e) {
        console.log(e)
    }
}

const saveProductImage = (filePath,data) => {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
    
        writer.write(data);
    
        writer.on('finish', () => {
            resolve('product image created');
        });

        writer.on('error', (err) => {
        reject(err);
        });
        writer.end(console.log('product image stream ended'));
    });
}
module.exports = { deleteFile, makeDirectory, saveProductImage }
