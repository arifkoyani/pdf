import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';

const API_KEY = "arifkoyani@gmail.com_jgi1iuAknb0pom7bwbaKQglbwT7i3y7Zy1d0q2xGR0Jey37CryHdGtICIOO7qVAh";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';

const PDFConverter = () => {
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadFile(file);
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
          convertPDF(data.url);
        }, 500);
      } else {
        setState('select');
        setUploadProgress(0);
      }
    } catch (error) {
      setState('select');
      setUploadProgress(0);
    }
  };

  const convertPDF = async (fileUrl: string) => {
    setState('converting');

    try {
      const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/jpg', {
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
        setConvertedFileUrls(data.urls);
        setState('ready');
      } else {
        setState('select');
      }
    } catch (error) {
      setState('select');
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 shadow-elegant border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">PDF to Image</h1>
              <p className="text-muted-foreground text-lg">Convert your PDF files to high-quality images</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div 
                className="border-2 border-dashed border-border rounded-xl p-12 hover:border-primary/50 transition-all duration-300 cursor-pointer bg-accent/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Choose PDF File
                </h3>
                <p className="text-muted-foreground">
                  Click here to select your PDF file
                </p>
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
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-4">
                {convertedFileUrls.map((url, index) => (
                  <Button
                    key={index}
                    onClick={() => downloadFile(url, `page-${index + 1}.jpg`)}
                    className="w-full bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 h-auto"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Page {index + 1}
                  </Button>
                ))}
                
                <Button 
                  onClick={resetConverter}
                  variant="outline"
                  className="mt-4"
                >
                  Convert Another PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PDFConverter;