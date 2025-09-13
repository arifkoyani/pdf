import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload, Plus, X, Download, FileText } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2 } from 'lucide-react';

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = 'select' | 'uploading' | 'merging' | 'ready';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
}

const PdfsToPdf = () => {
  const words = ["Better", "Merged", "Perfect", "Combined"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mergedFileUrl, setMergedFileUrl] = useState('');
  const [downloadingMerged, setDownloadingMerged] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadFile(file);
    } else {
      alert('Please select a valid PDF file');
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
          size: formatFileSize(file.size)
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

  const mergePDFs = async () => {
    if (uploadedFiles.length < 2) {
      alert('Please upload at least 2 PDF files to merge');
      return;
    }

    setState('merging');
    
    try {
      const urlsString = uploadedFiles.map(file => file.url).join(',');
      
      const response = await fetch('https://api.pdf.co/v1/pdf/merge', {
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
        setMergedFileUrl(data.url);
        setState('ready');
      } else {
        console.error('PDF merge failed:', data);
        alert(`PDF merge failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Merge error:', error);
      alert('PDF merge failed. Please try again.');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFiles([]);
    setMergedFileUrl('');
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
      link.download = "merged-document.pdf";
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
          Every tool you need to work with PDFs in one place
        </h1>
      </div>

      <div className='pb-10 flex flex-col justify-center items-center'>
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Merge To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">PDF Merge Tool</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium">
          Merge multiple PDF files into a single PDF document.
        </p>
      </div>

      <Card className="w-full max-w-4xl p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-6">
          
          {/* Upload Section */}
          {(state === 'select' || uploadedFiles.length > 0) && !mergedFileUrl && (
            <div className="space-y-6">
              <div
                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625] transition-all hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-white" />
                <h3 className="text-xl font-semibold text-white">
                  {uploadedFiles.length === 0 ? 'Choose First PDF File' : 'Add Another PDF'}
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
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
          {uploadedFiles.length > 0 && !mergedFileUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-left">Uploaded Files ({uploadedFiles.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-500" />
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
              {uploadedFiles.length >= 2 && state !== 'merging' && (
                <Button
                  onClick={mergePDFs}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 h-auto rounded-xl shadow-xl hover:scale-105 transition-all"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Merge {uploadedFiles.length} PDF Files
                </Button>
              )}
              
              {uploadedFiles.length === 1 && (
                <p className="text-sm text-muted-foreground">
                  Add at least one more PDF file to start merging
                </p>
              )}
            </div>
          )}

          {/* Merging Process */}
          {state === 'merging' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">Merging PDF files...</p>
            </div>
          )}

          {/* Ready State - Download Merged File */}
          {state === 'ready' && mergedFileUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">✅ Successfully merged {uploadedFiles.length} PDF files!</p>
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

              <Button onClick={resetConverter} variant="outline" className="mt-4">
                Merge More PDFs
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PdfsToPdf;