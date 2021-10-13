const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');

const createHtml = async (file_uri, toFormate="html:HTML:EmbedImages") => {
    let sofficeCommand = "soffice"; // default for linux
    switch (process.platform) {
        case 'darwin': sofficeCommand = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
            break;
        default:
            break; // callback(new Error(`Operating system not yet supported: ${process.platform}`));
    }

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

            const htmlFile = "./uploads/" + path.parse(file_uri).name + ".html";
            const docxFile = "./uploads/" + path.parse(file_uri).name + ".docx";

            let data = fs.readFileSync(htmlFile, 'utf-8').toString();

            // remove the files
            fs.unlinkSync(htmlFile);
            fs.unlinkSync(docxFile);

            // return data
            resolve(data);
          });
    });   
}

export default createHtml