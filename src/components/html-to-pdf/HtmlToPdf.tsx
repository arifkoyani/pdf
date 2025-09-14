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
  "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn";

type AppState = "input" | "converting" | "ready";

const HtmlToPdf = () => {
  const words = ["Better", "Fast", "Perfect", "Email"];
  const [state, setState] = useState<AppState>("input");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>("");

  // copy system
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // send email system
  const [toEmail, setToEmail] = useState("");

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      alert("Failed to copy link");
    }
  };

  // Convert HTML to PDF
  const convertHtmlToPdf = async () => {
    if (!htmlCode.trim()) {
      alert("Please enter HTML code");
      return;
    }
    
    setState("converting");

    try {
      const response = await fetch("https://api.pdf.co/v1/pdf/convert/from/html", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlCode,
          name: "converted-document.pdf",
          margins: "5px 5px 5px 5px",
          paperSize: "Letter",
          orientation: "Portrait",
          printBackground: true,
          header: "",
          footer: "",
          mediaType: "print",
          async: false,
        }),
      });

      const data = await response.json();
      if (data.error === false && data.url) {
        setConvertedFileUrl(data.url);
        setState("ready");
      } else {
        alert("Conversion failed. Please try again.");
        setState("input");
      }
    } catch {
      alert("Conversion failed. Please try again.");
      setState("input");
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
    setState("input");
    setConvertedFileUrl(null);
    setHtmlCode("");
    setToEmail("");
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Convert HTML to PDF
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
          Paste your HTML code and convert it to PDF
        </p>
      </div>

      <Card className="h-fit px-32 py-2 border-0 bg-transparent">
        <div className="text-center space-y-6">
          {state === "input" && (
          <div className="space-y-4">
         <textarea
  value={htmlCode}
  onChange={(e) => setHtmlCode(e.target.value)}
  placeholder="Paste your HTML code here..."
  className="w-[800px] p-4 border border-gray-300 rounded-lg h-64 text-sm font-mono resize-y"
/>

          <Button
            onClick={convertHtmlToPdf}
            disabled={!htmlCode.trim()}
            className="w-full max-w-4xl bg-[#f16625] hover:bg-[#ff550d] text-white text-lg px-8 py-4 h-auto"
          >
            Convert to PDF
          </Button>
        </div>
          )}

          {state === "converting" && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">Converting HTML to PDF...</p>
            </div>
          )}

          {state === "ready" && convertedFileUrl && (
            <div className="space-y-6">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() =>
                      downloadFile(convertedFileUrl, "converted-document.pdf", 0)
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
                Convert Another HTML
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HtmlToPdf;