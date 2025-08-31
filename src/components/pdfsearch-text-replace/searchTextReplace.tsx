import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Loader2, Plus, X } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";
type AppState = 'select' | 'uploading' | 'configuring' | 'replacing' | 'ready';

interface SearchReplacePair {
    searchString: string;
    replaceString: string;
}

const SearchTextReplace = () => {
    const words = ["Better", "Fast", "Perfect", "Text"];
    const [state, setState] = useState<AppState>('select');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
    const [searchReplacePairs, setSearchReplacePairs] = useState<SearchReplacePair[]>([
        { searchString: '', replaceString: '' }
    ]);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [replacementLimit, setReplacementLimit] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (
            file.type === 'application/pdf' || 
            file.name.toLowerCase().endsWith('.pdf')
        )) {
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
            console.log('Upload response:', data);

            clearInterval(uploadInterval);
            setUploadProgress(100);

            if (data.error === false) {
                setUploadedFileUrl(data.url);
                setState('configuring');
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

    const addSearchReplacePair = () => {
        setSearchReplacePairs([...searchReplacePairs, { searchString: '', replaceString: '' }]);
    };

    const removeSearchReplacePair = (index: number) => {
        if (searchReplacePairs.length > 1) {
            const newPairs = searchReplacePairs.filter((_, i) => i !== index);
            setSearchReplacePairs(newPairs);
        }
    };

    const updateSearchReplacePair = (index: number, field: 'searchString' | 'replaceString', value: string) => {
        const newPairs = [...searchReplacePairs];
        newPairs[index][field] = value;
        setSearchReplacePairs(newPairs);
    };

    const startTextReplacement = async () => {
        // Validate that all search strings are filled
        const validPairs = searchReplacePairs.filter(pair => pair.searchString.trim() !== '');
        
        if (validPairs.length === 0) {
            alert('Please enter at least one search string');
            return;
        }

        setState('replacing');

        try {
            const payload = {
                url: uploadedFileUrl,
                searchStrings: validPairs.map(pair => pair.searchString),
                replaceStrings: validPairs.map(pair => pair.replaceString),
                caseSensitive: caseSensitive,
                replacementLimit: replacementLimit,
                pages: "",
                password: "",
                name: "pdfWithTextReplaced",
                async: false
            };

            console.log('Replacement payload:', payload);

            const response = await fetch('https://api.pdf.co/v1/pdf/edit/replace-text', {
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
                const urls = Array.isArray(data.urls)
                    ? data.urls
                    : (typeof data.url === 'string' && data.url.length > 0)
                        ? [data.url]
                        : [];

                if (urls.length > 0) {
                    setConvertedFileUrls(urls);
                    setState('ready');
                } else {
                    setState('configuring');
                    alert('Text replacement failed. No PDF files generated. Please try again.');
                }
            } else {
                setState('configuring');
                alert(`Text replacement failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Replacement error:', error);
            setState('configuring');
            alert('Text replacement failed. Please try again.');
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
        setUploadProgress(0);
        setDownloadProgress(0);
        setIsDownloading(false);
        setUploadedFileUrl('');
        setConvertedFileUrls([]);
        setSearchReplacePairs([{ searchString: '', replaceString: '' }]);
        setCaseSensitive(false);
        setReplacementLimit(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">Replace
                        <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                            <FlipWords words={words} />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground text-lg">Search and replace text in your PDF documents</p>
            </div>

            <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm max-w-4xl w-full">
                <div className="text-center space-y-6">
                    {/* File Upload Section */}
                    {state === 'select' && (
                        <div
                            className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-border border-[#ff7525] shadow-lg rounded-xl px-12 hover:border-[#ff550d] transition-all transform hover:scale-100 transition-all duration-100 text-lg cursor-pointer bg-[#f16625] hover:shadow-[#f16625]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 flex gap-4 justify-center text-white" />
                            <h3 className="text-xl font-semibold text-white">
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

                    {/* Upload Progress */}
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

                    {/* Configuration Section */}
                    {state === 'configuring' && (
                        <div className="space-y-6">
                            <div className="text-left">
                                <h3 className="text-lg font-semibold mb-4">Configure Text Replacement</h3>
                                
                                {/* Search and Replace Pairs */}
                                <div className="space-y-4">
                                    {searchReplacePairs.map((pair, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <Label htmlFor={`search-${index}`}>Search for:</Label>
                                                <Input
                                                    id={`search-${index}`}
                                                    placeholder="e.g., [CLIENT-NAME]"
                                                    value={pair.searchString}
                                                    onChange={(e) => updateSearchReplacePair(index, 'searchString', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor={`replace-${index}`}>Replace with:</Label>
                                                <Input
                                                    id={`replace-${index}`}
                                                    placeholder="e.g., John Doe"
                                                    value={pair.replaceString}
                                                    onChange={(e) => updateSearchReplacePair(index, 'replaceString', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            {searchReplacePairs.length > 1 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeSearchReplacePair(index)}
                                                    className="mt-6"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Pair Button */}
                                <Button
                                    variant="outline"
                                    onClick={addSearchReplacePair}
                                    className="mt-4"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Another Search/Replace Pair
                                </Button>

                                {/* Options */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="caseSensitive"
                                            checked={caseSensitive}
                                            onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                                        />
                                        <Label htmlFor="caseSensitive">Case sensitive</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="replacementLimit">Replacement Limit (0 = unlimited):</Label>
                                        <Input
                                            id="replacementLimit"
                                            type="number"
                                            min="0"
                                            value={replacementLimit}
                                            onChange={(e) => setReplacementLimit(parseInt(e.target.value) || 0)}
                                            className="mt-1 w-32"
                                        />
                                    </div>
                                </div>

                                {/* Start Replacement Button */}
                                <Button
                                    onClick={startTextReplacement}
                                    className="mt-6 w-full bg-gradient-primary shadow-xl shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                                >
                                    Start Text Replacement
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Replacing Progress */}
                    {state === 'replacing' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            <p className="text-muted-foreground">Replacing text in PDF...</p>
                        </div>
                    )}

                    {/* Download Section */}
                    {state === 'ready' && (
                        <div className="space-y-4">
                            {convertedFileUrls.map((url, index) => (
                                <Button
                                    key={index}
                                    onClick={() => downloadFile(url, `replaced-text-${index + 1}.pdf`)}
                                    className="w-full bg-gradient-primary shadow-xl shadow-[#fff7ed]/90 transform hover:scale-105 transition-all duration-500 text-lg px-8 py-4 h-auto"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF with Replaced Text
                                </Button>
                            ))}

                            <Button
                                onClick={resetConverter}
                                variant="outline"
                                className="mt-4"
                            >
                                Replace Text in Another PDF
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

export default SearchTextReplace;