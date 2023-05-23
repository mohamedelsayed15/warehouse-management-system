
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
        const filePath = path.join('images', `${UPC_ID}`, fileName)

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
