const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');
const os = require('os');
const libre = require('libreoffice-convert');

const createHtml = async ( file_uri, res, toFormate="html:HTML:EmbedImages", deleteFile=true) => {
    // const osType = os.type();
    // let sofficeCommand = "soffice" // default for linux
    // if(osType === "win32" || osType === "win64") {
    //     //install liberOffice on you system https://www.libreoffice.org/download/download/
    //     //set environment variable C:/Program Files/LibreOffice/program/ or where ever you installed
    //     sofficeCommand = "soffice";
    // }
    
    const docxFile = "./uploads/"+path.parse(file_uri).name+".docx";
    // const htmlFile = "./uploads/"+path.parse(file_uri).name+".html";
    const file = fs.readFileSync(docxFile);
    libre.convert(file, toFormate, undefined, (err, done) => {
        if (err) {
          console.log(`Error converting file: ${err}`);
          res.send(err);
        }
        
        // Here in done you have pdf file which you can save or transfer in another stream
        // fs.writeFileSync(htmlFile, done);

        else res.json({
            message: done.toString(),
            messages: "Temp"
        });
        if(deleteFile) {
                        // fs.unlinkSync(htmlFile);
                        fs.unlinkSync(docxFile);
                    }
    });
    // exec(`${sofficeCommand} --convert-to ${toFormate} --outdir "./uploads" "${file_uri}"`, (error, stdout, stderr) => {
    //   if (error) {
    //       console.log(`error: ${error.message}`);
    //       return;
    //   }
    //   if (stderr) {
    //       console.log(`stderr: ${stderr}`);
    //       return;
    //   }
    //   console.log(`stdout:`);
    //   const htmlFile = "./uploads/"+path.parse(file_uri).name+".html";
    //   const docxFile = "./uploads/"+path.parse(file_uri).name+".docx";
    //   fs.readFile(htmlFile, 'utf-8', (err, data) => {
    //       if (!err) {
    //         if(deleteFile) {
    //             fs.unlinkSync(htmlFile);
    //             fs.unlinkSync(docxFile);
    //         }
    //           res.json({
    //             "message": data,
    //             "messages": "Temp"
    //             });
    //         }
    //         else {
    //             res.status(err.status || 500).send("Error while converting")
    //         }
    //     })
    // })
}

function createUploadFolder(req, res, next) {
    if(!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads')
    }
    next()
}

export {createHtml, createUploadFolder}