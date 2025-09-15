"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, Copy, Upload } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words/flip-words";
import Spinner from "@/components/ui/loader/loader";

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = "select" | "uploading" | "converting" | "ready";

const ExcelToCsv = () => {
  const words = ["Excel", "Spreadsheet", "Data", "Conversion"];
  const [state, setState] = useState<AppState>("select");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
      convertExcelToCsv(file);
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

  // Convert Excel to CSV
  const convertExcelToCsv = async (file: File) => {
    setState("uploading");
    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      setState("select");
      return;
    }
    setState("converting");

    try {
      const response = await fetch("https://api.pdf.co/v1/xls/convert/to/csv", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          async: false,
          name: "converted-file"
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
      link.download = fileName || "converted-file.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    } catch {
      alert("Download failed. Please try again.");
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const resetConverter = () => {
    setState("select");
    setConvertedFileUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Convert Excel to CSV
        </h1>
      </div>

      <div className="pb-10">
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Convert
            <div className="w-[180px] sm:w-[220px] md:w-[260px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Upload your Excel xls/xlsx file  and convert it to CSV format
        </p>
      </div>

      <Card className="h-fit px-8 md:px-32 py-8 border-0 bg-transparent w-full max-w-4xl">
        <div className="text-center space-y-6">
          {state === "select" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xls,.xlsx,.xlsm"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={handleFileSelect}
                className="w-full max-w-md bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
              >
                <Upload className="w-5 h-5 mr-2" />
                Select Excel File
              </Button>
              
              {/* Information text */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> During conversion you should not expect any Word macros 
                  to operate as we do not support Office macros.
                </p>
              </div>
            </div>
          )}

          {(state === "uploading" || state === "converting") && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">
                {state === "uploading" ? "Uploading file..." : "Converting to CSV..."}
              </p>
            </div>
          )}

          {state === "ready" && convertedFileUrl && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold text-green-600">Conversion Complete!</h2>
                <p className="text-gray-600">Your Excel file has been successfully converted to CSV format.</p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => downloadFile(convertedFileUrl, "converted-file.csv", 0)}
                    disabled={isDownloading}
                    className="flex-1 bg-[#f16625] shadow-xl hover:scale-105 transition-all text-lg px-8 py-4 h-auto text-white rounded-xl"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download CSV
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(convertedFileUrl, 0)}
                    title="Copy download link"
                    className={
                      copiedIndex === 0 ? "bg-green-500 text-white" : ""
                    }
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>

                {isDownloading && (
                  <div className="space-y-2">
                    <Progress value={downloadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">
                      Downloading... {Math.round(downloadProgress)}%
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={resetConverter}
                variant="outline"
                className="mt-4"
              >
                Convert Another File
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Progress component (if not already imported)
const Progress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-[#f16625] h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default ExcelToCsv;