import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";
type AppState = 'select' | 'converting' | 'ready';

const UrlToPdfConverter = () => {
  const words = ["Better", "Fast", "Perfect", "CSV"];
  const [state, setState] = useState<AppState>('select');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');

  const convertCsvToPdf = async () => {
    if (!inputUrl.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    setState('converting');

    try {
        const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/url', {
            method: 'POST',
            headers: {
              'x-api-key': API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: inputUrl, // dynamic user input
              name: "result.pdf",
              margins: "5mm",
              paperSize: "Letter",
              orientation: "Portrait",
              printBackground: true,
              header: "",
              footer: "",
              mediaType: "print",
              async: false,
              profiles: '{ "CustomScript": ";; // put some custom js script here " }'
            }),
          });
          

      const data = await response.json();
      console.log('Conversion response:', data);

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
          alert('Conversion failed. No PDF files generated. Please try again.');
        }
      } else {
        setState('select');
        alert(`Conversion failed: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setState('select');
      alert('Conversion failed. Please try again.');
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const downloadInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(downloadInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();

      clearInterval(downloadInterval);
      setDownloadProgress(100);

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);

    } catch (e) {
      console.error('Download error:', e);
      alert('Download failed. Please try again.');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const resetConverter = () => {
    setState('select');
    setDownloadProgress(0);
    setIsDownloading(false);
    setConvertedFileUrls([]);
    setInputUrl('');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">

      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <div className="flex items-center justify-center gap-3 text-white">
          <div className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/30"></div>
          </div>
          <h1 className="text-sm text-black font-medium text-center">
            Every tool you need to work with PDFs in one place
          </h1>
        </div>
      </div>

      <div className='pb-10'>
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 dark:text-neutral-400 
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">Convert To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Convert a file from URL to high-quality PDF documents</p>
      </div>

      <Card className="h-fit px-32 py-2 border-0 bg-transparent">
        <div className="text-center space-y-1">
          <div className="space-y-6">
            {state === 'select' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Paste file URL here"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full max-w-md p-3 border border-gray-300 rounded-lg"
                />
                <Button
                  onClick={convertCsvToPdf}
                  className="w-full bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
                >
                  Convert to PDF
                </Button>
              </div>
            )}

            {state === 'converting' && (
              <div className="flex flex-col items-center space-y-4">
                <Spinner />
                <p className="text-muted-foreground">Converting URL to PDF.....</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-4">
                {convertedFileUrls.map((url, index) => (
                  <Button
                    key={index}
                    onClick={() => downloadFile(url, `converted-url-${index + 1}.pdf`)}
                    className="w-full bg-gradient-primary shadow-xl shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
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
                  Convert Another URL
                </Button>

                {isDownloading && (
                  <div className="space-y-4">
                    <div className="w-full max-w-md mx-auto">
                      <Progress value={downloadProgress} className="h-4" />
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {Math.round(downloadProgress)}% downloaded
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UrlToPdfConverter;
