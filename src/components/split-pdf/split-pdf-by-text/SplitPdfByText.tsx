"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Download, FileText, ImageIcon } from "lucide-react"
import { FlipWords } from "@/components/ui/flip-words/flip-words"
import Spinner from "@/components/ui/loader/loader"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const API_KEY = "arifhussainkoyan5@gmail.com_1oplhALdIhZQG31zqSWJKwXdixugSvGZP5JRDMnqMBaDUXS7rZCpsAMJQ7yYtrHn"

type AppState = "select" | "uploading" | "tabs" | "splitting" | "ready"

interface UploadedFile {
  id: string
  name: string
  url: string
  size: string
  type: string
}

interface SplitResult {
  url: string
  name: string
}

const splitOptions = [
  {
    id: "qr-code",
    label: "QR Code Split",
    pattern: "[[barcode:qrcode]]",
    description: "Split by QR codes found in PDF",
    example: "[[barcode:qrcode]]",
  },
  {
    id: "datamatrix",
    label: "DataMatrix Split",
    pattern: "[[barcode:datamatrix]]",
    description: "Split by DataMatrix barcodes found in PDF",
    example: "[[barcode:datamatrix]]",
  },
  {
    id: "qr-with-value",
    label: "QR Code with Value",
    pattern: "[[barcode:qrcode /pdf\\.co/]]",
    description: "Split by QR codes containing specific text",
    example: "[[barcode:qrcode /pdf\\.co/]]",
  },
  {
    id: "multiple-barcodes",
    label: "Multiple Barcode Types",
    pattern: "[[barcode:qrcode,datamatrix /pdf\\.co/]]",
    description: "Split by QR codes or DataMatrix with specific text",
    example: "[[barcode:qrcode,datamatrix /pdf\\.co/]]",
  },
  {
    id: "text-search",
    label: "Text Search",
    pattern: "search text here",
    description: "Split by finding specific text in PDF",
    example: "type text here to search and split ",
  },
  {
    id: "custom-barcode",
    label: "Custom Pattern",
    pattern: "[[barcode:code128]]",
    description: "Custom barcode pattern for splitting",
    example: "[[barcode:code128]]",
  },
]

const SplitPdfByText = () => {
  const words = ["Split", "Separated", "Divided", "Extracted"]
  const [state, setState] = useState<AppState>("select")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [splitResults, setSplitResults] = useState<SplitResult[]>([])
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({})
  const [currentlyUploading, setCurrentlyUploading] = useState<string | null>(null)
  const [processingMessage, setProcessingMessage] = useState("Splitting PDF...")
  const [selectedTab, setSelectedTab] = useState("qr-code")
  const [searchString, setSearchString] = useState("[[barcode:qrcode]]")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    return <ImageIcon className="w-5 h-5 text-red-500" />
  }

  const isValidFileType = (file: File): boolean => {
    const validTypes = ["application/pdf"]
    const validExtensions = ["pdf"]
    const fileExtension = file.name.toLowerCase().split(".").pop()

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isValidFileType(file)) {
        uploadFile(file)
      } else {
        alert("Please select a PDF file (.pdf)")
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString()
    setCurrentlyUploading(fileId)
    setState("uploading")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval)
            return 90
          }
          return prev + Math.random() * 15 + 5
        })
      }, 200)

      const response = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      })

      const data = await response.json()
      clearInterval(uploadInterval)
      setUploadProgress(100)

      setTimeout(() => {
        if (data.error === false) {
          const newFile: UploadedFile = {
            id: fileId,
            name: file.name,
            url: data.url,
            size: formatFileSize(file.size),
            type: file.type,
          }

          setUploadedFiles([newFile])
          setState("tabs")
          setUploadProgress(0)
        } else {
          setState("select")
          setUploadProgress(0)
          alert(`Upload failed: ${data.message || "Please try again."}`)
        }
      }, 500)
    } catch (error) {
      console.error("Upload error:", error)
      setState("select")
      setUploadProgress(0)
      alert("Upload failed. Please try again.")
    } finally {
      setCurrentlyUploading(null)
    }
  }

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId)
    const selectedOption = splitOptions.find((option) => option.id === tabId)
    if (selectedOption) {
      setSearchString(selectedOption.example)
    }
  }

  const removeFile = () => {
    setUploadedFiles([])
    setState("select")
    setSplitResults([])
    setSearchString("[[barcode:qrcode]]")
    setSelectedTab("qr-code")
  }

  const splitPdf = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload a PDF file first")
      return
    }

    if (!searchString.trim()) {
      alert("Please specify search pattern for splitting")
      return
    }

    setState("splitting")
    setProcessingMessage("Scanning PDF for barcodes/text and splitting...")

    try {
      const response = await fetch("https://api.pdf.co/v1/pdf/split2", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFiles[0].url,
          searchString: searchString.trim(),
          excludeKeyPages: true,
          regexSearch: false,
          caseSensitive: false,
          inline: true,
          name: `output-split-by-search-${Date.now()}`,
          async: false,
        }),
      })

      const data = await response.json()
      console.log("Split API response:", data)

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `split-document-${index + 1}.pdf`,
        }))

        setSplitResults(results)
        setState("ready")
      } else {
        console.error("PDF split failed:", data)
        alert(`PDF split failed: ${data.message || "Please try again."}`)
        setState("tabs")
      }
    } catch (error) {
      console.error("Split error:", error)
      alert("PDF split failed. Please try again.")
      setState("tabs")
    }
  }

  const resetConverter = () => {
    setState("select")
    setUploadProgress(0)
    setUploadedFiles([])
    setSplitResults([])
    setSearchString("[[barcode:qrcode]]")
    setSelectedTab("qr-code")
    setProcessingMessage("Scanning PDF for barcodes/text and splitting...")
    setDownloading({})
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloading((prev) => ({ ...prev, [index]: true }))
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error(err)
      alert("Failed to download file")
    } finally {
      setDownloading((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start">
      <div className="w-full bg-gradient-to-r from-[#FEEDE5] to-[#FFFFFF] shadow-xl px-4 py-5 mb-5">
        <h1 className="text-sm text-black font-medium text-center">
          Every tool you need to work with Documents in one place
        </h1>
      </div>

      <div className="pb-10 flex flex-col justify-center items-center">
        <div className="h-[4rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
            Split PDF Files Into
            <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">Split PDF into Multiple Documents</p>
        <p className="text-[#a855f7] text-sm mt-2 font-medium text-center">
          Extract specific pages or ranges from your PDF documents.
        </p>
      </div>

      <Card className="w-full max-w-4xl p-8 shadow-elegant border-0 backdrop-blur-sm">
        <div className="text-center space-y-6">
          {/* Upload Section */}
          {state === "select" && (
            <div className="space-y-6">
              <div
                className="border-4 flex items-center justify-center space-x-6 p-4 px-32 border-[#ff7525] shadow-lg rounded-xl cursor-pointer bg-[#f16625] hover:shadow-[#f16625] transition-all hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-white" />
                <h3 className="text-xl font-semibold text-white">Choose PDF File</h3>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              </div>

              <p className="text-sm text-muted-foreground">Supported: PDF (PDF Format)</p>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#f16625]" />
                <span className="text-lg font-medium">Uploading PDF...</span>
              </div>
              <Progress value={uploadProgress} className="h-4" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {Math.round(uploadProgress)}% uploaded
                {uploadProgress < 90 && " - Processing file..."}
                {uploadProgress >= 90 && " - Almost done!"}
              </p>
            </div>
          )}

          {/* Tabs Section - After Upload */}
          {state === "tabs" && (
            <div className="space-y-6">
              {/* Uploaded File Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-left">Uploaded PDF File</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    title="Remove file"
                    className="text-red-500 hover:text-red-700 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(uploadedFiles[0]?.name || "")}
                    <div className="text-left">
                      <p className="font-medium text-sm">{uploadedFiles[0]?.name}</p>
                      <p className="text-xs text-muted-foreground">{uploadedFiles[0]?.size}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Pattern Input Field */}
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Search Pattern for Splitting</label>

                  <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1">
                      {splitOptions.map((option) => (
                        <TabsTrigger
                          key={option.id}
                          value={option.id}
                          className="text-xs px-2 py-2 data-[state=active]:bg-[#f16625] data-[state=active]:text-white"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {splitOptions.map((option) => (
                      <TabsContent key={option.id} value={option.id} className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-left">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm text-gray-700">{option.label}</h4>
                            <code className="bg-white px-3 py-1 rounded border text-[#f16625] font-mono text-xs">
                              {option.pattern}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Search pattern:</span>
                            <input
                              type="text"
                              value={searchString}
                              onChange={(e) => setSearchString(e.target.value)}
                              className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#f16625] focus:border-transparent"
                              placeholder={option.example}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              {/* Split Button */}
              <Button
                onClick={splitPdf}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 h-auto rounded-xl shadow-xl hover:scale-105 transition-all"
              >
                <FileText className="w-5 h-5 mr-2" />
                Split PDF
              </Button>

              {/* Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> This cURL splits a PDF by detecting specific barcodes or text inside it. Input:
                  PDF file URL + search string (barcode pattern or text) + options (exclude page, case sensitivity,
                  inline, etc.). Process: API scans PDF, finds barcode/text, and cuts the PDF at those pages. Output:
                  Multiple smaller PDFs (direct download if inline:true, or URLs if inline:false).
                </p>
              </div>
            </div>
          )}

          {/* Splitting Process */}
          {state === "splitting" && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner />
              <p className="text-muted-foreground">{processingMessage}</p>
              <p className="text-sm text-blue-600">This may take a few moments for PDF processing and splitting...</p>
            </div>
          )}

          {/* Ready State - Download Split Files */}
          {state === "ready" && splitResults.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">
                  ✅ Successfully split PDF into {splitResults.length} document(s)!
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-left">Split Results:</h3>
                {splitResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{result.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => downloadFile(result.url, result.name, index)}
                        disabled={downloading[index]}
                        className="bg-[#f16625] hover:bg-[#e55d1d] text-white"
                        size="sm"
                      >
                        {downloading[index] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-4 bg-transparent">
                Split Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SplitPdfByText
