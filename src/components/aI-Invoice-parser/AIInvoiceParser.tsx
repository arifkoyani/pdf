import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload, Download, FileText } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2 } from 'lucide-react';
import SendPdfEmail from '@/components/send-email/SendEmail';

const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m";

type AppState = 'select' | 'uploading' | 'processing' | 'checking' | 'ready';

interface InvoiceData {
  business_information: {
    business_name: string;
    street_address_line_01: string;
    street_address_line_02: string;
    phone_number: string;
    email_address: string;
    website: string;
  };
  invoice_details: {
    invoice_number: string;
    invoice_date: string;
    due_date: string;
  };
  customer_information: {
    customer_name: string;
    street_address_line_01: string;
    street_address_line_02: string;
  };
  summary: {
    subtotal: string;
    discount: string;
    tax_rate: string;
    tax: string;
    total: string;
  };
  payment_terms: {
    terms: string;
    late_fee: string;
  };
  conditions_instructions: {
    text: string;
  };
  lineItems: Array<{
    service: string;
    description: string;
    quantity_hours: string;
    rate: string;
    amount: string;
  }>;
}

const AIInvoiceParser = () => {
  const words = ["Smart", "Fast", "Accurate", "Advanced"];
  const [state, setState] = useState<AppState>('select');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [jobId, setJobId] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toEmail, setToEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedLanguages = [
    "Albanian (Shqip)", "Bosnian (Bosanski)", "Bulgarian (Български)", "Croatian (Hrvatski)", 
    "Czech (Čeština)", "Danish (Dansk)", "Dutch (Nederlands)", "English", "Estonian (Eesti)", 
    "Finnish (Suomi)", "French (Français)", "German (Deutsch)", "Greek (Ελληνικά)", 
    "Hungarian (Magyar)", "Icelandic (Íslenska)", "Italian (Italiano)", "Latvian (Latviešu)", 
    "Lithuanian (Lietuvių)", "Norwegian (Norsk)", "Polish (Polski)", "Portuguese (Português)", 
    "Romanian (Română)", "Russian (Русский)", "Serbian (Српски)", "Slovak (Slovenčina)", 
    "Slovenian (Slovenščina)", "Spanish (Español)", "Swedish (Svenska)", "Turkish (Türkçe)", 
    "Ukrainian (Українська)"
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const uploadFile = async (file: File) => {
    setState('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY
        },
        body: formData,
      });

      const data = await response.json();
      if (data.error === false) {
        setUploadedFileUrl(data.url);
        await processInvoice(data.url);
      } else {
        setState('select');
        alert(`Upload failed: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setState('select');
      alert('Upload failed. Please try again.');
    }
  };

  const processInvoice = async (fileUrl: string) => {
    setState('processing');
    try {
      const payload = {
        url: fileUrl,
        callback: "https://example.com/callback/url/you/provided"
      };

      const response = await fetch('https://api.pdf.co/v1/ai-invoice-parser', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error === false && data.jobId) {
        setJobId(data.jobId);
        await checkJobStatus(data.jobId);
      } else {
        console.error('Invoice processing failed:', data);
        alert(`Processing failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
      setState('select');
    }
  };

  const checkJobStatus = async (currentJobId: string) => {
    setState('checking');
    try {
      const checkStatus = async (): Promise<void> => {
        const response = await fetch(`https://api.pdf.co/v1/job/check?jobid=${currentJobId}`, {
          method: 'GET',
          headers: {
            'x-api-key': API_KEY,
          },
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          setResultUrl(data.url);
          setInvoiceData(data.body);
          setState('ready');
        } else if (data.status === 'working') {
          // Continue checking after 2 seconds
          setTimeout(() => checkStatus(), 2000);
        } else {
          throw new Error(data.message || 'Job failed');
        }
      };

      await checkStatus();
    } catch (error) {
      console.error('Job check error:', error);
      alert('Failed to process invoice. Please try again.');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadedFileUrl('');
    setJobId('');
    setResultUrl('');
    setInvoiceData(null);
    setToEmail('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    } finally {
      setDownloadingIndex(null);
    }
  };

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  const renderInvoiceData = (data: InvoiceData) => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg space-y-4 text-left max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-3">Extracted Invoice Data:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-blue-600 mb-2">Business Information</h4>
            <p><strong>Name:</strong> {data.business_information.business_name || 'N/A'}</p>
            <p><strong>Address:</strong> {data.business_information.street_address_line_01 || 'N/A'}</p>
            <p><strong>Phone:</strong> {data.business_information.phone_number || 'N/A'}</p>
            <p><strong>Email:</strong> {data.business_information.email_address || 'N/A'}</p>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-green-600 mb-2">Invoice Details</h4>
            <p><strong>Number:</strong> {data.invoice_details.invoice_number || 'N/A'}</p>
            <p><strong>Date:</strong> {data.invoice_details.invoice_date || 'N/A'}</p>
            <p><strong>Due Date:</strong> {data.invoice_details.due_date || 'N/A'}</p>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-purple-600 mb-2">Customer Information</h4>
            <p><strong>Name:</strong> {data.customer_information.customer_name || 'N/A'}</p>
            <p><strong>Address:</strong> {data.customer_information.street_address_line_01 || 'N/A'}</p>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-red-600 mb-2">Summary</h4>
            <p><strong>Subtotal:</strong> {data.summary.subtotal || 'N/A'}</p>
            <p><strong>Tax:</strong> {data.summary.tax || 'N/A'}</p>
            <p><strong>Total:</strong> {data.summary.total || 'N/A'}</p>
          </div>
        </div>

        {data.lineItems && data.lineItems.length > 0 && (
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-orange-600 mb-2">Line Items</h4>
            <div className="space-y-2">
              {data.lineItems.map((item, idx) => (
                <div key={idx} className="text-sm border-b pb-1">
                  <strong>{item.service}:</strong> {item.description} - Qty: {item.quantity_hours}, Rate: {item.rate}, Amount: {item.amount}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          AI Invoice Parser - Process invoices faster than ever by extracting data and structuring it automatically with our advanced AI
        </h1>
      </div>

      <div className='pb-10 flex flex-col justify-center items-center'>
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Parse With
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Extract invoice data with AI precision</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium">
          Get quick and accurate data from any invoice, no matter the layout
        </p>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Supported Languages:</strong> {supportedLanguages.slice(0, 5).join(', ')} and {supportedLanguages.length - 5} more
          </p>
        </div>
      </div>

      <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm max-w-4xl w-full mx-4">
        <div className="text-center space-y-6">
          {state === 'select' && !uploadedFileUrl && (
            <div 
              className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-white" />
              <h3 className="text-xl font-semibold text-white">Choose PDF Invoice</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {state === 'uploading' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Uploading PDF invoice...
              </p>
            </div>
          )}

          {state === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">Starting AI invoice processing...</p>
            </div>
          )}

          {state === 'checking' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">Processing invoice with AI...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          )}

          {state === 'ready' && resultUrl && (
            <div className="space-y-6">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => downloadFile(resultUrl, "invoice-data.json", 0)}
                    disabled={downloadingIndex === 0}
                    className="flex-1 bg-[#f16625] shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto text-white rounded-xl"
                  >
                    {downloadingIndex === 0 ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download JSON Data
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(resultUrl, 0)}
                    title="Copy link"
                    className={copiedIndex === 0 ? "bg-green-500 text-white" : ""}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>

                <span className='flex gap-2'>
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                  />
                  <SendPdfEmail toEmail={toEmail} fileUrl={resultUrl} />
                </span>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-4">
                Parse Another Invoice
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AIInvoiceParser;