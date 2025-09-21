import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m";
const SMTP_USERNAME = "arifkoyani@gmail.com";
const SMTP_PASSWORD = "anpttursrfdgoskv"; // Gmail App Password

interface SendEmailProps {
  toEmail: string;
  fileUrl: string;
}

const SendPdfEmail: React.FC<SendEmailProps> = ({ toEmail, fileUrl }) => {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!toEmail || !fileUrl) {
      alert("Recipient email and file URL are required");
      return;
    }

    setLoading(true);

    const payload = {
      url: fileUrl,
      from: `WhatPDF <${SMTP_USERNAME}>`,
      to: toEmail,
      subject: "Download Your Converted File from WhatPDF",
      bodytext: `Hello,
    
    Your PDF has been securely protected with a password using WhatPDF.com.
    You can download your protected PDF from the following link: ${fileUrl}
    
    Keep your password safe to access the file.
    
    Thank you,
    The WhatPDF Team`,
      bodyHtml: `
        <p className="bg-black">Hello,</p>
        <p>Your PDF has been securely converted and processed using <strong><a href="www.whatpdf.com" target="_blank">Download PDF</a></strong>.</p>
        <p>You can download your  PDF from the link below:</p>
        <p>Download PDF</a></p>
        <p>Keep your pdf safe to access the file.</p>
        <p>Thank you,<br />The WhatPDF Team</p>
      `,
      smtpserver: "smtp.gmail.com",
      smtpport: "587",
      smtpusername: SMTP_USERNAME,
      smtppassword: SMTP_PASSWORD,
      async: false,
    };
    

    try {
      const response = await fetch("https://api.pdf.co/v1/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.error) {
        toast("Email sent successfully", {
          description: "Your email has been delivered.",
          style: {
            background: "#fef0e9",   // dark background
            color: "#ff550d",           // white text
            fontWeight: "bold",
            fontSize: "16px",
            borderRadius: "8px",
            padding: "4px",
          },
        }) 
      } else {
        alert("Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSend}
      disabled={loading || !fileUrl || !toEmail}
      className="bg-[#f16625] text-white"
    >
      {loading ? "Sending..." : "Send Email"}
    </Button>
  );
};

export default SendPdfEmail;
