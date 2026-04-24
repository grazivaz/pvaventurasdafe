"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = "Copiar", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
        copied
          ? "bg-green-600 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      } ${className}`}
    >
      {copied ? "✓ Copiado!" : `📋 ${label}`}
    </button>
  );
}
