import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';

const RotateSelectedPages = () => {
  const words = ["Better", "Pdf", "Perfect", "Pages"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);

  const [pageMode, setPageMode] = useState<'number' | 'range'>('number');
  const [singlePage, setSinglePage] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [angle, setAngle] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf')) {
      uploadFile(file);
    } else {
      alert('Please select a valid PDF file');
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
        setUploadedFileUrl(data.url);
        setState('select');
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
    }
  };

  const rotatePdf = async () => {
    if (!uploadedFileUrl) return;
  
    // Validate inputs
    if (pageMode === 'number' && !singlePage) {
      alert('Please enter a page number');
      return;
    }
  
    if (pageMode === 'range' && (!rangeStart || !rangeEnd)) {
      alert('Please enter both start and end page numbers');
      return;
    }
  
    if (pageMode === 'range' && parseInt(rangeStart, 10) > parseInt(rangeEnd, 10)) {
      alert('Start page cannot be greater than end page');
      return;
    }
  
    let pages = '';
  
    if (pageMode === 'number') {
      // Use the same number entered by user (1-based index)
      pages = singlePage.trim();
    }
  
    if (pageMode === 'range') {
      // Use the same numbers entered by user
      pages = `${rangeStart.trim()}-${rangeEnd.trim()}`;
    }
    console.log("this is page number",pages)
  
    setState('converting');
    try {
      const response = await fetch('https://api.pdf.co/v1/pdf/edit/rotate', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: uploadedFileUrl,
          pages: pages,               // send as entered in UI
          angle: angle.toString(),    // string required
          name: "result.pdf",
          async: false
        }),
      });
  
      const data = await response.json();
      if (data.error === false && data.url) {
        setConvertedFileUrls([data.url]);
        setState('ready');
      } else {
        console.error('Rotation failed:', data);
        alert(`Rotation failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Rotate error:', error);
      alert('Rotation failed. Please try again.');
      setState('select');
    }
  };
  

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setConvertedFileUrls([]);
    setSinglePage('');
    setRangeStart('');
    setRangeEnd('');
    setAngle(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            Rotate To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Rotate selected pages of your PDF</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium">
          Important: The first-page index is 0. Use "!" before a number for inverted page numbers (e.g., "!0" for the last page).
        </p>
      </div>

      <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-1 ">
          <div className="space-y-6">
            {state === 'select' && !uploadedFileUrl && (
              <div
                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
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
            )}

            {state === 'uploading' && (
              <div className="space-y-4">
                <Progress value={uploadProgress} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round(uploadProgress)}% uploaded
                </p>
              </div>
            )}

            {uploadedFileUrl && state === 'select' && (
              <div className="space-y-4">
                <Tabs defaultValue="number" className="w-full" onValueChange={(val: any) => setPageMode(val)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="number">Page Number</TabsTrigger>
                    <TabsTrigger value="range">Pages Range</TabsTrigger>
                  </TabsList>

                  <TabsContent value="number">
                    <input
                      type="text"
                      value={singlePage}
                      onChange={(e) => setSinglePage(e.target.value)}
                      placeholder="Enter page number (e.g., 1)"
                      className="border p-2 w-full"
                    />
                  </TabsContent>

                  <TabsContent value="range">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                        placeholder="Start page (e.g., 1)"
                        className="border p-2 w-full"
                      />
                      <input
                        type="text"
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        placeholder="End page (e.g., 5)"
                        className="border p-2 w-full"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Select onValueChange={(val: string) => setAngle(Number(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rotation angle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0°</SelectItem>
                    <SelectItem value="90">90°</SelectItem>
                    <SelectItem value="180">180°</SelectItem>
                    <SelectItem value="270">270°</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={rotatePdf} className="w-full mt-4">Rotate</Button>
              </div>
            )}

            {state === 'converting' && (
              <div className="flex flex-col items-center space-y-4">
                <Spinner />
                <p className="text-muted-foreground">Rotating pages in PDF...</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-4">
                {convertedFileUrls.map((url, index) => (
                  <Button
                    key={index}
                    onClick={() => window.open(url, "_blank")}
                    className="w-full bg-gradient-primary shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto"
                  >
                    Preview PDF
                  </Button>
                ))}

                <Button onClick={resetConverter} variant="outline" className="mt-4">
                  Rotate Another PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RotateSelectedPages;