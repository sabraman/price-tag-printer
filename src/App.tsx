import React from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Tag } from "lucide-react";
import { Link, Outlet, useMatches } from "@tanstack/react-router";

const App: React.FC = () => {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1].pathname;

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <div className="flex gap-2 mb-4">
        <Button
          asChild
          variant={currentPath === "/" ? "default" : "outline"}
          className="flex-1"
        >
          <Link to="/" className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Ценники
          </Link>
        </Button>
        <Button
          asChild
          variant={currentPath === "/marketing" ? "default" : "outline"}
          className="flex-1"
        >
          <Link to="/marketing">
            <QrCode className="h-4 w-4 mr-2" />
            Marketing</Link>
        </Button>

      </div>
      <Outlet />
    </div>
  );
};

export default App;
