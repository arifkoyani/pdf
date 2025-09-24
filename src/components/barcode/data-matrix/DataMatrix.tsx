"use client"

import { useState, useRef } from "react"
import { Download, X, ImageIcon, PaintBucket, Link, MessageSquare, Mail, Phone, Wifi, Eye, EyeOff, MessageCircle, Youtube, Facebook, X as XIcon, User, Building, Briefcase, Globe, MapPin, FileText, Coins, DollarSign, Hash, File, Type } from "lucide-react"
import { FlipWords } from "../../ui/flip-words/flip-words"
import { ColorPicker } from "../../color-picker/colorpicker"
import SendPdfEmail from "../../send-email/SendEmail"
import html2canvas from 'html2canvas'

export default function DataMatrixGenerator() {
  const words = ["Better", "Fast", "Perfect", "DataMatrix"]
  const [value, setValue] = useState("")
  const [angle, setAngle] = useState("0")
  const [narrowBarWidth, setNarrowBarWidth] = useState(25) // Changed to number for slider
  const [foreColor, setForeColor] = useState("#ff550d")
  const [backColor, setBackColor] = useState("#ffffff")
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [decorationImageUrl, setDecorationImageUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0) // Added upload progress
  const [uploading, setUploading] = useState(false) // Added uploading state
  const [toEmail, setToEmail] = useState("") // Email state for sending
  const [selectedFrame, setSelectedFrame] = useState("no-frame") // Selected frame state
  const frameRef = useRef<HTMLDivElement>(null) // Reference for the frame container
  const [inputMode, setInputMode] = useState<"text" | "numbers" | "urls" | "file-refs">("text") // Input mode state
  
  // DataMatrix specific state variables
  const [textInput, setTextInput] = useState("") // Text input for DataMatrix
  const [numberInput, setNumberInput] = useState("") // Number input for DataMatrix
  const [urlInput, setUrlInput] = useState("") // URL input for DataMatrix
  const [fileRefInput, setFileRefInput] = useState("") // File reference input for DataMatrix

  // Frame-specific styling configurations
  const frameConfigs = {
    'no-frame': {
      container: {
        width: '240px',
        height: '240px',
        backgroundColor: 'transparent',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      },
      qrCode: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '240px',
        height: '240px'
      },
      qrImage: {
        maxWidth: '240px',
        maxHeight: '240px'
      },
      preview: {
        container: {
          width: '80px',
          height: '80px'
        },
        qrCode: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '80px'
        },
        qrImage: {
          maxWidth: '80px',
          maxHeight: '80px'
        }
      }
    },
    'frame.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        backgroundPosition: 'center'
      },
      qrCode: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -65%)',
        width: '195px',
        height: '195px'
      },
      qrImage: {
        maxWidth: '185px',
        maxHeight: '185px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -56%)',
          width: '150px',
          height: '150px'
        },
        qrImage: {
          maxWidth: '55px',
          maxHeight: '55px'
        }
      }
    },
    'frame2.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'transparent',
      },
      qrCode: {
        position: 'absolute',
        top: '40%',
        left: '60%',
        transform: 'translate(-63%, -55%)',
        width: '170px',
        height: '170px'
      },
      qrImage: {
        maxWidth: '170px',
        maxHeight: '170px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '40%',
          left: '60%',
          transform: 'translate(-63%, -56%)',
          width: '55px',
          height: '55px'
        },
        qrImage: {
          maxWidth: '65px',
          maxHeight: '50px'
        }
      }
    },
    'frame3.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'white',
            },
      qrCode: {
        position: 'absolute',
        top: '5%',
        left: '20%',
        transform: 'translate(-11%, 6%)',
        width: '185px',
        height: '185px'
      },
      qrImage: {
        maxWidth: '185px',
        maxHeight: '185px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '5%',
          left: '20%',
          transform: 'translate(-11%, 8%)',
          width: '60px',
          height: '60px'
        },
        qrImage: {
          maxWidth: '62px',
          maxHeight: '62px'
        }
      }
    }
  }

  // Get current frame configuration
  const getCurrentFrameConfig = () => frameConfigs[selectedFrame] || frameConfigs['frame.png']

  const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m"

  const mapSliderToApiValue = (sliderValue: number) => {
    return Math.round((sliderValue / 100) * 70)
  }

  const removeUploadedImage = () => {
    setFile(null)
    setDecorationImageUrl(null)
  }

  // Upload image to PDF.co with progress
  const uploadImage = async () => {
    if (!file) return null
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const res = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()
      if (data && data.url) {
        setDecorationImageUrl(data.url)
        return data.url
      }
      return null
    } catch (error) {
      console.error("Upload error:", error)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Generate DataMatrix
  const generateDataMatrix = async () => {
    setLoading(true)
    try {
      let uploadedUrl = decorationImageUrl
      if (file && !uploadedUrl) {
        uploadedUrl = await uploadImage()
      }

      const apiNarrowBarWidth = mapSliderToApiValue(narrowBarWidth)
      console.log(" Slider value:", narrowBarWidth, "API value:", apiNarrowBarWidth)
      
      // Determine the value based on input mode
      let dataMatrixValue = ""
      if (inputMode === "text") {
        dataMatrixValue = textInput
      } else if (inputMode === "numbers") {
        dataMatrixValue = numberInput
      } else if (inputMode === "urls") {
        dataMatrixValue = urlInput
      } else if (inputMode === "file-refs") {
        dataMatrixValue = fileRefInput
      }
      
      console.log("this is value", dataMatrixValue)

      const response = await fetch("https://api.pdf.co/v1/barcode/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          name: "datamatrix.png",
          value: dataMatrixValue,
          type: "DataMatrix",
          inline: true,
          async: false,
          decorationImage: uploadedUrl || undefined,
          profiles: JSON.stringify({
            Angle: Number(angle),
            NarrowBarWidth: 30,
            ForeColor: foreColor,
            BackColor: backColor,
          }),
        }),
      })

      const data = await response.json()
      if (data.url) {
        setBarcodeUrl(data.url)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadDataMatrix = async () => {
    if (!barcodeUrl || !frameRef.current) return

    try {
      // If no frame is selected, download the DataMatrix directly
      if (selectedFrame === 'no-frame') {
        const response = await fetch(barcodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `datamatrix-no-frame-${textInput || numberInput || urlInput || fileRefInput || "generated"}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return
      }

      // Use html2canvas to capture the frame container with the DataMatrix
      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: 'transparent',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: frameRef.current.offsetWidth,
        height: frameRef.current.offsetHeight,
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `datamatrix-${selectedFrame.replace('.png', '')}-${textInput || numberInput || urlInput || fileRefInput || "generated"}.png`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }, 'image/png')
    } catch (error) {
      console.error("Download error:", error)
      // Fallback to original method if html2canvas fails
      try {
        const response = await fetch(barcodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `datamatrix-${textInput || numberInput || urlInput || fileRefInput || "generated"}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (fallbackError) {
        console.error("Fallback download error:", fallbackError)
      }
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#fef0e9] shadow-2xl rounded-3xl border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
          Generating To
          <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
            <FlipWords words={words} />
          </div>
        </div>
        <p className="text-gray-600">Create custom DataMatrix codes with logo images</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Side - Controls */}
      <div className="space-y-6">
        {/* Mode Toggle Buttons */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <button
            onClick={() => setInputMode("text")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              inputMode === "text"
                ? "bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Type className="h-4 w-4" />
            Text
          </button>
          <button
            onClick={() => setInputMode("numbers")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              inputMode === "numbers"
                ? "bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Hash className="h-4 w-4" />
            Numbers
          </button>
          <button
            onClick={() => setInputMode("urls")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              inputMode === "urls"
                ? "bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Link className="h-4 w-4" />
            URLs
          </button>
          <button
            onClick={() => setInputMode("file-refs")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              inputMode === "file-refs"
                ? "bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <File className="h-4 w-4" />
            File References
          </button>
        </div>

        {/* Dynamic Input Section */}
        {inputMode === "text" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Enter your text (Your DataMatrix will be generated automatically)
            </label>
            <textarea
              placeholder="Enter any text to encode into DataMatrix..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={4}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors resize-none"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> This will create a DataMatrix containing your text. When scanned, it will display the text directly.
              </p>
            </div>
          </div>
        ) : inputMode === "numbers" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Enter your numbers (Your DataMatrix will be generated automatically)
            </label>
            <input
              type="text"
              placeholder="Enter numbers only (e.g., 9876543210)"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>Tip:</strong> This will create a DataMatrix containing your numbers. Perfect for product codes, serial numbers, or ID numbers.
              </p>
            </div>
          </div>
        ) : inputMode === "urls" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Enter your URL (Your DataMatrix will be generated automatically)
            </label>
            <input
              type="url"
              placeholder="Enter a URL (e.g., https://example.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
            />
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                <strong>Tip:</strong> This will create a DataMatrix containing your URL. When scanned, it will open the URL in the default browser.
              </p>
            </div>
          </div>
        ) : inputMode === "file-refs" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Enter your file reference or ID (Your DataMatrix will be generated automatically)
            </label>
            <input
              type="text"
              placeholder="Enter file reference or ID (e.g., DOC-2024-001, FILE-12345)"
              value={fileRefInput}
              onChange={(e) => setFileRefInput(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
            />
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700">
                <strong>Tip:</strong> This will create a DataMatrix containing your file reference. Perfect for document tracking, inventory management, or system IDs.
              </p>
            </div>
          </div>
        ) : null}

          {/* Improved Color Picker Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Custom DataMatrix Styling
            </h3>
            <div className="space-y-4 flex flex-col gap-4">
              {/* Foreground Color */}
              <div className="flex  gap-4">

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Foreground Color</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">

                     <ColorPicker initialColor={foreColor} onChange={setForeColor} label="" />
                  </div>
               
                </div>
              </div>
              
              {/* Background Color */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Background Color</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <ColorPicker initialColor={backColor} onChange={setBackColor} label="" />
                  </div>
                </div>
              </div>
              </div>

              
              {/* Color Preview */}
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Color Preview</p>
                  <div className="flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center"
                      style={{ backgroundColor: backColor }}
                    >
                      <div 
                        className="w-8 h-8 rounded-md"
                        style={{ backgroundColor: foreColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">DataMatrix Pixel Size: {narrowBarWidth}%</label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="100"
              value={narrowBarWidth}
              onChange={(e) => setNarrowBarWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ff550d 0%, #ff911d ${narrowBarWidth}%, #e5e7eb ${narrowBarWidth}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </div>

        {/* Angle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Rotation Angle</label>
          <select
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
          >
            <option value="0">0° (Normal)</option>
            <option value="1">90° (Right)</option>
            <option value="2">180° (Upside down)</option>
            <option value="3">270° (Left)</option>
          </select>
        </div>

        {/* Upload Decoration Image */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Logo Image (Optional)</label>

          {!file && !decorationImageUrl && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff550d] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="mx-auto h-12 w-12 text-[#ff550d] mb-4" />
                <p className="text-gray-600">Click to upload a logo image</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>
          )}

          {(file || decorationImageUrl) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-8 w-8 text-[#ff550d]" />
                  <div>
                    <p className="font-medium text-gray-900">{file ? file.name : "Uploaded Image"}</p>
                    <p className="text-sm text-gray-500">{decorationImageUrl ? "Ready to use" : "Ready to upload"}</p>
                  </div>
                </div>
                <button
                  onClick={removeUploadedImage}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#ff550d] to-[#ff911d] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={generateDataMatrix}
          disabled={loading || (
            inputMode === "text" ? !textInput : 
            inputMode === "numbers" ? !numberInput : 
            inputMode === "urls" ? !urlInput : 
            inputMode === "file-refs" ? !fileRefInput : 
            false
          )}
          className="w-full py-4 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate DataMatrix"
          )}
        </button>
        </div>

        {/* Right Side - Results */}
        <div className="bg-gradient-to-br from-gray-50 to-white  flex flex-col  rounded-2xl border border-gray-200 p-6 overflow-hidden ">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              DataMatrix Preview
            </h3>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            {!barcodeUrl ? (
              <div className="text-center space-y-4 bg-[#fef0e9]">
                <div className="w-48 h-48  rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[#ff590e]" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">No DataMatrix Yet</p>
                      <p className="text-xs text-gray-400">Enter content and generate</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-hidden">
                {/* Two Column Layout: DataMatrix Left, Frame Selection Right */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full items-start">
                  
                  {/* Left Side - Selected Frame Container for Screenshot */}
                  <div className="flex flex-col items-center justify-center space-y-6 p-4">
                    <div 
                      ref={frameRef}
                      className={`inline-block p-4 rounded-2xl transition-shadow duration-300 qr-frame-container flex-shrink-0 ${
                        selectedFrame === 'no-frame' 
                          ? 'shadow-none' 
                          : 'shadow-xl hover:shadow-2xl'
                      }`}
                      style={{
                        backgroundImage: selectedFrame !== 'no-frame' ? `url('/${selectedFrame}')` : 'none',
                        backgroundColor: selectedFrame === 'no-frame' ? 'transparent' : 'transparent',
                        padding: selectedFrame === 'no-frame' ? '0' : '16px',
                        ...getCurrentFrameConfig().container,
                        position: 'relative'
                      }}
                    >
                      {/* DataMatrix positioned inside the frame */}
                      <div 
                        className="absolute inset-0   flex justify-center items-center"
                        style={getCurrentFrameConfig().qrCode}
                      >
                        <img 
                          src={barcodeUrl} 
                          alt="Generated DataMatrix" 
                          className="w-full h-full  object-contain filter drop-shadow-sm"
                          style={getCurrentFrameConfig().qrImage}
                        />
                      </div>
                      
                     
                    </div>

                    {/* Action Buttons - Below DataMatrix */}
                    <div className="w-full max-w-sm space-y-4">
                      <button
                        onClick={downloadDataMatrix}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download</span>
                      </button>
                      
                      {/* Email Section */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <label className="text-sm font-semibold text-gray-700 block mb-3">
                          Send via Email
                        </label>
                        <div className="flex flex-col gap-3">
                          <input
                            type="email"
                            placeholder="Enter recipient email"
                            value={toEmail}
                            onChange={(e) => setToEmail(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#ff550d] focus:outline-none transition-all duration-200 text-sm hover:border-gray-300"
                          />
                          <SendPdfEmail toEmail={toEmail} fileUrl={barcodeUrl} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Frame Selection */}
                  <div className="flex flex-col items-center justify-start p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Choose Frame Style</h4>
                    <div className="flex flex-col gap-4 items-center max-w-[160px]">
                      {['no-frame', 'frame.png', 'frame2.png', 'frame3.png'].map((frameFile, index) => {
                        const frameConfig = frameConfigs[frameFile] || frameConfigs['frame.png'];
                        const frameNames = ['Normal', 'Classic', 'Modern', 'Elegant'];
                        return (
                          <div
                            key={frameFile}
                            onClick={() => setSelectedFrame(frameFile)}
                            className={`cursor-pointer p-3 rounded-xl transition-all duration-300 w-full group ${
                              selectedFrame === frameFile 
                                ? 'ring-4 ring-[#ff550d] border-2 border-[#ff911d] ring-opacity-30 bg-gradient-to-br from-[#fef0e9] to-white shadow-xl scale-105' 
                                : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-lg border border-gray-200 hover:border-gray-300 hover:scale-102 transform'
                            }`}
                          >
                            {/* Frame with DataMatrix Preview */}
                            <div
                              className="bg-white rounded-lg border border-gray-200 mb-3 relative mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-100"
                              style={{
                                backgroundImage: frameFile !== 'no-frame' ? `url('/${frameFile}')` : 'none',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundColor: frameFile === 'no-frame' ? 'transparent' : 'white',
                                border: frameFile === 'no-frame' ? 'none' : '1px solid #e5e7eb',
                                ...frameConfig.preview.container
                              }}
                            >
                              {/* DataMatrix positioned inside each frame preview */}
                              <div 
                                className="absolute inset-0 flex   items-center justify-center"
                                style={frameConfig.preview.qrCode}
                              >
                                <img 
                                  src={barcodeUrl} 
                                  alt="DataMatrix Preview" 
                                  className="w-full h-full object-contain filter drop-shadow-sm"
                                  style={frameConfig.preview.qrImage}
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className={`text-xs font-semibold transition-colors duration-200 ${
                                selectedFrame === frameFile 
                                  ? 'text-[#ff550d]' 
                                  : 'text-gray-600 group-hover:text-gray-800'
                              }`}>
                                {frameNames[index]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        /* Frame container styles for better rendering */
        .qr-frame-container {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .qr-frame-container img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          filter: contrast(1.1);
          transition: all 0.2s ease-in-out;
        }

        .qr-frame-container:hover {
          transform: translateY(-2px);
        }

        /* Smooth scaling animations */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .scale-105 {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
