import { useState, useRef } from 'react';
import { X, Link as LinkIcon, List, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: (domains: string[], file?: File) => void;
}

type AnalyzeMode = 'single' | 'multiple' | 'csv';

export function AnalyzeDialog({ open, onOpenChange, onAnalyze }: AnalyzeDialogProps) {
  const [mode, setMode] = useState<AnalyzeMode>('single');
  const [singleDomain, setSingleDomain] = useState('');
  const [multipleDomains, setMultipleDomains] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'single' && singleDomain.trim()) {
      onAnalyze([singleDomain.trim()]);
      setSingleDomain('');
      onOpenChange(false);
    } else if (mode === 'multiple' && multipleDomains.trim()) {
      const domains = multipleDomains
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
      if (domains.length > 0) {
        onAnalyze(domains);
        setMultipleDomains('');
        onOpenChange(false);
      }
    } else if (mode === 'csv' && file) {
      onAnalyze([], file);
      setFile(null);
      onOpenChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    }
  };

  const isValid =
    (mode === 'single' && singleDomain.trim()) ||
    (mode === 'multiple' && multipleDomains.trim()) ||
    (mode === 'csv' && file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-6 border border-white/80"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
          Analyze Companies
        </h2>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              mode === 'single'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-700 shadow-md shadow-blue-500/20'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white/60'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Single URL</span>
          </button>
          <button
            onClick={() => setMode('multiple')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              mode === 'multiple'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-700 shadow-md shadow-blue-500/20'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white/60'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">Multiple URLs</span>
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              mode === 'csv'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-700 shadow-md shadow-blue-500/20'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload CSV</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Single URL Mode */}
          {mode === 'single' && (
            <div className="mb-6">
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                Company Domain
              </label>
              <input
                id="domain"
                type="text"
                value={singleDomain}
                onChange={(e) => setSingleDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all bg-white/60 backdrop-blur-sm"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the company's website domain (without http://)
              </p>
            </div>
          )}

          {/* Multiple URLs Mode */}
          {mode === 'multiple' && (
            <div className="mb-6">
              <label htmlFor="domains" className="block text-sm font-medium text-gray-700 mb-2">
                Company Domains
              </label>
              <textarea
                id="domains"
                value={multipleDomains}
                onChange={(e) => setMultipleDomains(e.target.value)}
                placeholder="example1.com&#10;example2.com&#10;example3.com"
                rows={8}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all font-mono text-sm bg-white/60 backdrop-blur-sm"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter one domain per line
              </p>
            </div>
          )}

          {/* CSV Upload Mode */}
          {mode === 'csv' && (
            <div className="mb-6">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/30 transition-all backdrop-blur-sm"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drop CSV file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">
                Expected format: CSV with a "domain" column
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Start Analysis
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}