import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../lib/utils';

// Extending jsPDF with autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export interface InvoiceData {
  type: 'Rental' | 'Order' | 'Repair' | 'Buyback';
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

class InvoiceService {
  generatePDF(data: InvoiceData) {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Set Document Properties
    doc.setProperties({
      title: `Invoice_${data.invoiceNumber}`,
      subject: 'Invoice from ConsoleZone',
      author: 'ConsoleZone Admin',
      keywords: 'invoice, consolezone, gaming',
      creator: 'ConsoleZone Invoice Generator'
    });

    // Colors
    const primaryColor = [168, 85, 247]; // #D866FF
    const darkColor = [17, 17, 17];
    const grayColor = [107, 114, 128];

    // Header
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ConsoleZone', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PREMIUM GAMING MARKETPLACE', 20, 28);

    doc.setFontSize(18);
    doc.text(`${data.type.toUpperCase()} INVOICE`, 190, 25, { align: 'right' });

    // Invoice Info
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE NO:', 140, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(data.invoiceNumber, 170, 50);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 140, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date, 170, 56);

    // Bill To Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BILL TO:', 20, 50);
    
    doc.setFontSize(10);
    doc.text(data.customerName, 20, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerEmail, 20, 64);
    doc.text(data.customerPhone, 20, 70);
    
    // Split address if too long
    const splitAddress = doc.splitTextToSize(data.customerAddress, 80);
    doc.text(splitAddress, 20, 76);

    // Company Info
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 140, 70);
    doc.setFont('helvetica', 'normal');
    doc.text('ConsoleZone Pvt Ltd', 140, 76);
    doc.text('123 Tech District', 140, 82);
    doc.text('Gaming Hub, India', 140, 88);
    doc.text('GSTIN: 29AAAAA0000A1Z5', 140, 94);

    // Table
    const tableColumn = ["Item", "Description", "Qty", "Price", "Total"];
    const tableRows = data.items.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.total)
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, finalY + 15);
    doc.text(formatCurrency(data.subtotal), 190, finalY + 15, { align: 'right' });

    doc.text('Shipping:', 140, finalY + 22);
    doc.text(data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping), 190, finalY + 22, { align: 'right' });

    doc.text('Tax (GST):', 140, finalY + 29);
    doc.text(formatCurrency(data.tax), 190, finalY + 29, { align: 'right' });

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(135, finalY + 35, 60, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, finalY + 41);
    doc.text(formatCurrency(data.total), 190, finalY + 41, { align: 'right' });

    // Footer
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(8);
    doc.text('Payment Method: ' + data.paymentMethod, 20, finalY + 15);
    if (data.notes) {
      doc.text('Notes: ' + data.notes, 20, finalY + 22);
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing ConsoleZone - Your Gaming Universe!', 105, 280, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer generated invoice and does not require a physical signature.', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${data.invoiceNumber}.pdf`);
  }

  formatOrderData(order: any): InvoiceData {
    return {
      type: order.items.some((i: any) => i.type === 'rent') ? 'Rental' : 'Order',
      invoiceNumber: order.id.replace('ORD-', 'INV-'),
      date: order.date,
      customerName: order.customer,
      customerEmail: order.email,
      customerPhone: order.phone,
      customerAddress: order.shippingAddress,
      items: order.items.map((item: any) => ({
        name: item.name,
        description: item.type === 'rent' ? `Rental for ${item.rentalDuration} days` : 'Purchase',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: order.total, // Simplified
      tax: 0,
      shipping: 0,
      total: order.total,
      paymentMethod: order.paymentMethod,
      notes: order.internalNotes
    };
  }

  formatRentalData(rental: any): InvoiceData {
    return {
      type: 'Rental',
      invoiceNumber: rental.id.replace('R-', 'INV-R-'),
      date: rental.startDate,
      customerName: rental.user,
      customerEmail: rental.email,
      customerPhone: rental.phone,
      customerAddress: 'N/A - Digital/In-store Pickup', // Rentals might not have address in some cases
      items: [
        {
          name: rental.product,
          description: `Rental from ${rental.startDate} to ${rental.endDate}`,
          quantity: 1,
          price: rental.totalPrice,
          total: rental.totalPrice
        },
        {
          name: 'Security Deposit',
          description: 'Refundable after inspection',
          quantity: 1,
          price: rental.deposit,
          total: rental.deposit
        }
      ],
      subtotal: rental.totalPrice + rental.deposit,
      tax: 0,
      shipping: 0,
      total: rental.totalPrice + rental.deposit + (rental.lateFees || 0),
      paymentMethod: 'Prepaid',
      notes: rental.internalNotes
    };
  }

  formatSellRequestData(request: any): InvoiceData {
    const finalAmount = request.adminOffer || request.estimatedValue;
    return {
      type: 'Buyback',
      invoiceNumber: request.id.replace('SELL-', 'INV-S-'),
      date: request.date,
      customerName: request.customer,
      customerEmail: request.email,
      customerPhone: request.phone || 'N/A',
      customerAddress: 'N/A - Buyback Acquisition',
      items: [
        {
          name: request.device,
          description: `Buyback Acquisition - Condition: ${request.condition}`,
          quantity: 1,
          price: finalAmount,
          total: finalAmount
        }
      ],
      subtotal: finalAmount,
      tax: 0,
      shipping: 0,
      total: finalAmount,
      paymentMethod: 'Bank Transfer / Store Credit',
      notes: `Asset Acquisition Protocol. Original Condition: ${request.condition}`
    };
  }

  formatRepairData(repair: any): InvoiceData {
    return {
      type: 'Repair',
      invoiceNumber: repair.id.replace('REP-', 'INV-RP-'),
      date: repair.date,
      customerName: repair.customer,
      customerEmail: repair.email,
      customerPhone: 'N/A',
      customerAddress: 'N/A - Repair Service',
      items: [
        {
          name: `${repair.device} Repair`,
          description: `Service Issue: ${repair.issue}`,
          quantity: 1,
          price: repair.estimatedCost || 0,
          total: repair.estimatedCost || 0
        }
      ],
      subtotal: repair.estimatedCost || 0,
      tax: 0,
      shipping: 0,
      total: repair.estimatedCost || 0,
      paymentMethod: 'Post-service / Online',
      notes: `Technician: ${repair.technician || 'Unassigned'}. Status: ${repair.status}`
    };
  }
}

export const invoiceService = new InvoiceService();

