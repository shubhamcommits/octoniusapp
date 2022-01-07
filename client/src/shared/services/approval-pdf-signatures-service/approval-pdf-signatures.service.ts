import { Injectable } from '@angular/core';
import moment from 'moment/moment';
import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
//import fontkit from '@pdf-lib/fontkit'

@Injectable({
  providedIn: 'root'
})
export class ApprovalPDFSignaturesService {

  constructor() { }

  async addSignaturePage(fileData: any, pdfDoc: PDFDocument) {
    //const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    /*
    const islandMomentsBytes = await fetch(
      'https://www.octonius.com/wp-content/uploads/octonius_assets/IslandMoments-Regular.ttf',
      {
        mode: 'no-cors',
        headers: {
          "Content-Type": "font/ttf"
        }
      }).then(res => res.arrayBuffer());
    */
    //const calligraffittiFontBytes = fs.readFileSync(path.join(__dirname, '../utils/signatures/Calligraffitti-Regular.ttf'));

    const fonts = {
      helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
      //calligraffitti: await pdfDoc.embedFont(calligraffittiFontBytes),
      //islandMoments: await pdfDoc.registerFontkit(islandMomentsBytes),
    };

    page.resetPosition();

    let yPosition = height - 50;
    const initialXPosition = 35;

    page.moveTo(initialXPosition, yPosition)

    page.drawText(
      'Certificate of Completition',
      {
        //x: initialXStartPosition,
        //y: yStartPosition,
        size: 20,
        font: fonts.helvetica,
        color: rgb(0, 0.4, 1),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    //const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
    //const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
/*
    const jpgImageBytes = await fetch(
      'https://www.octonius.com/wp-content/uploads/octonius_assets/octo-signature.jpg', {
        mode: 'no-cors'
      }).then((res) => res.arrayBuffer())

    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)

    yPosition -= 15;
    page.moveTo(initialXPosition, yPosition);

    page.drawImage(jpgImage,
      {
        x: width - 157,
        width: 122,
        height: 38,
        opacity: 0.75,
      });
*/
    yPosition -= 20;
    page.moveTo(initialXPosition, yPosition);

    await this.drawFileDetails(page, fileData, fonts);

    yPosition -= 100;
    page.moveTo(initialXPosition, yPosition);

    page.drawText(
      'Signer Events',
      {
        //x: initialXStartPosition,
        //y: yStartPosition,
        size: 20,
        font: fonts.helvetica,
        color: rgb(0, 0, 0),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    yPosition -= 30;
    page.moveTo(initialXPosition, yPosition);

    for (let i = 0; i < fileData.approval_flow.length; i++) {
      let approval = fileData.approval_flow[i];
      if (approval.confirmed && approval.confirmation_date) {
        await this.drawSignedApproval(page, approval, fonts);
      } else {
        await this.drawPendingApproval(page, approval, fonts);
      }
      yPosition -= 75;
      page.moveTo(initialXPosition, yPosition);
    }

    return await pdfDoc.save();
  }

  async drawFileDetails(page: PDFPage, fileData: any, fonts: any) {
    const { x, y } = page.getPosition();

    page.drawText(
      'EnvelopeId: ' + 'CryptoSignatureCode',
      {
        x: x + 5,
        y: y - 10,
        size: 11,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    const status = await this.isApprovalFlowCompleted(fileData.approval_flow);

    page.drawText(
      'Status: ' + (status) ? 'COMPLETED' : 'PENDING',
      {
        x: x + 5,
        y: y - 25,
        size: 11,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    page.drawText(
      'Subject: ' + fileData?.original_name,
      {
        x: x + 5,
        y: y - 40,
        size: 11,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    const launcher: any = await this.getFlowLauncher(fileData.approval_history);

    page.drawText(
      'Envelope Originator: ' + launcher?.first_name + ' ' + launcher?.last_name,
      {
        x: x + 5,
        y: y - 55,
        size: 11,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );
  }

  async drawSignedApproval(page: PDFPage, approval: any, fonts: any) {

    await this.drawSignature(page, approval, fonts);

    await this.drawApprovalDetails(page, approval, fonts);
  }

  async drawPendingApproval(page: PDFPage, approval: any, fonts: any) {

    const { x, y } = page.getPosition();

    page.drawText(
      approval._assigned_to.first_name + ' ' + approval._assigned_to.last_name + ' needs to sign',
      {
        x: x,
        y: y,
        size: 10,
        font: fonts.helvetica,
        color: rgb(0, 0.4, 1),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );
  }

  async drawSignature(page: PDFPage, approval: any, fonts: any) {
    const { x, y } = page.getPosition();

    page.drawLine({
      start: { x: x, y: y },
      end: { x: x, y: (y - 45) },
      thickness: 2,
      color: rgb(0, 0.4, 1),
      //opacity: 0.75,
    });

    page.drawText(
      'OctoSigned by:',
      {
        x: x + 10,
        y: y - 10,
        size: 11,
        font: fonts.helvetica,
        color: rgb(0.6, 0.6, 0.6),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    page.drawText(
      approval._assigned_to.first_name + ' ' + approval._assigned_to.last_name,
      {
        x: x + 10,
        y: y - 30,
        size: 18,
        font: fonts.helvetica,
        color: rgb(0, 0.4, 1),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    page.drawText(
      'CryptoSignatureCode',
      {
        x: x + 10,
        y: y - 44,
        size: 12,
        font: fonts.helvetica,
        color: rgb(0.6, 0.6, 0.6),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );
  }

  async drawApprovalDetails(page: PDFPage, approval: any, fonts: any) {
    const { x, y } = page.getPosition();

    page.drawText(
      approval._assigned_to.first_name + ' ' + approval._assigned_to.last_name + ': ' + approval._assigned_to.email,
      {
        x: x + 200,
        y: y - 10,
        size: 14,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    page.drawText(
      'Signed on: ' + moment.utc(approval.approval_date).format("MMM DD, yyyy HH:MM"),
      {
        x: x + 200,
        y: y - 25,
        size: 14,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );

    page.drawText(
      'Security Level: Email code, Account Authentication',
      {
        x: x + 200,
        y: y - 40,
        size: 14,
        font: fonts.helvetica,
        color: rgb(0.2, 0.2, 0.2),
        //maxWidth: width,
        //rotate: degrees(-45),
      }
    );
  }

  isApprovalFlowCompleted(flow) {
    for (let i = 0; i < flow.length; i++) {
      if (!flow[i].confirmed || !flow[i].confirmation_date) {
        return false;
      }
    }
    return true
  }

  async getFlowLauncher(histories: any) {
    histories = await this.sortFilterHistory(histories, 'launch');
    return histories[0]._actor;
  }

  /**
   *
   * @param history Filter the approval history by action, and sorted them by approval_date
   * @param action
   * @returns
   */
  sortFilterHistory(histories: any, action: string) {
    histories = histories.filter(h => h.action == action);
    return histories?.sort((a1, a2) => {
      if (a1.approval_date && a2.approval_date) {
        if (moment.utc(a1.approval_date).isBefore(a2.approval_date)) {
          return 1;
        } else {
          return -1;
        }
      } else {
        if (a1.approval_date && !a2.approval_date) {
          return 1;
        } else if (!a1.approval_date && a2.approval_date) {
          return -1;
        }
      }

    })
  }
}
