const path = require('path')
const fs = require('fs')
const { createCanvas } = require('canvas')
const Barcode = require('jsbarcode')
// first method converting canvas to buffer then use write() method
exports.generateUPCImage = (UPC_ID) => {
    try {
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
        const filePath = path.join('images', 'upc', fileName)

        //write stream
        let writer = fs.createWriteStream(filePath)

        //converting canvas to buffer async
        canvas.toBuffer((err, buf) => {
            if (err) {
                console.log(err)
            }
            writer.write(buf);
            writer.on('finish', () => {
                writer.end(); 
            });
            
        })

    } catch (error) {
        console.log(error)
    }
} 
//second method create PNG stream then pipe it into write stream
exports.generateUPCImage2 = (UPC_ID) => {
    try {
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
        const filePath = path.join('images', 'upc', fileName)

        const stream = canvas.createPNGStream()

        const writer = fs.createWriteStream(filePath)

        //error handling
        writer.on('error', (error) => {
            console.log(error)
        })

        stream.pipe(writer)

        writer.on('finish', () => {
            console.log('The PNG file was created.')
            writer.end()//end the stream
        })

    } catch (error) {
        console.log(error)
    }
} 