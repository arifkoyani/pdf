"use client";

import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, Copy } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words/flip-words";
import Spinner from "@/components/ui/loader/loader";
import SendPdfEmail from "@/components/send-email/SendEmail";

const API_KEY =
  "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m";

type AppState = "select" | "uploading" | "converting" | "ready";

const HtmlToPdf = () => {
  const words = ["Better", "Fast", "Perfect", "Email"];
  const [state, setState] = useState<AppState>("select");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // copy system
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // send email system
  const [toEmail, setToEmail] = useState("");

  // Create a hidden file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      // Start the conversion process automatically
      await convertEmailToPdf(file);
    }
  };

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      alert("Failed to copy link");
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

  // Convert email to PDF
  const convertEmailToPdf = async (file: File) => {
    setState("uploading");
    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      setState("select");
      return;
    }
    setState("converting");

    try {
      const response = await fetch("https://api.pdf.co/v1/pdf/convert/from/email", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          embedAttachments: true,
          convertAttachments: true,
          paperSize: "Letter",
          name: "email-with-attachments",
          async: false,
        }),
      });

      const data = await response.json();
      if (data.error === false && data.url) {
        setConvertedFileUrl(data.url);
        setState("ready");
      } else {
        alert("Conversion failed. Please try again.");
        setState("select");
      }
    } catch {
      alert("Conversion failed. Please try again.");
      setState("select");
    }
  };

  // Download system
  const downloadFile = async (url: string, fileName: string, index: number) => {
    setDownloadingIndex(index);
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const downloadInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(downloadInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      const response = await fetch(url, { credentials: "omit" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      clearInterval(downloadInterval);
      setDownloadProgress(100);

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadingIndex(null);
      }, 1000);
    } catch {
      alert("Download failed. Please try again.");
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadingIndex(null);
    }
  };

  const resetConverter = () => {
    setState("select");
    setConvertedFileUrl(null);
    setSelectedFile(null);
    setToEmail("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
        Convert email files (.msg or .eml) code into PDF. Extract attachments (if any) from input email and embeds into PDF as PDF attachments.
        </h1>
      </div>

      <div className="pb-10">
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Convert To
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Upload your email file and get it as a PDF
        </p>
      </div>

      <Card className="h-fit px-32 py-2 border-0 bg-transparent">
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
                className="w-full bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
              >
                Select Email File
              </Button>
            </div>
          )}

          {(state === "uploading" || state === "converting") && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">
                {state === "uploading" ? "Uploading file..." : "Converting..."}
              </p>
            </div>
          )}

          {state === "ready" && convertedFileUrl && (
            <div className="space-y-6">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() =>
                      downloadFile(convertedFileUrl, "converted-email.pdf", 0)
                    }
                    disabled={downloadingIndex === 0}
                    className="flex-1 bg-[#f16625] shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto text-white rounded-xl"
                  >
                    {downloadingIndex === 0 ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(convertedFileUrl, 0)}
                    title="Copy link"
                    className={
                      copiedIndex === 0 ? "bg-green-500 text-white" : ""
                    }
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>

                <span className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                  />
                  <SendPdfEmail toEmail={toEmail} fileUrl={convertedFileUrl} />
                </span>
              </div>

              <Button
                onClick={resetConverter}
                variant="outline"
                className="mt-4"
              >
                Convert Another Email
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HtmlToPdf;