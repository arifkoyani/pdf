"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Upload, Loader2, Download, File } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words/flip-words";
import Spinner from "@/components/ui/loader/loader";

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = "select" | "uploading" | "extracting" | "ready";

interface ApiResponse {
  urls: string[];
  pageCount: number;
  error: boolean;
  status: number;
  name: string;
  credits: number;
  duration: number;
  remainingCredits: number;
}

const ExtractAttachmentsFromPdf = () => {
  const words = ["Attachments", "Files", "Documents", "Content"];
  const [state, setState] = useState<AppState>("select");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedUrls, setCopiedUrls] = useState<Set<number>>(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set());

  // Create a hidden file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      extractPdfAttachments(file);
    }
  };

  // Upload file
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });
      const data = await response.json();
      if (data.error === false && data.url) return data.url;
      alert("Upload failed. Please try again.");
      return null;
    } catch {
      alert("Upload failed. Please try again.");
      return null;
    }
  };

  // Extract PDF attachments
  const extractPdfAttachments = async (file: File) => {
    setState("uploading");
    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      setState("select");
      return;
    }
    setState("extracting");

    try {
      const response = await fetch("https://api.pdf.co/v1/pdf/attachments/extract", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          inline: false,
          async: false,
        }),
      });

      const data: ApiResponse = await response.json();
      if (data.error === false && data.urls) {
        setAttachments(data.urls);
        setState("ready");
      } else {
        alert("Extraction failed. Please try again.");
        setState("select");
      }
    } catch {
      alert("Extraction failed. Please try again.");
      setState("select");
    }
  };

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set(prev).add(index));
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      alert("Failed to copy URL");
    }
  };

  const downloadAttachment = async (url: string, index: number) => {
    setDownloadingFiles(prev => new Set(prev).add(index));
    
    try {
      // Extract filename from URL or generate one
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || `attachment-${index + 1}`;
      
      const response = await fetch(url, { credentials: "omit" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Failed to download attachment");
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const getFileExtension = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const extension = pathname.split('.').pop()?.toUpperCase() || 'FILE';
      return extension.length > 5 ? 'FILE' : extension;
    } catch {
      return 'FILE';
    }
  };

  const getFileName = (url: string, index: number): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || `attachment-${index + 1}`;
    } catch {
      return `attachment-${index + 1}`;
    }
  };

  const resetExtractor = () => {
    setState("select");
    setAttachments([]);
    setSelectedFile(null);
    setDownloadingFiles(new Set());
    setCopiedUrls(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Extract Attachments from PDF Files
        </h1>
      </div>
      <div className="pb-10">
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Extract
            <div className="w-[180px] sm:w-[220px] md:w-[260px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Upload a PDF file to extract embedded attachments
        </p>
      </div>
  <p className="text-xs text-gray-700 mt-3 leading-relaxed">
    In a PDF, attachments are extra files embedded inside the PDF (like a ZIP inside a PDF).
    <br />
    -They can be:
    - Another PDF
    - Word, Excel, PPT
    - Images, audio, video
    - Any binary file
  </p>


      

      <Card className="h-fit px-8 md:px-32 py-8 border-0 bg-transparent w-full max-w-4xl">
        <div className="text-center space-y-6">
          {state === "select" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={handleFileSelect}
                className="w-full max-w-md bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
              >
                <Upload className="w-5 h-5 mr-2" />
                Select PDF File
              </Button>
            </div>
          )}

          {(state === "uploading" || state === "extracting") && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">
                {state === "uploading" ? "Uploading file..." : "Extracting attachments..."}
              </p>
            </div>
          )}

          {state === "ready" && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold mb-4">Extracted Attachments</h2>
                
                {attachments.length > 0 ? (
                  <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Found {attachments.length} attachment(s) in the PDF
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {attachments.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {getFileExtension(url)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium truncate">{getFileName(url, index)}</p>
                            <div className="text-xs text-gray-500 break-all overflow-hidden line-clamp-2">
                              {url}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(url, index)}
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedUrls.has(index) && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                          </Button>
                          <Button
                            onClick={() => downloadAttachment(url, index)}
                            disabled={downloadingFiles.has(index)}
                            className="bg-[#f16625] hover:bg-[#ff550d] text-white"
                            size="sm"
                          >
                            {downloadingFiles.has(index) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attachments found in this PDF
                  </div>
                )}
              </div>

              <Button
                onClick={resetExtractor}
                className="mt-4 bg-[#f16625] hover:bg-[#ff550d] text-white"
              >
                Extract Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExtractAttachmentsFromPdf;