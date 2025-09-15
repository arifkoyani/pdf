"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Upload, Loader2 } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words/flip-words";
import Spinner from "@/components/ui/loader/loader";

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = "select" | "uploading" | "extracting" | "ready";

interface EmailRecipient {
  address: string;
  name: string;
}

interface EmailData {
  from: string;
  fromName: string;
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  sentAt: string | null;
  receivedAt: string | null;
  subject: string;
  bodyHtml: string | null;
  bodyText: string;
  attachmentCount: number;
}

interface ApiResponse {
  body: EmailData;
  error: boolean;
  status: number;
  name: string;
  remainingCredits: number;
}

const ExtractDataFromEmail = () => {
  const words = ["From", "Subject", "Body", "Attachments"];
  const [state, setState] = useState<AppState>("select");
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
      extractEmailData(file);
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

  // Extract email data
  const extractEmailData = async (file: File) => {
    setState("uploading");
    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      setState("select");
      return;
    }
    setState("extracting");

    try {
      const response = await fetch("https://api.pdf.co/v1/email/decode", {
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

  const resetExtractor = () => {
    setState("select");
    setEmailData(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatRecipients = (recipients: EmailRecipient[]): string => {
    return recipients
      .map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.address}>`
          : recipient.address
      )
      .join(", ");
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Extract Data from Email Files (.eml/.msg)
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
          Upload your email file to extract sender, recipient, subject, and content information
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
                {state === "uploading" ? "Uploading file..." : "Extracting data..."}
              </p>
            </div>
          )}

          {state === "ready" && emailData && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-4">Extracted Email Data</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-600">From</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate">
                        {emailData.fromName ? `${emailData.fromName} <${emailData.from}>` : emailData.from}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(emailData.fromName ? `${emailData.fromName} <${emailData.from}>` : emailData.from, "from")}
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

                  {/* To */}
                  {emailData.to.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-medium text-sm text-gray-600">To</label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="truncate">{formatRecipients(emailData.to)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(formatRecipients(emailData.to), "to")}
                          className="ml-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedField === "to" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* CC */}
                  {emailData.cc.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-medium text-sm text-gray-600">CC</label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="truncate">{formatRecipients(emailData.cc)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(formatRecipients(emailData.cc), "cc")}
                          className="ml-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedField === "cc" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* BCC */}
                  {emailData.bcc.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-medium text-sm text-gray-600">BCC</label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="truncate">{formatRecipients(emailData.bcc)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(formatRecipients(emailData.bcc), "bcc")}
                          className="ml-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedField === "bcc" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-600">Attachments</label>
                    <div className="p-2 bg-gray-50 rounded">
                      <span>{emailData.attachmentCount} file(s)</span>
                    </div>
                  </div>

                  {/* Dates */}
                  {emailData.sentAt && (
                    <div className="space-y-2">
                      <label className="font-medium text-sm text-gray-600">Sent At</label>
                      <div className="p-2 bg-gray-50 rounded">
                        <span>{new Date(emailData.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {emailData.receivedAt && (
                    <div className="space-y-2">
                      <label className="font-medium text-sm text-gray-600">Received At</label>
                      <div className="p-2 bg-gray-50 rounded">
                        <span>{new Date(emailData.receivedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Text */}
                {emailData.bodyText && (
                  <div className="space-y-2 mt-4">
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

export default ExtractDataFromEmail;