import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Loader2 } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ"; // put your PDF.co API Key
type AppState = 'select-pdf' | 'uploading-pdf' | 'configuring' | 'replacing' | 'ready';

const DeleteTextFromPDF = () => {
    const words = ["Better", "Fast", "Simple", "PDF"];
    const [state, setState] = useState<AppState>('select-pdf');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfFileUrl, setPdfFileUrl] = useState('');
    const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
    const [searchString, setSearchString] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const pdfFileInputRef = useRef<HTMLInputElement>(null);

    // Handle PDF selection
    const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
            uploadPdfFile(file);
        } else {
            alert('Please select a valid PDF file');
        }
    };

    // Upload PDF to PDF.co
    const uploadPdfFile = async (file: File) => {
        setState('uploading-pdf');
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
                setPdfFileUrl(data.url);
                setState('configuring');
            } else {
                setState('select-pdf');
                alert(`PDF upload failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('PDF upload error:', error);
            setState('select-pdf');
            alert('PDF upload failed. Please try again.');
        }
    };

    // Call Delete Text API
    const startDeleteText = async () => {
        if (!searchString.trim()) {
            alert('Please enter a search string to delete');
            return;
        }

        setState('replacing');

        try {
            const payload = {
                url: pdfFileUrl,
                name: "pdfWithTextDeleted",
                caseSensitive: caseSensitive,
                searchString: searchString,
                replacementLimit: 0, // delete all occurrences
                async: false
            };

            const response = await fetch('https://api.pdf.co/v1/pdf/edit/delete-text', {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.error === false) {
                let urls: string[] = [];

                if (Array.isArray(data.urls)) urls = data.urls;
                else if (typeof data.url === 'string' && data.url.length > 0) urls = [data.url];
                else if (typeof data.resultUrl === 'string' && data.resultUrl.length > 0) urls = [data.resultUrl];
                else if (typeof data.downloadUrl === 'string' && data.downloadUrl.length > 0) urls = [data.downloadUrl];

                if (urls.length > 0) {
                    setConvertedFileUrls(urls);
                    setState('ready');
                } else {
                    setState('configuring');
                    alert('Delete text failed. No PDF generated.');
                }
            } else {
                setState('configuring');
                alert(`Delete text failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Delete text error:', error);
            setState('configuring');
            alert('Delete text failed. Please try again.');
        }
    };

    // Download PDF
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

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

            const blob = await response.blob();
            clearInterval(downloadInterval);
            setDownloadProgress(100);

            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(objectUrl);

            setTimeout(() => {
                setIsDownloading(false);
                setDownloadProgress(0);
            }, 1000);

        } catch (e: any) {
            alert(`Download failed: ${e.message}`);
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    // Reset
    const resetConverter = () => {
        setState('select-pdf');
        setUploadProgress(0);
        setDownloadProgress(0);
        setIsDownloading(false);
        setPdfFileUrl('');
        setConvertedFileUrls([]);
        setSearchString('');
        setCaseSensitive(false);
        if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
    };

    return (
        <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
            <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
                <h1 className="text-sm text-black font-medium text-center">
                    Delete Text from PDF Online
                </h1>
            </div>
            
            <div className='pb-10'>
                <div className="h-[4rem] flex justify-center items-center px-4">
                    <div className="flex flex-wrap justify-center py-1 items-center text-neutral-600 text-2xl md:text-4xl gap-2">
                        Delete Text with
                        <div className="w-[120px] md:w-[180px] text-left">
                            <FlipWords words={words} />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground text-lg">Remove specific text from a PDF and download the cleaned file</p>
            </div>

            <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm max-w-4xl w-full">
                <div className="text-center space-y-6">

                    {/* Step 1: Upload PDF */}
                    {state === 'select-pdf' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Delete Word Or Sentence (Both) Text</h3>
                            <div
                                className="border-4 flex items-center justify-center space-x-6 p-4 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625]"
                                onClick={() => pdfFileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-white" />
                                <h3 className="text-xl font-semibold text-white">Choose PDF File</h3>
                                <input
                                    ref={pdfFileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* Uploading PDF */}
                    {state === 'uploading-pdf' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Uploading PDF...</h3>
                            <Progress value={uploadProgress} className="h-4" />
                            <p>{Math.round(uploadProgress)}% uploaded</p>
                        </div>
                    )}

                    {/* Step 2: Configure Delete */}
                    {state === 'configuring' && (
                        <div className="space-y-6 text-left">
                            <h3 className="text-lg font-semibold mb-4">Step 2: Enter Text to Delete</h3>
                            
                            <Label htmlFor="searchString">Text to delete:</Label>
                            <Input
                                id="searchString"
                                placeholder="e.g., Invoice"
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                                className="mt-1 mb-4"
                            />

                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox
                                    id="caseSensitive"
                                    checked={caseSensitive}
                                    onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                                />
                                <Label htmlFor="caseSensitive">Case sensitive</Label>
                            </div>

                            <Button onClick={startDeleteText} className="w-full">
                                Delete Text from PDF
                            </Button>
                        </div>
                    )}

                    {/* Replacing */}
                    {state === 'replacing' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            <p>Deleting text from PDF...</p>
                        </div>
                    )}

                    {/* Download Section */}
                    {state === 'ready' && (
                        <div className="space-y-4">
                            {convertedFileUrls.map((url, index) => (
                                <Button
                                    key={index}
                                    onClick={() => downloadFile(url, `pdf-with-text-deleted-${index + 1}.pdf`)}
                                    className="w-full"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download Cleaned PDF
                                </Button>
                            ))}
                            <Button onClick={resetConverter} variant="outline" className="mt-4">
                                Delete Text in Another PDF
                            </Button>

                            {isDownloading && (
                                <div className="space-y-4">
                                    <Progress value={downloadProgress} className="h-4" />
                                    <p>{Math.round(downloadProgress)}% downloaded</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DeleteTextFromPDF;
