import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Upload } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';
import Spinner from '@/components/ui/loader/loader';
import { Loader2, Download } from 'lucide-react';
import SendEmail from '@/components/send-email/SendEmail';
import SendUploadedPdfEmail from '@/components/send-email/SendEmail';
import SendPdfEmail from '@/components/send-email/SendEmail';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'setpassword' | 'converting' | 'ready';

const AddPasswordToPdf = () => {
    const words = ["Better", "Pdf", "Perfect", "protected"];
    const [state, setState] = useState<AppState>('select');
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // track copied button
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toEmail, setToEmail] = useState('');
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
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://api.pdf.co/v1/file/upload', {
                method: 'POST',
                headers: { 'x-api-key': API_KEY },
                body: formData,
            });

            const data = await response.json();
            if (data.error === false) {
                setUploadedFileUrl(data.url);
                setState('setpassword'); // ✅ show password inputs
            } else {
                setState('select');
                alert(`Upload failed: ${data.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setState('select');
            alert('Upload failed. Please try again.');
        }
    };

    const addPassword = async (fileUrl: string) => {
        if (!newPassword || !confirmPassword) {
            alert("Please enter password in both fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setState('converting');
        try {
            const payload = {
                url: fileUrl,
                ownerPassword: newPassword,
                userPassword: newPassword,
                EncryptionAlgorithm: "AES_128bit",
                AllowPrintDocument: false,
                AllowFillForms: false,
                AllowModifyDocument: false,
                AllowContentExtraction: false,
                AllowModifyAnnotations: false,
                PrintQuality: "LowResolution",
                name: "output-protected.pdf",
                async: false
            };

            const response = await fetch('https://api.pdf.co/v1/pdf/security/add', {
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
                console.error('Add password failed:', data);
                alert(`Add password failed: ${data.message || 'Please try again.'}`);
                setState('select');
            }
        } catch (error) {
            console.error('Add password error:', error);
            alert('Add password failed. Please try again.');
            setState('select');
        }
    };

    const resetConverter = () => {
        setState('select');
        setUploadedFileUrl('');
        setConvertedFileUrls([]);
        setNewPassword('');
        setConfirmPassword('');
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

    const handleCopy = (url: string, index: number) => {
        navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000); // reset after 1.5s
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
                        Lock With
                        <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                            <FlipWords words={words} />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground text-lg">Protect your PDF with password</p>
                <p className="text-[#a855f7] text-sm mt-2 font-medium">
                    Add secure password protection to your PDF easily.
                </p>
            </div>

            <Card className="h-fit p-8 shadow-elegant border-0 backdrop-blur-sm">
                <div className="text-center space-y-6">
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

                    {state === 'setpassword' && (
                        <div className="flex flex-col items-center space-y-4">
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border rounded-lg p-2 w-full"
                            />
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border rounded-lg p-2 w-full"
                            />
                            <Button
                                onClick={() => addPassword(uploadedFileUrl)}
                                className="bg-[#f16625] text-white px-6 py-2 rounded-xl"
                            >
                                Add Password
                            </Button>
                        </div>
                    )}

                    {state === 'converting' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Spinner />
                            <p className="text-muted-foreground">Applying password to PDF...</p>
                        </div>
                    )}

{state === 'ready' && (
  <div className="space-y-4">
    {convertedFileUrls.map((url, index) => (
      <div key={index} className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          {/* Download Button */}
          <Button
            onClick={() => downloadFile(url, "output-protected.pdf", index)}
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
                Download Protected PDF
              </>
            )}
          </Button>

          {/* Copy Link Icon Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCopy(url, index)}
            title="Copy link"
            className={copiedIndex === index ? "bg-green-500 text-white" : ""}
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>

        {/* Input for user to enter email */}
       <span className='flex gap-2'>
       <input
          type="email"
          placeholder="Enter recipient email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />

        {/* Send Email Button */}
        <SendPdfEmail
          toEmail={toEmail}
          fileUrl={url}
        />
       </span>
      </div>
    ))}

    <Button onClick={resetConverter} variant="outline" className="mt-4">
      Protect Another PDF
    </Button>
  </div>
)}

                </div>
            </Card>
        </div>
    );
};

export default AddPasswordToPdf;
