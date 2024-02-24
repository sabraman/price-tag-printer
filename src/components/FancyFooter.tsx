import React from "react";

const FancyFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p className="mb-2 text-sm">
        дать деняк, заказать дизайн и вообще по всем вопросам {" "}
      <a
        href="https://t.me/sabraman"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline font-bold"
        >
        картон
      </a>
        </p>
    </footer>
  );
};

export default FancyFooter;
