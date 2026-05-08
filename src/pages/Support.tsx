import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Support() {
  const [formData, setSubmissionData] = useState({
    customerName: '',
    email: '',
    message: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const data = new FormData();
    data.append('customerName', formData.customerName);
    data.append('email', formData.email);
    data.append('message', formData.message);
    if (photo) data.append('photo', photo);
    if (document) data.append('document', document);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        setStatus('success');
        setSubmissionData({ customerName: '', email: '', message: '' });
        setPhoto(null);
        setDocument(null);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">
          Customer <span className="text-gaming-accent">Support</span>
        </h1>
        <p className="text-gray-400">Upload your documents and photos below.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0c021a] border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        {status === 'success' ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Submission Successful!</h2>
            <p className="text-gray-400 mb-6">We've received your information and files.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="px-6 py-2 bg-gaming-accent text-white rounded-xl font-bold uppercase text-xs"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setSubmissionData({...formData, customerName: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gaming-accent outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setSubmissionData({...formData, email: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gaming-accent outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
              <textarea 
                rows={4}
                value={formData.message}
                onChange={(e) => setSubmissionData({...formData, message: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gaming-accent outline-none transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Photo</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-gaming-accent/50 transition-colors bg-black/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-gray-500 mb-2" />
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        {photo ? photo.name : 'Upload Photo'}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Document / Form</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-gaming-accent/50 transition-colors bg-black/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-gray-500 mb-2" />
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        {document ? document.name : 'Upload Document'}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => setDocument(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-gaming-accent to-[#7000FF] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-gaming-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
