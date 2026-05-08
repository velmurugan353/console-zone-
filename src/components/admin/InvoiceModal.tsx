import { motion } from 'framer-motion';
import { Printer, Download, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { invoiceService, InvoiceData } from '../../services/invoiceService';

interface InvoiceModalProps {
  data: InvoiceData;
  onClose: () => void;
}

export default function InvoiceModal({ data, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    invoiceService.generatePDF(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto invoice-modal pt-12 pb-12">
      {/* Scaling Container */}
      <div className="w-full max-w-[210mm] origin-top transition-transform duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black w-full min-h-[297mm] p-8 md:p-[20mm] shadow-2xl relative print:p-[20mm] print:shadow-none mx-auto overflow-hidden"
          id="invoice-content"
        >
          {/* Close button for mobile (sticky/fixed to top right of content) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 print:hidden md:hidden z-50"
          >
            <X size={20} />
          </button>

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-black pb-8 mb-8 gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2 text-black">
                Console<span className="text-gaming-accent">Zone</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Premium Gaming Marketplace</p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-black">
                {data.type} Invoice
              </h2>
              <p className="text-sm font-mono font-bold">#{data.invoiceNumber}</p>
              <p className="text-xs text-gray-500 mt-1">{data.date}</p>
            </div>
          </div>

          {/* Client & Vendor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Billed To:</h3>
              <p className="font-bold text-lg uppercase text-black">{data.customerName}</p>
              <p className="text-sm text-gray-600">{data.customerEmail}</p>
              <p className="text-sm text-gray-600">{data.customerPhone}</p>
              <p className="text-xs text-gray-500 mt-2 max-w-[250px] uppercase">{data.customerAddress}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Service Provider:</h3>
              <p className="font-bold text-lg text-black">CONSOLEZONE PVT LTD</p>
              <p className="text-sm text-gray-600">123 Tech District, Gaming Hub</p>
              <p className="text-sm text-gray-600">GSTIN: 29AAAAA0000A1Z5</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-12 overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
                  <th className="py-4 text-black">Item Description</th>
                  <th className="py-4 text-center text-black">Qty</th>
                  <th className="py-4 text-right text-black">Price</th>
                  <th className="py-4 text-right text-black">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold uppercase text-black">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-6">
                      <p className="text-black">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{item.description}</p>
                    </td>
                    <td className="py-6 text-center text-black">{item.quantity}</td>
                    <td className="py-6 text-right text-black">{formatCurrency(item.price)}</td>
                    <td className="py-6 text-right text-black">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-full sm:w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase">Subtotal</span>
                <span className="font-bold text-black">{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase">Shipping</span>
                <span className="font-bold text-emerald-600">{data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase">GST (Included)</span>
                <span className="font-bold text-black">{formatCurrency(data.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-black border-t-2 border-black pt-3">
                <span className="uppercase italic text-black">Total Amount</span>
                <span className="text-black">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-100 pt-8 mt-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Payment Reference</h4>
                <p className="text-xs font-mono text-black">GATEWAY: {data.paymentMethod}</p>
                {data.notes && <p className="text-xs font-mono mt-1 text-gray-500">NOTES: {data.notes}</p>}
              </div>
              <div className="sm:text-right">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notice</h4>
                <p className="text-[9px] leading-relaxed text-gray-500 uppercase">This is a computer generated invoice and does not require a physical signature. Returns accepted within 7 days for new products.</p>
              </div>
            </div>
          </div>

          {/* Buttons (Hidden on Print) */}
          <div className="mt-12 flex flex-wrap justify-end gap-4 print:hidden">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={14} />
              Close
            </button>
            <button 
              onClick={handleDownload}
              className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button 
              onClick={handlePrint}
              className="px-6 py-2 bg-gaming-accent text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#9333EA] flex items-center gap-2 shadow-lg shadow-gaming-accent/20"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

