import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";
type AppState = 'select' | 'uploading' | 'converting' | 'ready';
const PdfDeletePages = () => {
    const words = ["Better", "Pdf", "Perfect", "Pages"];
    const [state, setState] = useState<AppState>('select');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
    const [pageMode, setPageMode] = useState<'single' | 'range' | 'multiple' | null>(null);
    const [singlePage, setSinglePage] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [multiplePages, setMultiplePages] = useState('');
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
                headers: {
                    'x-api-key': API_KEY,
                },
                body: formData,
            });

            const data = await response.json();
            console.log('Upload response:', data);

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

    const convertpdf = async () => {
        if (!uploadedFileUrl) return;

        let pages = '';
        if (pageMode === 'single') pages = singlePage;
        if (pageMode === 'range') pages = `${rangeStart}-${rangeEnd}`;
        if (pageMode === 'multiple') pages = multiplePages;

        setState('converting');

        try {
            const response = await fetch('https://api.pdf.co/v1/pdf/edit/delete-pages', {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: uploadedFileUrl,
                    pages: pages,
                    name: "result.pdf",
                    async: false
                }),
            })

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
                    alert('Conversion failed. No file generated. Please try again.');
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
                    if (prev >= 95) {
                        clearInterval(downloadInterval);
                        return 95;
                    }
                    return prev + Math.random() * 20;
                });
            }, 150);

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
            }, 1500);

        } catch (e) {
            console.error('Download error:', e);
            alert('Download failed. Please try again.');
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const resetConverter = () => {
        setState('select');
        setUploadProgress(0);
        setDownloadProgress(0);
        setIsDownloading(false);
        setUploadedFileUrl('');
        setConvertedFileUrls([]);
        setPageMode(null);
        setSinglePage('');
        setRangeStart('');
        setRangeEnd('');
        setMultiplePages('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6]   flex flex-col items-center  justify-start">

            <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl  px-4 py-5 mb-5">
                <div className="flex  items-center justify-center gap-3 text-white">
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
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl  gap-2">Delete To
                        <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                            <FlipWords words={words} />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground text-lg">Convert your PDF by deleting specific pages</p>
            </div>

            <Card className="h-fit p-8 shadow-elegant border-0  backdrop-blur-sm">
                <div className="text-center space-y-1 ">
                    <div className="space-y-6">
                        {state === 'select' && !uploadedFileUrl && (
                            <div
                                className="border-4 flex items-center justify-center space-x-6 p-4 px-32  border-border border-[#ff7525] shadow-lg rounded-xl px-12 hover:border-[#ff550d] transition-all transform hover:scale-100 transition-all duration-100 text-lg  cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 flex gap-4 justify-center  text-white" />
                                <h3 className="text-xl font-semibold text-white ">
                                    Choose PDF File
                                </h3>

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

                        {uploadedFileUrl && state === 'select' && (
                            <Tabs defaultValue="single" className="w-full" onValueChange={(val:any) => setPageMode(val)}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="single">Single Page</TabsTrigger>
                                    <TabsTrigger value="range">Range</TabsTrigger>
                                    <TabsTrigger value="multiple">Multiple</TabsTrigger>
                                </TabsList>

                                <TabsContent value="single">
                                    <input
                                        type="text"
                                        value={singlePage}
                                        onChange={(e) => setSinglePage(e.target.value)}
                                        placeholder="Enter page number"
                                        className="border p-2 w-full"
                                    />
                                    <Button onClick={convertpdf} className="w-full mt-4">Convert</Button>
                                </TabsContent>

                                <TabsContent value="range">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(e.target.value)}
                                            placeholder="Start page"
                                            className="border p-2 w-full"
                                        />
                                        <input
                                            type="text"
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(e.target.value)}
                                            placeholder="End page"
                                            className="border p-2 w-full"
                                        />
                                    </div>
                                    <Button onClick={convertpdf} className="w-full mt-4">Convert</Button>
                                </TabsContent>

                                <TabsContent value="multiple">
                                    <input
                                        type="text"
                                        value={multiplePages}
                                        onChange={(e) => setMultiplePages(e.target.value)}
                                        placeholder="Enter pages (e.g., 1,3,5)"
                                        className="border p-2 w-full"
                                    />
                                    <Button onClick={convertpdf} className="w-full mt-4">Convert</Button>
                                </TabsContent>
                            </Tabs>
                        )}

                        {state === 'converting' && (
                            <div className="flex flex-col items-center space-y-4">
                                <Spinner/>
                                <p className="text-muted-foreground">Deleting pages PDF</p>
                            </div>
                        )}

                        {state === 'ready' && (
                            <div className="space-y-4">
                                {convertedFileUrls.map((url, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => downloadFile(url, `converted-pdf-${index + 1}.pdf`)}
                                        className="w-full bg-gradient-primary shadow-xl  shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download PDF {index + 1}
                                    </Button>
                                ))}

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

                                <Button
                                    onClick={resetConverter}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    Delete Another PDF Pages
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PdfDeletePages;
