// components/DarkModeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
        
        </>
      )}
    </Button>
  );
}
