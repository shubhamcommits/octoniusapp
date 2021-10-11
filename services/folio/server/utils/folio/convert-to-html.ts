const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');

const createHtml = async (file_uri, toFormate="html:HTML:EmbedImages") => {
    let sofficeCommand = "soffice" // default for linux
console.log("2.- " + file_uri);
    return new Promise( (resolve, reject) => {
        exec(`${sofficeCommand} --convert-to ${toFormate} --outdir "${process.env.FILE_UPLOAD_FOLDER}" "${file_uri}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }

            const htmlFile = process.env.FILE_UPLOAD_FOLDER + path.parse(file_uri).name + ".html";
console.log("3.- " + htmlFile);
            let data = fs.readFileSync(htmlFile, 'utf-8').toString();

            // remove the files
            fs.unlinkSync(htmlFile);
console.log("4.- " + file_uri);
            fs.unlinkSync(file_uri);
console.log("5.- " + file_uri);
            // return data
            resolve(data);
          })
    })
    
}

export default createHtml