import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import QrCodeCustom from "./QrCodeCustom";
import { usePrintTags } from "@/hooks/usePrintTags";

export default function QrCodeGenerator() {
  const [qrValue, setQrValue] = useState("https://t.me/vaparshop");
  const { componentRef, handlePrint } = usePrintTags();

  return (
    <div className="max-w-lg items-center p-4 flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="qr-value">QR Код</Label>
        <Input
          id="qr-value"
          type="text"
          value={qrValue}
          onChange={(e) => setQrValue(e.target.value)}
          placeholder="Введите URL"
        />
      </div>
      <Button onClick={() => handlePrint()} className="mb-4">
        Распечатать
      </Button>
      <div ref={componentRef} className="print-content">
        <div className="w-[15cm] h-[15cm] text-white rounded-full flex flex-col items-center justify-center text-center gap-2 bg-gradient-to-br from-[#f2676c] via-[#ee2a7b] to-[#92278f]">
          <p className="font-black line-clamp-4 text-[8mm] w-[75mm] leading-none uppercase">
            Подписывайся
          </p>
          <p className="font-black line-clamp-4 text-[8mm] w-[75mm] leading-none uppercase">
            на наш
          </p>
          <p className="font-black line-clamp-4 text-[8mm] w-[75mm] leading-none uppercase">
            телеграм
          </p>
          <p className="font-black line-clamp-4 text-[8mm] w-[75mm] leading-none uppercase">
            канал
          </p>
          <div className="flex justify-center rounded-2xl border-4 border-white bg-transparent">
            <QrCodeCustom value={qrValue} />
          </div>
        </div>
      </div>
    </div>
  );
}
