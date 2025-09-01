import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2, Copy, Check } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';
type Classification = {
  class: string;
};

const PdfToTextClassifier = () => {
  const words = ["Better", "OCR", "Perfect", "Text"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
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
          processDocument(data.url);
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

  const processDocument = async (fileUrl: string) => {
    setState('converting');

    try {
      // Call both endpoints simultaneously
      const [classifierResponse, textResponse] = await Promise.all([
        // Document Classifier
        fetch('https://api.pdf.co/v1/pdf/classifier', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: fileUrl,
            async: false,
            inline: true,
            password: "",
            profiles: ""
          }),
        }),
        // Text Extractor
        fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: fileUrl,
            inline: true,
            async: false,
            profiles: JSON.stringify({
              "OCRImagePreprocessingFilters.AddGrayscale()": [],
              "OCRImagePreprocessingFilters.AddGammaCorrection()": [1.4]
            })
          }),
        })
      ]);

      const classifierData = await classifierResponse.json();
      const textData = await textResponse.json();

      if (classifierData.error === false && textData.error === false) {
        setClassifications(classifierData.body?.classes || []);
        setExtractedText(textData.body || '');
        setState('ready');
      } else {
        setState('select');
      }
    } catch (error) {
      setState('select');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setExtractedText('');
    setClassifications([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-subtle flex flex-col items-center justify-center px-6">
      <Card className="w-full max-w-4xl p-8 shadow-elegant border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-1">
          {/* Header */}
          <div className="space-y-4">
            <div className='pb-12'>
              <div className="h-[4rem] flex justify-center items-center px-4">
                <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 dark:text-neutral-400 
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">Convert To
                  <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                    <FlipWords words={words} />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">Convert your PDF and Images files to high-quality Text files</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div
                className="border-2 flex items-center p-4 space-x-4 shadow-lg rounded-xl px-12 hover:border-primary/50 transition-all transform hover:scale-105 transition-all duration-600 text-lg cursor-pointer bg-[#f16625]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-white" />
                <h3 className="text-xl font-semibold text-white">
                  Choose PDF or Image File
                </h3>
                <p className="text-white">
                  Click here to select your file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
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
                <p className="text-muted-foreground">Processing document with AI...</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-6">
                {/* Document Classifier Results */}
                {classifications.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">📄 Document Classifier - AI Recognition</h3>
                    <div className="flex flex-wrap gap-2">
                      {classifications.map((classification, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {classification.class}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Text */}
                {extractedText && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Extracted Text</h3>
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                        {extractedText}
                      </pre>
                    </div>
                  </div>
                )}

                <Button
                  onClick={resetConverter}
                  variant="outline"
                  className="mt-4"
                >
                  Convert Another File
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center justify-center w-full mt-8">
     
  <h2 className="text-2xl font-semibold mb-4 text-center">
    📄 Document Classifier - AI Recognition
  </h2>

  <p className="text-muted-foreground text-lg text-center max-w-2xl mb-6">
    The <strong>AI-powered Document Classifier</strong> automatically detects and classifies documents 
    based on content, layout, and keywords. Unlike simple text extraction, 
    it understands document type (invoice, receipt, contract, etc.) and applies the right template or rule. 
    This helps in <strong>faster automation, accurate sorting, and cleaner AI-powered text extraction</strong>, 
    improving workflow efficiency and SEO by targeting searches like 
    "AI PDF classifier" and "intelligent document recognition".
  </p>


        {/* FAQ Section */}
        <div className="w-full max-w-4xl py-6 px-4 rounded-2xl" style={{ backgroundColor: "#fef0e9" }}>
          <h3 className="text-xl font-bold text-center mb-3">
            Why PDF to Text by AI?
          </h3>
          <p className="text-lg text-center max-w-2xl mx-auto text-neutral-700">
            AI-powered PDF to text conversion is smarter because it doesn't just copy text. 
            It understands document structure, classifies content types, and produces cleaner text that is 
            more useful for analysis and automation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfToTextClassifier;