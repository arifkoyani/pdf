import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';
import { FlipWords } from "../../ui/flip-words/flip-words";

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';

const PdfToJsonConverter = () => {
  const words = ["Better", "Fast", "Perfect", "Json"];
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
      const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/json2', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          pages: "",
          password: "",
          profiles: JSON.stringify({
            "OCRImagePreprocessingFilters.AddGrayscale()": [],
            "OCRImagePreprocessingFilters.AddGammaCorrection()": [1.4]
          })
        }),
      });

      const data = await response.json();

      if (data.error === false) {
        // FIX: Use data.url (singular) instead of data.urls (plural)
        setConvertedFileUrls([data.url]);
        setState('ready');
      } else {
        setState('select');
      }
    } catch (error) {
      setState('select');
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
      // noop: optionally show a toast here
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
    <div className="min-h-[calc(100vh-84px)] bg-gradient-subtle flex items-center justify-center px-6">
      <Card className="w-full  max-w-2xl p-8 shadow-elegant border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-1">
          {/* Header */}
          <div className="space-y-4">

          <div className='pb-20'>
              <div className="h-[4rem] flex justify-center items-center px-4">
                <div className="flex flex-wrap justify-center py-1  items-center mx-auto text-neutral-600 dark:text-neutral-400 
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl  gap-2">Convert To
                  <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                    <FlipWords words={words} />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">Convert your PDF files to high-quality JSON Formats</p>
            </div>
          
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div
                className="border-2 flex items-center  p-4 space-x-4  shadow-lg rounded-xl px-12 hover:border-primary/50 transition-all transform hover:scale-105 transition-all duration-600 text-lg  cursor-pointer bg-[#f16625]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-white" />
                <h3 className="text-xl font-semibold text-white ">
                  Choose PDF File
                </h3>
                <p className="text-white">
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
                    onClick={() => downloadFile(url, `converted-${index + 1}.json`)}
                    className="w-full bg-gradient-primary shadow-xl  transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download JSON File
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

export default PdfToJsonConverter;