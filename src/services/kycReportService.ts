import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KYCData } from './kyc';

class KYCReportService {
  async generatePDF(data: KYCData & { id: string }) {
    try {
      const doc = new jsPDF();
      
      // Set Document Properties
      doc.setProperties({
        title: `KYC_Report_${data.fullName.replace(/\s+/g, '_')}`,
        subject: 'Identity Verification Report',
        author: 'ConsoleZone Compliance',
        keywords: 'kyc, verification, security',
        creator: 'ConsoleZone KYC Matrix'
      });

      // Colors
      const primaryColor: [number, number, number] = [168, 85, 247]; // #D866FF
      const darkColor: [number, number, number] = [17, 17, 17];
      const grayColor: [number, number, number] = [107, 114, 128];

      // Header
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ConsoleZone', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('IDENTITY VERIFICATION SYSTEM', 20, 28);

      doc.setFontSize(18);
      doc.text(`KYC DOSSIER`, 190, 25, { align: 'right' });

      // Dossier Info
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('USER UUID:', 140, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(data.id || 'N/A', 170, 50);

      doc.setFont('helvetica', 'bold');
      doc.text('STATUS:', 140, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(data.status || 'PENDING', 170, 56);

      doc.setFont('helvetica', 'bold');
      doc.text('DATE:', 140, 62);
      doc.setFont('helvetica', 'normal');
      const rawDate = data.submittedAt;
      const subDate = rawDate ? new Date(rawDate).toLocaleDateString() : 'N/A';
      doc.text(subDate, 170, 62);

      // Profile Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PERSONNEL PROFILE:', 20, 50);
      
      doc.setFontSize(10);
      doc.text('FULL NAME:', 20, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(data.fullName || 'N/A', 60, 60);

      doc.setFont('helvetica', 'bold');
      doc.text('PHONE:', 20, 66);
      doc.setFont('helvetica', 'normal');
      doc.text(data.phone || 'N/A', 60, 66);

      doc.setFont('helvetica', 'bold');
      doc.text('DRIVING LICENSE:', 20, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(data.drivingLicenseNumber || 'N/A', 60, 72);

      doc.setFont('helvetica', 'bold');
      doc.text(`${data.secondaryIdType || 'SECONDARY ID'}:`, 20, 78);
      doc.setFont('helvetica', 'normal');
      doc.text(data.secondaryIdNumber || 'N/A', 60, 78);

      doc.setFont('helvetica', 'bold');
      doc.text('ADDRESS:', 20, 84);
      doc.setFont('helvetica', 'normal');
      const addressText = data.address || 'N/A';
      const splitAddress = doc.splitTextToSize(addressText, 130);
      doc.text(splitAddress, 60, 84);

      // trust score section
      const trustY = 84 + (splitAddress.length * 5);
      doc.setFont('helvetica', 'bold');
      doc.text('TRUST SCORE:', 20, trustY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.trustScore || 0}%`, 60, trustY);

      // Agent Findings Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('AUTOMATED AGENT ANALYSIS:', 20, trustY + 15);

      const agentRows = data.agentReports?.map(r => [
        r.agentName || 'N/A',
        r.status || 'N/A',
        r.message || 'N/A'
      ]) || [['N/A', 'N/A', 'No agent reports found']];

      autoTable(doc, {
        head: [['Agent Name', 'Status', 'Message']],
        body: agentRows,
        startY: trustY + 20,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 'auto' }
        }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 150;

      // Admin Notes Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ADMINISTRATIVE NOTES:', 20, finalY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const notes = data.adminNotes || 'No administrative notes recorded.';
      const splitNotes = doc.splitTextToSize(notes, 170);
      doc.text(splitNotes, 20, finalY + 25);

      if (data.verifiedBy) {
          doc.setFont('helvetica', 'bold');
          doc.text(`VERIFIED BY: ${data.verifiedBy}`, 20, finalY + 25 + (splitNotes.length * 5) + 5);
      }

      // Evidence Section (Clickable Links)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('EVIDENCE LINKS (CLICK TO OPEN):', 20, finalY + 50);
      
      doc.setFontSize(10);
      doc.setTextColor(168, 85, 247); // #D866FF

      const addLink = (label: string, url: string, y: number) => {
        doc.text(`${label}:`, 20, y);
        if (url && url !== 'N/A' && url !== '') {
          // Ensure the URL is absolute to prevent PDF link corruption or file:// resolution
          let validUrl = url;
          if (validUrl.startsWith('/')) {
             validUrl = `${window.location.origin}${validUrl}`;
          }
          // URL should already be encoded by normalizeKYC, but double check
          try {
            validUrl = encodeURI(decodeURI(validUrl));
          } catch(e) {}
          
          doc.textWithLink('OPEN_FILE', 60, y, { url: validUrl });
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('NOT_AVAILABLE', 60, y);
          doc.setTextColor(168, 85, 247);
        }
      };

      addLink('ID Front', data.idFrontUrl || '', finalY + 60);
      addLink('ID Back', data.idBackUrl || '', finalY + 66);
      addLink('Selfie', data.selfieUrl || '', finalY + 72);
      addLink('Liveness Video', data.selfieVideoUrl || '', finalY + 78);

      // Footer
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('This is a highly confidential document. Unauthorized access is a violation of protocol.', 105, 280, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated by ConsoleZone Matrix on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

      // Save PDF with sanitized filename
      const safeName = (data.fullName || 'User').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`KYC_Dossier_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      throw err;
    }
  }
}

export const kycReportService = new KYCReportService();
