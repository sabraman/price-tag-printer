import { QrCode } from "react-qrcode-pretty";

interface QrCodeCustomProps {
  value?: string;
}

export default function QrCodeCustom({
  value = "https://t.me/vaparshop",
}: QrCodeCustomProps) {
  return (
    <div className="w-[75mm] h-[75mm] flex justify-center items-center bg-transparent">
      <QrCode
        value={value}
        variant={{
          eyes: "fluid",
          body: "fluid",
        }}
        color={{
          eyes: "#ffffff",
          body: "#ffffff",
        }}
        bgColor="transparent"
        size={220}
        bgRounded
      />
    </div>
  );
}
