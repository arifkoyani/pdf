import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2, Download } from 'lucide-react';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';

const CompressPdf = () => {
  const words = ["Better", "Pdf", "Perfect", "compress"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
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

      const response = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: formData,
      });

      const data = await response.json();
      setUploadProgress(100);

      if (data.error === false) {
        setUploadedFileUrl(data.url);
        // ✅ start compression automatically
        compressPdf(data.url);
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

  const compressPdf = async (fileUrl: string) => {
    setState('converting');
    try {
      const payload = {
        url: fileUrl,
        async: false,
        config: {
          images: {
            color: {
              skip: false,
              downsample: {
                skip: false,
                downsample_ppi: 150,
                threshold_ppi: 225
              },
              compression: {
                skip: false,
                compression_format: "jpeg",
                compression_params: {
                  quality: 60
                }
              }
            },
            grayscale: {
              skip: false,
              downsample: {
                skip: false,
                downsample_ppi: 150,
                threshold_ppi: 225
              },
              compression: {
                skip: false,
                compression_format: "jpeg",
                compression_params: {
                  quality: 60
                }
              }
            },
            monochrome: {
              skip: false,
              downsample: {
                skip: false,
                downsample_ppi: 300,
                threshold_ppi: 450
              },
              compression: {
                skip: false,
                compression_format: "ccitt_g4",
                compression_params: {}
              }
            }
          },
          save: {
            garbage: 4
          }
        }
      };

      const response = await fetch('https://api.pdf.co/v2/pdf/compress', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error === false && data.url) {
        setConvertedFileUrls([data.url]);
        setState('ready');
      } else {
        console.error('Compression failed:', data);
        alert(`Compression failed: ${data.message || 'Please try again.'}`);
        setState('select');
      }
    } catch (error) {
      console.error('Compress error:', error);
      alert('Compression failed. Please try again.');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setConvertedFileUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloadingIndex(index);
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
      setDownloadingIndex(null);
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
            Compress To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Compress your PDF</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium">
          Automatically reduces PDF size using smart compression.
        </p>
      </div>

      <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-1 ">
        <div>

        </div>
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
              <div className="flex flex-col items-center space-y-4">
                <Spinner />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Uploading PDF...
                </p>
              </div>
            )}

            {state === 'converting' && (
              <div className="flex flex-col items-center space-y-4">
                <Spinner />
                <p className="text-muted-foreground">Compressing PDF...</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-4">
                {convertedFileUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {/* Download Button */}
                    <Button
                      onClick={() => downloadFile(url, "compressed.pdf", index)}
                      disabled={downloadingIndex === index}
                      className="flex-1 bg-[#f16625] shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto text-white rounded-xl"
                    >
                      {downloadingIndex === index ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download Compressed PDF
                        </>
                      )}
                    </Button>

                    {/* Copy Link Icon Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(url)}
                      title="Copy link"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                ))}

                <Button onClick={resetConverter} variant="outline" className="mt-4">
                  Compress Another PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

    </div>
  );
};

export default CompressPdf;
