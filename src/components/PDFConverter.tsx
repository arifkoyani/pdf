import React, { useState, useRef } from 'react';
import { Progress } from 'rsuite';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileImage, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_KEY = "arifkoyani@gmail.com_jgi1iuAknb0pom7bwbaKQglbwT7i3y7Zy1d0q2xGR0Jey37CryHdGtICIOO7qVAh";

type AppState = 'select' | 'uploading' | 'uploaded' | 'converting' | 'converted';

const PDFConverter = () => {
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      uploadFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
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
          setState('uploaded');
        }, 500);
        toast({
          title: "Upload successful",
          description: "Your PDF has been uploaded successfully.",
        });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      setState('select');
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertPDF = async () => {
    setState('converting');

    try {
      const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/jpg', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: uploadedFileUrl,
          pages: "",
          password: ""
        }),
      });

      const data = await response.json();

      if (data.error === false) {
        setConvertedFileUrls(data.urls);
        setState('converted');
        toast({
          title: "Conversion successful",
          description: `PDF converted to ${data.urls.length} image(s).`,
        });
      } else {
        throw new Error(data.message || 'Conversion failed');
      }
    } catch (error) {
      setState('uploaded');
      toast({
        title: "Conversion failed",
        description: "Failed to convert the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setConvertedFileUrls([]);
    setSelectedFile(null);
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
              <FileImage className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">PDF to Image</h1>
              <p className="text-muted-foreground text-lg">Convert your PDF files to high-quality images</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div className="space-y-6">
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-12 hover:border-primary/50 transition-all duration-300 cursor-pointer bg-accent/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Choose PDF File
                  </h3>
                  <p className="text-muted-foreground">
                    Click here or drag and drop your PDF file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {state === 'uploading' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    Uploading your PDF...
                  </h3>
                  <div className="max-w-md mx-auto">
                    <Progress.Line 
                      percent={uploadProgress} 
                      strokeColor="#f16625"
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state === 'uploaded' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Upload Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Your PDF is ready to be converted to images
                  </p>
                </div>
                <Button 
                  onClick={convertPDF}
                  className="bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto"
                >
                  <FileImage className="w-5 h-5 mr-2" />
                  Convert to Images
                </Button>
              </div>
            )}

            {state === 'converting' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Converting PDF...
                  </h3>
                  <p className="text-muted-foreground">
                    Please wait while we convert your PDF to images
                  </p>
                </div>
              </div>
            )}

            {state === 'converted' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Download className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Conversion Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    {convertedFileUrls.length} image(s) ready for download
                  </p>
                </div>
                
                <div className="space-y-4">
                  {convertedFileUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      download={`page-${index + 1}.jpg`}
                      className="inline-flex items-center justify-center w-full bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300 text-white font-medium py-4 px-6 rounded-xl text-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Page {index + 1}
                    </a>
                  ))}
                </div>

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