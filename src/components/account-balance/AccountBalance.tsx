"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, RefreshCw, User, Coins } from "lucide-react";

const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m";

interface BalanceData {
  remainingCredits: number;
}

const AccountBalance = () => {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.pdf.co/v1/account/credit/balance", {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance information");
      }

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#fff9f6] flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-2xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-[#f16625] mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Account Balance</h1>
          </div>
          <p className="text-gray-600 mb-2">Check your remaining credits</p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            <span>Owned by: arifkoyani</span>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-white rounded-xl shadow-lg p-6 mb-6 border-0">
          <div className="text-center">
            <Button
              onClick={checkBalance}
              disabled={loading}
              className="bg-[#f16625] hover:bg-[#ff550d] text-white px-8 py-3 text-lg font-medium rounded-full transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Checking Balance...
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Check Balance
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {balance && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Available Credits</span>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {formatCredits(balance.remainingCredits)}
              </div>
              <p className="text-sm text-gray-500 mt-1">credits remaining</p>
            </div>
          )}

          {!balance && !error && (
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Click the button above to check your current account balance.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccountBalance;
