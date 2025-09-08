import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";
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
      from: `Arif Koyani <${SMTP_USERNAME}>`,
      to: toEmail,
      subject: "PDF File",
      bodytext: "Please check the attached PDF file.",
      bodyHtml: "<p>Please check the attached PDF file.</p>",
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
        toast("Email sent successfully ✅");
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
