import { useState } from "react";
import MergeAnyToPdf from "../components/merging-to-pdfs/merge-any-to-pdf/MergeAnyToPdf"
import DocxToPdf from "@/components/merging-to-pdfs/docs-to-pdf/DocxToPdf";
import JpgsToPdf from "@/components/merging-to-pdfs/Jpg-to-pdf/JpgsToPdf";
import PngsToPdf from "@/components/merging-to-pdfs/pngs-to-pdf/PngsToPdf";
import RtfsToPdf from "@/components/merging-to-pdfs/rtfs-to-pdf/RtfsToPdf";
import TxtsToPdf from "@/components/merging-to-pdfs/txts-to-pdf/TxtsToPdf";
import XlsxToPdf from "@/components/merging-to-pdfs/xlsxs-to-pdf/XlsxsToPdf";
import XlsxsToPdf from "@/components/merging-to-pdfs/xlsxs-to-pdf/XlsxsToPdf";
import ZipToPdf from "@/components/merging-to-pdfs/zips-to-pdf/ZipToPDF";
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
    <ZipToPdf/>
  </>
  )
};



export default Index;


// Extract Data from Email File
// Extract Email Attachment
// Extract Attachment from pdf
// Make Text Searchable
// Make Text Unsearchable
// PDF Find Text
// Find Text in Table with AI
// PDF Split
// Excel Conversion
// Convert HTML into PDF.
// Convert CSV, XLS, XLSX files into PDF.



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

{/* <AIInvoiceParser/> */}

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









