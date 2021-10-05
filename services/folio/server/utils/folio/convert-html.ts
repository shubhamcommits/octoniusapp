const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');
const os = require('os');

const createHtml = async ( file_uri, res, toFormate="html:HTML:EmbedImages", deleteFile=true) => {
    const osType = os.type();
    let sofficeCommand = "soffice" // default for linux
    if(osType === "win32" || osType === "win64") {
        //install liberOffice on you system https://www.libreoffice.org/download/download/
        //set environment variable C:/Program Files/LibreOffice/program/ or where ever you installed
        sofficeCommand = "soffice";
    }
    exec(`${sofficeCommand} --convert-to ${toFormate} --outdir "./uploads" "${file_uri}"`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout:`);
      const htmlFile = "./uploads/"+path.parse(file_uri).name+".html";
      const docxFile = "./uploads/"+path.parse(file_uri).name+".docx";
      fs.readFile(htmlFile, 'utf-8', (err, data) => {
          if (!err) {
            if(deleteFile) {
                fs.unlinkSync(htmlFile);
                fs.unlinkSync(docxFile);
            }
              res.json({
                "message": data,
                "messages": "Temp"
                });
            }
            else {
                res.status(err.status || 500).send("Error while converting")
            }
        })
    })
  }


  export default createHtml