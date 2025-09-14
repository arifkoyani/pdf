import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload, X, Download, FileText, File, Search } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2 } from 'lucide-react';

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = 'select' | 'uploading' | 'processing' | 'ready';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface SearchableResult {
  url: string;
  name: string;
}

const NotSearchablePdf = () => {
  const words = ["unSearchable", "OCR-Ready", "Text-Enabled", "OCR-PDF"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [searchableResult, setSearchableResult] = useState<SearchableResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState('Making PDF searchable...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    return <File className="w-5 h-5 text-red-500" />;
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['application/pdf'];
    const validExtensions = ['pdf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        uploadFile(file);
      } else {
        alert('Please select a PDF file (.pdf)');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString();
    setCurrentlyUploading(fileId);
    setState('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + Math.random() * 30;
        });
      }, 150);

      const response = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: formData,
      });

      const data = await response.json();
      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (data.error === false) {
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type
        };
        
        setUploadedFiles([newFile]);
        // Automatically process the file after upload
        processUnSearchablePdf(data.url, file.name);
      } else {
        setState('select');
        setUploadProgress(0);
        alert(`Upload failed: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setState('select');
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    } finally {
      setCurrentlyUploading(null);
    }
  };

  const processUnSearchablePdf = async (fileUrl: string, fileName: string) => {
    setState('processing');
    setProcessingMessage('Making PDF unsearchable with OCR...');
    
    try {
      const response = await fetch('https://api.pdf.co/v1/pdf/makeunsearchable', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          lang: "eng",
          pages: "",
          name: `unsearchablePDF-${fileName}`,
          password: "",
          async: "false",
          profiles: ""
        }),
      });

      const data = await response.json();
      
      if (data.error === false && data.url) {
        const result: SearchableResult = {
          url: data.url,
          name: `searchable-${fileName}`
        };
        
        setSearchableResult(result);
        setState('ready');
      } else {
        console.error('PDF searchable conversion failed:', data);
        alert(`PDF conversion failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('PDF conversion failed. Please try again.');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFiles([]);
    setSearchableResult(null);
    setProcessingMessage('Making PDF searchable...');
    setDownloading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadFile = async (url: string, filename: string) => {
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Every tool you need to work with Documents in one place
        </h1>
      </div>

      <div className='pb-10 flex flex-col justify-center items-center'>
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Make PDF Files
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Make PDF UnSearchable</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium text-center">
        This method converts PDF files into a “text unsearchable” version by converting your PDF into a “scanned” PDF file which is effectively a flat image.
        </p>
      </div>

      <Card className="w-full max-w-4xl p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-6">
          
          {/* Upload Section */}
          {state === 'select' && (
            <div className="space-y-6">
              <div
                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625] transition-all hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-white" />
                <h3 className="text-xl font-semibold text-white">Choose PDF File</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Supported: PDF (PDF Format)
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {state === 'uploading' && (
            <div className="space-y-4">
              <Progress value={uploadProgress} className="h-4" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {Math.round(uploadProgress)}% uploaded
              </p>
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">{processingMessage}</p>
              <p className="text-sm text-blue-600">
                Running OCR and adding unsearchable layer to your PDF...
              </p>
            </div>
          )}

          {/* Ready State - Download Searchable PDF */}
          {state === 'ready' && searchableResult && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">✅ Successfully created unsearchable PDF with OCR!</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-left">UnSearchable PDF Result:</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{searchableResult.name}</p>
                      <p className="text-xs text-muted-foreground">OCR-enabled unsearchable PDF</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => downloadFile(searchableResult.url, searchableResult.name)}
                      disabled={downloading}
                      className="bg-[#f16625] hover:bg-[#e55d1d] text-white"
                      size="sm"
                    >
                      {downloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(searchableResult.url)}
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-4">
                Convert Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotSearchablePdf;