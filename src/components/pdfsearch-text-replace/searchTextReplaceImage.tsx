import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";
type AppState = 'select-pdf' | 'uploading-pdf' | 'select-image' | 'uploading-image' | 'configuring' | 'replacing' | 'ready';

const SearchTextReplaceImage = () => {
    const words = ["Better", "Fast", "Perfect", "Image"];
    const [state, setState] = useState<AppState>('select-pdf');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfFileUrl, setPdfFileUrl] = useState('');
    const [imageFileUrl, setImageFileUrl] = useState('');
    const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
    const [searchString, setSearchString] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [pages, setPages] = useState('0');
    const pdfFileInputRef = useRef<HTMLInputElement>(null);
    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (
            file.type === 'application/pdf' || 
            file.name.toLowerCase().endsWith('.pdf')
        )) {
            uploadPdfFile(file);
        } else {
            alert('Please select a valid PDF file');
        }
    };

    const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (
            file.type.startsWith('image/') || 
            file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
        )) {
            uploadImageFile(file);
        } else {
            alert('Please select a valid image file (JPG, PNG, GIF, BMP, WebP)');
        }
    };

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
            console.log('PDF Upload response:', data);

            clearInterval(uploadInterval);
            setUploadProgress(100);

            if (data.error === false) {
                setPdfFileUrl(data.url);
                setState('select-image');
            } else {
                setState('select-pdf');
                setUploadProgress(0);
                alert(`PDF upload failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('PDF upload error:', error);
            setState('select-pdf');
            setUploadProgress(0);
            alert('PDF upload failed. Please try again.');
        }
    };

    const uploadImageFile = async (file: File) => {
        setState('uploading-image');
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
            console.log('Image Upload response:', data);

            clearInterval(uploadInterval);
            setUploadProgress(100);

            if (data.error === false) {
                setImageFileUrl(data.url);
                setState('configuring');
            } else {
                setState('select-image');
                setUploadProgress(0);
                alert(`Image upload failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setState('select-image');
            setUploadProgress(0);
            alert('Image upload failed. Please try again.');
        }
    };

    const startTextToImageReplacement = async () => {
        if (!searchString.trim()) {
            alert('Please enter a search string');
            return;
        }

        setState('replacing');

        try {
            const payload = {
                url: pdfFileUrl,
                searchString: searchString,
                caseSensitive: caseSensitive,
                replaceImage: imageFileUrl,
                pages: pages,
                async: false
            };

            console.log('Text to Image replacement payload:', payload);

            const response = await fetch('https://api.pdf.co/v1/pdf/edit/replace-text-with-image', {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Replacement response:', data);

            if (data.error === false) {
                console.log('API Response data:', data);
                
                // Handle different response formats
                let urls: string[] = [];
                
                if (Array.isArray(data.urls)) {
                    urls = data.urls;
                } else if (typeof data.url === 'string' && data.url.length > 0) {
                    urls = [data.url];
                } else if (typeof data.resultUrl === 'string' && data.resultUrl.length > 0) {
                    urls = [data.resultUrl];
                } else if (typeof data.downloadUrl === 'string' && data.downloadUrl.length > 0) {
                    urls = [data.downloadUrl];
                }
                
                console.log('Extracted URLs:', urls);

                if (urls.length > 0) {
                    setConvertedFileUrls(urls);
                    setState('ready');
                } else {
                    setState('configuring');
                    alert('Text to image replacement failed. No PDF files generated. Please try again.');
                }
            } else {
                setState('configuring');
                alert(`Text to image replacement failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Replacement error:', error);
            setState('configuring');
            alert('Text to image replacement failed. Please try again.');
        }
    };

    const downloadFile = async (url: string, fileName: string) => {
        console.log('Starting download for URL:', url);
        console.log('File name:', fileName);
        
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

            console.log('Fetching file from URL:', url);
            
            // First, try to get the file with proper headers for download
            const response = await fetch(url, { 
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf,application/octet-stream,*/*',
                },
                mode: 'cors'
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log('Blob size:', blob.size);
            console.log('Blob type:', blob.type);
            
            clearInterval(downloadInterval);
            setDownloadProgress(100);

            // Create a blob URL for download
            const objectUrl = URL.createObjectURL(blob);
            console.log('Created object URL:', objectUrl);
            
            // Create download link
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            console.log('Triggering download...');
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL
            URL.revokeObjectURL(objectUrl);

            console.log('Download completed successfully');
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadProgress(0);
            }, 1000);

        } catch (e) {
            console.error('Download error:', e);
            alert(`Download failed: ${e.message}. Please try again.`);
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const resetConverter = () => {
        setState('select-pdf');
        setUploadProgress(0);
        setDownloadProgress(0);
        setIsDownloading(false);
        setPdfFileUrl('');
        setImageFileUrl('');
        setConvertedFileUrls([]);
        setSearchString('');
        setCaseSensitive(false);
        setPages('0');
        if (pdfFileInputRef.current) {
            pdfFileInputRef.current.value = '';
        }
        if (imageFileInputRef.current) {
            imageFileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
            <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
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
                <div className="h-[4rem] flex justify-center items-center px-4">
                    <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 dark:text-neutral-400 
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">Replace Text with
                        <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                            <FlipWords words={words} />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground text-lg">Modify a PDF file by searching for specific text and replacing it with an image</p>
            </div>

            <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm max-w-4xl w-full">
                <div className="text-center space-y-6">
                    {/* Step 1: PDF Upload */}
                    {state === 'select-pdf' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Step 1: Select PDF File</h3>
                        <div
                            className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-border border-[#ff7525] shadow-lg rounded-xl px-12 hover:border-[#ff550d] transition-all transform hover:scale-100 transition-all duration-100 text-lg cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
                                onClick={() => pdfFileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 flex gap-4 justify-center text-white" />
                            <h3 className="text-xl font-semibold text-white">
                                Choose PDF File
                            </h3>
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

                    {/* PDF Upload Progress */}
                    {state === 'uploading-pdf' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Uploading PDF...</h3>
                            <div className="w-full max-w-md mx-auto">
                                <Progress value={uploadProgress} className="h-4" />
                                <p className="text-sm text-muted-foreground mt-2 text-center">
                                    {Math.round(uploadProgress)}% uploaded
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Image Upload */}
                    {state === 'select-image' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Step 2: Select Image File</h3>
                            <div
                                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-border border-[#ff7525] shadow-lg rounded-xl px-12 hover:border-[#ff550d] transition-all transform hover:scale-100 transition-all duration-100 text-lg cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
                                onClick={() => imageFileInputRef.current?.click()}
                            >
                                <ImageIcon className="w-8 h-8 flex gap-4 justify-center text-white" />
                                <h3 className="text-xl font-semibold text-white">
                                    Choose Image File
                                </h3>
                                <input
                                    ref={imageFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* Image Upload Progress */}
                    {state === 'uploading-image' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Uploading Image...</h3>
                            <div className="w-full max-w-md mx-auto">
                                <Progress value={uploadProgress} className="h-4" />
                                <p className="text-sm text-muted-foreground mt-2 text-center">
                                    {Math.round(uploadProgress)}% uploaded
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Step 3: Configuration */}
                    {state === 'configuring' && (
                        <div className="space-y-6">
                            <div className="text-left">
                                <h3 className="text-lg font-semibold mb-4">Step 3: Configure Text to Image Replacement</h3>
                                
                                {/* Search String Input */}
                                <div className="mb-6">
                                    <Label htmlFor="searchString">Search for text:</Label>
                                                <Input
                                        id="searchString"
                                        placeholder="e.g., Your Company Name"
                                        value={searchString}
                                        onChange={(e) => setSearchString(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>

                                {/* Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="caseSensitive"
                                            checked={caseSensitive}
                                            onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                                        />
                                        <Label htmlFor="caseSensitive">Case sensitive</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="pages">Pages (0 = all pages):</Label>
                                        <Input
                                            id="pages"
                                            type="text"
                                            placeholder="0"
                                            value={pages}
                                            onChange={(e) => setPages(e.target.value)}
                                            className="mt-1 w-32"
                                        />
                                    </div>
                                </div>

                                {/* Start Replacement Button */}
                                <Button
                                    onClick={startTextToImageReplacement}
                                    className="mt-6 w-full bg-gradient-primary shadow-xl shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                                >
                                    Start Text to Image Replacement
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Replacing Progress */}
                    {state === 'replacing' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            <p className="text-muted-foreground">Replacing text with image in PDF...</p>
                        </div>
                    )}

                    {/* Download Section */}
                    {state === 'ready' && (
                        <div className="space-y-4">
                            {convertedFileUrls.map((url, index) => (
                                <Button
                                    key={index}
                                    onClick={() => downloadFile(url, `text-replaced-with-image-${index + 1}.pdf`)}
                                    className="w-full bg-gradient-primary shadow-xl shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF with Image Replacement
                                </Button>
                            ))}

                            <Button
                                onClick={resetConverter}
                                variant="outline"
                                className="mt-4"
                            >
                                Replace Text with Image in Another PDF
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
            </Card>
        </div>
    );
};

export default SearchTextReplaceImage;