const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const Barcode = require('jsbarcode')

const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath)
    } catch (e) {
        console.log(e)
    }
}

const makeDirectory = async (UPC_ID) => {
    try {
        const directoryPath = 'images/' + `${UPC_ID}`
        await fs.promises.mkdir(directoryPath)
    } catch (e) {
        console.log(e)
    }
}

// first method converting canvas to buffer then use write() method
//second method create PNG stream then pipe it into write stream
const generateUPCImage2 = (UPC_ID) => {
    try {
        return new Promise((resolve, reject) => {
            //creating canvas 
        const canvas = createCanvas()

        //writing image
        Barcode(canvas, UPC_ID, {
            format: 'CODE128',
            displayValue: true,
            fontSize: 18,
            textMargin:10
        })
        //upc image name
        const fileName = `${UPC_ID}.png`
        const filePath = path.join('images', `${UPC_ID}`, fileName)

        const stream = canvas.createPNGStream()

        const writer = fs.createWriteStream(filePath)

        //error handling
        writer.on('error', (error) => {
            console.log(error)
            reject(error)
        })

        stream.pipe(writer)

        writer.on('finish', () => {
            resolve('created upc image')
            writer.end(console.log('ended upc stream'))//end the stream
        })
        
        });
    } catch (error) {
        console.log(error)
    }
}

const saveProductImage = (data,filePath) => {
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
module.exports = {
    deleteFile,
    makeDirectory,
    saveProductImage,
    generateUPCImage2,
}
