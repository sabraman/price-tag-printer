'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { detectBrowser, getBrowserWarningMessage } from '@/lib/browser-detection';

export function BrowserWarning() {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const browserInfo = detectBrowser();
    const message = getBrowserWarningMessage(browserInfo);
    setWarningMessage(message);
  }, []);
  
  if (!warningMessage) return null;
  
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>{warningMessage}</AlertDescription>
    </Alert>
  );
}