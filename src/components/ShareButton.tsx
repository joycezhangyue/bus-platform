import { useState, useCallback } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import type { Trip } from '../types';

interface ShareButtonProps {
  trips: Trip[];
}

function encodeTripsToUrl(trips: Trip[]): string {
  const json = JSON.stringify(trips);
  return btoa(encodeURIComponent(json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function ShareButton({ trips }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const encoded = encodeTripsToUrl(trips);
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [trips]);

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
        copied
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-white/60 text-gray-600 hover:bg-white/80 border border-gray-200/60'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
      {copied ? '已复制' : '分享链接'}
    </button>
  );
}
