import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload, Plus, X, Download, FileText, File, Image, Archive, Send } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2 } from 'lucide-react';
import SendPdfEmail from '../../send-email/SendEmail'; // Import the email component

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = 'select' | 'uploading' | 'merging' | 'processing' | 'ready';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

const PngsToPdf = () => {
  const words = ["Professional", "Merged", "Perfect", "Formatted"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mergedFileUrl, setMergedFileUrl] = useState('');
  const [downloadingMerged, setDownloadingMerged] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState('Merging images to PDF...');
  const [toEmail, setToEmail] = useState(''); // State for recipient email
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    if (['png'].includes(extension || '') || fileType.includes('image')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'image/png'
    ];
    
    const validExtensions = ['png'];
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
        alert('Please select a valid image file (PNG)');
      }
    }
    // Reset the input so the same file can be selected again
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
        
        setUploadedFiles(prev => [...prev, newFile]);
        setState('select');
        setUploadProgress(0);
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

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (uploadedFiles.length === 1) {
      // If removing the last file, reset the state
      setState('select');
      setMergedFileUrl('');
    }
  };

  const mergeImagesToPdf = async () => {
    if (uploadedFiles.length < 1) {
      alert('Please upload at least 1 image to merge');
      return;
    }

    setState('merging');
    setProcessingMessage('Merging images to PDF...');
    
    try {
      // Create a comma-separated string of all image URLs
      const urlsString = uploadedFiles.map(file => file.url).join(',');
      
      const response = await fetch('https://api.pdf.co/v1/pdf/merge2', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlsString,
          async: false
        }),
      });

      const data = await response.json();
      
      if (data.error === false && data.url) {
        console.log('Merge completed successfully.');
        setMergedFileUrl(data.url);
        setState('ready');
      } else {
        console.error('Image merge failed:', data);
        alert(`Image merge failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Merge error:', error);
      alert('Image merge failed. Please try again.');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFiles([]);
    setMergedFileUrl('');
    setProcessingMessage('Merging images to PDF...');
    setToEmail(''); // Reset email field
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadMergedFile = async () => {
    setDownloadingMerged(true);
    try {
      const response = await fetch(mergedFileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "merged-images.pdf";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    } finally {
      setDownloadingMerged(false);
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
            Merge Images To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Merge Multiple Images into a Single PDF</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium text-center">
          Combine your PNG images into a single PDF document.
        </p>
      </div>

      <Card className="w-full max-w-4xl p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-6">
          
          {/* Upload Section */}
          {(state === 'select' || uploadedFiles.length > 0) && !mergedFileUrl && state !== 'merging' && (
            <div className="space-y-6">
              <div
                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625] transition-all hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-white" />
                <h3 className="text-xl font-semibold text-white">
                  {uploadedFiles.length === 0 ? 'Choose First Image' : 'Add Another Image'}
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Supported: PNG (Image Files)
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

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && !mergedFileUrl && state !== 'merging' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-left">Uploaded Images ({uploadedFiles.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name, file.type)}
                      <div className="text-left">
                        <p className="font-medium text-sm">{index + 1}. {file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(file.url)}
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Merge Button */}
              {uploadedFiles.length >= 1 && (
                <Button
                  onClick={mergeImagesToPdf}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 h-auto rounded-xl shadow-xl hover:scale-105 transition-all"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Merge {uploadedFiles.length} Image{uploadedFiles.length > 1 ? 's' : ''} to PDF
                </Button>
              )}
            </div>
          )}

          {/* Merging Process */}
          {state === 'merging' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">{processingMessage}</p>
              <p className="text-sm text-blue-600">
                This may take a few moments for image processing and merging...
              </p>
            </div>
          )}

          {/* Ready State - Download Merged File */}
          {state === 'ready' && mergedFileUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">✅ Successfully merged {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} into PDF!</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={downloadMergedFile}
                  disabled={downloadingMerged}
                  className="flex-1 bg-[#f16625] shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto text-white rounded-xl"
                >
                  {downloadingMerged ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Merged PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(mergedFileUrl)}
                  title="Copy link"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>

              {/* Email Input and Send Button */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Send PDF via Email</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                  />
                  <SendPdfEmail toEmail={toEmail} fileUrl={mergedFileUrl} />
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-4">
                Merge More Images
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PngsToPdf;