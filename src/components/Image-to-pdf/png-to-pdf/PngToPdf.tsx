import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';

const PngToPdfConverter = () => {
  const words = ["Better", "Fast", "Perfect", "Pdf"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png')) {
      uploadFile(file);
    } else {
      alert('Please select a valid image file PNG');
    }
  };

  const uploadFile = async (file: File) => {
    setState('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      const response = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
        },
        body: formData,
      });

      const data = await response.json();

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (data.error === false) {
        setUploadedFileUrl(data.url);
        setTimeout(() => {
          convertImageToPdf(data.url);
        }, 500);
      } else {
        setState('select');
        setUploadProgress(0);
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setState('select');
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  const convertImageToPdf = async (fileUrl: string) => {
    setState('converting');

    try {
      const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/image', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          pages: "",
          password: ""
        }),
      });

      const data = await response.json();

      if (data.error === false) {
        const urls = Array.isArray(data.urls)
          ? data.urls
          : (typeof data.url === 'string' && data.url.length > 0)
            ? [data.url]
            : [];

        if (urls.length > 0) {
          setConvertedFileUrls(urls);
          setState('ready');
        } else {
          setState('select');
          alert('Conversion failed. Please try again.');
        }
      } else {
        setState('select');
        alert('Conversion failed. Please try again.');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setState('select');
      alert('Conversion failed. Please try again.');
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Download error:', e);
      alert('Download failed. Please try again.');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setConvertedFileUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f5edf0]   flex flex-col items-center  justify-start">
       
        <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF]  px-4 py-5 mb-5">
      <div className="flex items-center justify-center gap-3 text-white">
        <div className="flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/30">
          </div>
        </div>
        <h1 className="text-sm text-black font-medium text-center">
  Every tool you need to work with PDFs in one place
        </h1>
      </div>
    </div>
    <div className='pb-10'>
              <div className="h-[4rem]  flex justify-center items-center px-4">
                <div className="flex flex-wrap justify-center py-1  items-center mx-auto text-neutral-600 dark:text-neutral-400 
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl  gap-2">Convert To
                  <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                    <FlipWords words={words} />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">Convert your PNG images to high-quality PDF documents</p>
            </div>
    
      <Card className="h-fit p-8 shadow-elegant border-0  backdrop-blur-sm">
        <div className="text-center space-y-1 ">
          {/* Header */}
          <div className="space-y-4 ">

         
            {/* <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Upload className="w-10 h-10 text-white" />
            </div> */}
          
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div
                className="border-2 flex items-center justify-center space-x-6 p-4  border-border border-[#ff7525] shadow-lg rounded-xl px-12 hover:border-primary/50 transition-all transform hover:scale-100 transition-all duration-600 text-lg  cursor-pointer bg-[#f16625]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 flex gap-4 justify-center  text-white" />
                <h3 className="text-xl font-semibold text-white ">
                  Choose PNG Image
                </h3>
              
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.tiff,.tif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {state === 'uploading' && (
              <div className="space-y-4">
                <div className="w-full max-w-md mx-auto">
                  <Progress value={uploadProgress} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                </div>
              </div>
            )}

            {state === 'converting' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-muted-foreground">Converting image to PDF...</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-4">
                {convertedFileUrls.map((url, index) => (
                  <Button
                    key={index}
                    onClick={() => downloadFile(url, `converted-image-${index + 1}.pdf`)}
                    className="w-full bg-gradient-primary shadow-xl  transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF {index + 1}
                  </Button>
                ))}

                <Button
                  onClick={resetConverter}
                  variant="outline"
                  className="mt-4"
                >
                  Convert Another Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PngToPdfConverter;