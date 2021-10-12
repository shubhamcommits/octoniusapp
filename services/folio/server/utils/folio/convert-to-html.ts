const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');

const createHtml = async ( file_uri, toFormate="html:HTML:EmbedImages") => {
    let sofficeCommand = "soffice" // default for linux

    return new Promise( (resolve, reject) => {
         exec(`${sofficeCommand} --convert-to ${toFormate} --outdir "./uploads" "${file_uri}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            const htmlFile = "./uploads/"+path.parse(file_uri).name+".html";
            const docxFile = "./uploads/"+path.parse(file_uri).name+".docx";
            let data = fs.readFileSync(htmlFile, 'utf-8').toString();
            fs.unlinkSync(htmlFile);
            fs.unlinkSync(docxFile);
            resolve(data);
          })
    })
    
}

export default createHtml