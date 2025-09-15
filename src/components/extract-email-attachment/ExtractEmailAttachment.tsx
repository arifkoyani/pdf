"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Upload, Loader2, Download } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words/flip-words";
import Spinner from "@/components/ui/loader/loader";

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = "select" | "uploading" | "extracting" | "ready";

interface EmailAttachment {
  filename: string;
  url: string;
}

interface EmailExtractData {
  from: string;
  subject: string;
  bodyHtml: string | null;
  bodyText: string;
  attachments: EmailAttachment[];
}

interface ApiResponse {
  body: EmailExtractData;
  pageCount: number;
  error: boolean;
  status: number;
  name: string;
  remainingCredits: number;
}

const ExtractEmailAttachments = () => {
  const words = ["Attachments", "Files", "Documents", "Content"];
  const [state, setState] = useState<AppState>("select");
  const [emailData, setEmailData] = useState<EmailExtractData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

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
      extractEmailAttachments(file);
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

  // Extract email attachments
  const extractEmailAttachments = async (file: File) => {
    setState("uploading");
    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      setState("select");
      return;
    }
    setState("extracting");

    try {
      const response = await fetch("https://api.pdf.co/v1/email/extract-attachments", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          inline: true,
          async: false,
        }),
      });

      const data: ApiResponse = await response.json();
      if (data.error === false && data.body) {
        setEmailData(data.body);
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

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      alert("Failed to copy text");
    }
  };

  const downloadAttachment = async (attachment: EmailAttachment) => {
    setDownloadingFiles(prev => new Set(prev).add(attachment.filename));
    
    try {
      const response = await fetch(attachment.url, { credentials: "omit" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert(`Failed to download ${attachment.filename}`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.filename);
        return newSet;
      });
    }
  };

  const resetExtractor = () => {
    setState("select");
    setEmailData(null);
    setSelectedFile(null);
    setDownloadingFiles(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Extract Attachments from Email Files (.eml/.msg)
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
          Upload your email file to extract attachments and email content
        </p>
      </div>

      <Card className="h-fit px-8 md:px-32 py-8 border-0 bg-transparent w-full max-w-4xl">
        <div className="text-center space-y-6">
          {state === "select" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".eml,.msg"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={handleFileSelect}
                className="w-full max-w-md bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
              >
                <Upload className="w-5 h-5 mr-2" />
                Select Email File
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

          {state === "ready" && emailData && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold mb-4">Extracted Email Content</h2>
                
                {/* Email Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-600">From</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate">{emailData.from}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(emailData.from, "from")}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedField === "from" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-600">Subject</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate">{emailData.subject}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(emailData.subject, "subject")}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedField === "subject" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Body Text */}
                {emailData.bodyText && (
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-600">Message Body</label>
                    <div className="relative">
                      <pre className="p-4 bg-gray-50 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {emailData.bodyText}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(emailData.bodyText, "body")}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedField === "body" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {emailData.attachments && emailData.attachments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Attachments ({emailData.attachments.length})</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {emailData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {attachment.filename.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
  <p className="text-sm font-medium truncate">{attachment.filename}</p>
  <div className="text-xs text-gray-500 break-all overflow-hidden line-clamp-2">
    {attachment.url}
  </div>
</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(attachment.url, `url-${index}`)}
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                              {copiedField === `url-${index}` && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                            </Button>
                            <Button
                              onClick={() => downloadAttachment(attachment)}
                              disabled={downloadingFiles.has(attachment.filename)}
                              className="bg-[#f16625] hover:bg-[#ff550d] text-white"
                              size="sm"
                            >
                              {downloadingFiles.has(attachment.filename) ? (
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
                )}

                {(!emailData.attachments || emailData.attachments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No attachments found in this email
                  </div>
                )}
              </div>

              <Button
                onClick={resetExtractor}
                className="mt-4 bg-[#f16625] hover:bg-[#ff550d] text-white"
              >
                Extract Another Email
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExtractEmailAttachments;