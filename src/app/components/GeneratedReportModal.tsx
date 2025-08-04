"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GeneratedReportModalProps {
  summary: string;
  onClose: () => void;
}

export default function GeneratedReportModal({
  summary,
  onClose,
}: GeneratedReportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg w-[90vw] max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Download functionality coming soon")}
          >
            Download Report
          </Button>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed grow">
          {summary}
        </div>
      </div>
    </div>
  );
}
