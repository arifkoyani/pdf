import { useState } from "react";
import AccountBalance from "@/components/account-balance/AccountBalance";
import BarcodeGenerator from "@/components/barcode/Barcode";
import ExtractEmailAttachments from "@/components/extract-email-attachment/ExtractEmailAttachment";

const Index = () => {
const [isOpen, setIsOpen] = useState(false);

  return (
  <>
  <nav className="bg-[#fef0e9]  dark:bg-black   border-b-[0.1px] border-[#C3C4C6]">
      <div className="max-w-7xl  mx-auto py-2">
        <div className="flex justify-between items-center h-16">
        <img src="/logo.png" alt="Logo" width={100} height={50} />

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="/pdf-to-png" className="text-black dark:text-white hover:text-[#ff7726]">
              Home
            </a>
            <a href="/features" className="text-black dark:text-white hover:text-[#ff7726]">
              Features
            </a>
            <a href="/tools" className="text-black dark:text-white hover:text-[#ff7726]">
              All PDF Tools
            </a>
            <a href="/contact" className="text-black dark:text-white hover:text-[#ff7726]">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black dark:text-white focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 pb-3 space-y-2">
          <a href="/" className="block text-black dark:text-white hover:text-[#ff7726]">
            Home
          </a>
          <a href="/features" className="block text-black dark:text-white hover:text-[#ff7726]">
            Features
          </a>
          <a href="/tools" className="block text-black dark:text-white hover:text-[#ff7726]">
            All PDF Tools
          </a>
          <a href="/contact" className="block text-black dark:text-white hover:text-[#ff7726]">
            Contact
          </a>
        </div>
      )}
    </nav>
{/* <AccountBalance/> */}
<BarcodeGenerator/>

  </>
  )
};

export default Index;

// GTIN14
// DataMatrix
// GTIN8
// Aztec
// /AustralianPostCode
// Code128
// Code39Mod43
// Code39
// Code39Mod43Extended
// Code93
// EAN13
// EAN2
// EAN5
// EAN8
// GS1 - 128
// UPCA--->GTIN12

// MicroPDF417
// {
//   "name": "MicroPDF.png",
//   "value": "HELLO1234567890",
//   "type": "MicroPDF417",
//   "inline": false,
//   "async": false
// }

// Interleaved2of5
// {
//   "name": "Interleaved2of5.png",
//   "value": "12345678",
//   "type": "I2of5",
//   "inline": false,
//   "async": false,
//   "profiles": "{'NarrowBarWidth': 2}"
// }

// ITF14
// MaxiCode
// MICR

// MSI
// {
//   "name": "MSI.png",
//   "value": "1234567890",
//   "type": "MSI",
//   "inline": false,
//   "async": false,
//   "profiles": "{'NarrowBarWidth': 2}"
// }

// Pharmacode	
// PZN
// UPCE
// GTIN13
// IntelligentMail

// sms 
// curl --location --request POST 'https://api.pdf.co/v1/barcode/generate' \
// --header 'Content-Type: application/json' \
// --header 'x-api-key: *******************' \
// --data-raw '{
//   "name": "sms_qr.png",
//   "value": "sms:+923001234567?body=Hello%20from%20QR%20code",
//   "type": "QRCode",
//   "inline": false,
//   "async": false
// }'

// email 
// mailto:someone@example.com?subject=Your%20Subject&body=Your%20message%20here

// Text    
// WiFi QR Code 
// vCard QR Code
// MP3 QR Code
// PDF QR Code
// Bitcoin QR Code

















// Codabar-------no
// CodablockF------No
// Code16K----No
// Code39Extended
// Code39Mod43Extended
// DPMDataMatrix
// GS1DataBarExpanded
// GS1DataBarExpandedStacked
// GS1DataBarStacked
// GS1DataBarOmnidirectional
// GS1DataBarLimited
// PostNet
// RoyalMail
// RoyalMailKIX



{/* <ExcelToPdf/> */}

{/* <ExcelToPdf/> */}

{/* <ExcelToXml/> */}

{/* <CsvToJson/> */}

{/* <ExcelToJson/> */}

{/* <CsvToHtml/> */}

{/* <ExcelToHtml/> */}

{/* <ExcelToCsv/> */}

{/* <AccountBalance/> */}

{/* <ExtractAttachmentsFromPdf/> */}

{/* <ExtractEmailAttachments/> */}

{/* <ExtractDataFromEmail/> */}

{/* <HtmlToPdf/> */}

{/* <EmailToPdf/> */}

{/* <NotSearchablePdf/> */}

{/* <SearchablePdf/> */}

{/* <SplitPdfByText/> */}

{/* <SplitPdf/> */}

{/* <ZipToPdf/> */}

{/* <XlsxsToPdf/> */}

{/* <TxtsToPdf/> */}

{/* <RtfsToPdf/> */}

{/* <PngsToPdf/> */}

{/* <JpgsToPdf/> */}

{/* <DocxToPdf/> */}

{/* <MergeAnyToPdf/> */}

{/* <PdfsToPdf/> */}






{/* <AIInvoiceParser/> */}

{/* <QrCodeScanner/> */}
{/* <JpgToJson/> */}

{/* <JpgToJson/> */}

{/* <PngToJson/> */}

{/* <JpgToJson/> */}

{/* <PdfToJson/> */}

{/* <AddPasswordToPdf/> */}

{/* <RemovePasswordFromPdf/> */}

{/* <CompressPdf/> */}

{/* <RotatePagesUsingAi/> */}

{/* <RotatPagesUsingAi/> */}

{/* <RotateSelectedPages/> */}

{/* <PdfDeletePages/> */}

{/* <UrlToPdfConverter/> */}

{/* <CsvToPdfConverter/> */}


{/* <PdfToXml/> */}

{/* <JpgToXlsx/> */}
{/* <PdfToXlsx/> */}
{/* <PngToXlsx/> */}


{/* <PdfToXls/> */}
{/* <JpgToXls/> */}
{/* <PngToXls/> */}



{/* <PdfFormsInfoReader/> */}
{/* <PdfInfoReader/>  */}

{/* <PdfToTextClassifier/> */}

{/* <PdfToJsonByAi/> */}
{/* <SearchTextDelete/> */}
    // <PdfToJsonConverter/>

{/* <SearchTextReplaceImage/> */}
{/* <SearchTextReplace/> */}

{/* <TxtToPdfConverter/> */}
{/* <RTFToPdfConverter/> */}
{/* <DocToPdfConverter/> */}


{/* <PdfToHtmlConverter/> */}



{/* <PdfToPngConverter/> */}
{/* <PDFToTiffConverter/> */}
{/* <PDFToJpgConverter/> */}
{/* <PDFTowebpConverter/> */}


{/* <JpgToPdfConverter/> */}
{/* <TiffToPdfConverter/> */}
{/* <PngToPdfConverter/> */}









