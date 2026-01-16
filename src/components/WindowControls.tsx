import { isElectron, isMacOs } from "@/utils/env";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useState } from "react";

// Define the Electron API interface
interface ElectronAPI {
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const showWindowControls = isElectron() && !isMacOs();

  // Check initial maximized state
  useEffect(() => {
    if (!showWindowControls) {
      return;
    }

    const checkMaximized = async () => {
      try {
        const maxState = await window.electronAPI!.windowIsMaximized();
        setIsMaximized(maxState);
      } catch (error) {
        console.error("Error checking maximized state:", error);
      }
    };

    checkMaximized();

    // Listen for maximize/unmaximize events
    const handleResize = () => {
      // This event fires when window state changes
      setTimeout(async () => {
        try {
          const maxState = await window.electronAPI!.windowIsMaximized();
          setIsMaximized(maxState);
        } catch (error) {
          console.error("Error checking maximized state:", error);
        }
      }, 100); // Small delay to ensure state is updated

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMinimize = async () => {
    try {
      await window.electronAPI!.windowMinimize();
    } catch (error) {
      console.error("Error minimizing window:", error);
    }
  };

  const handleMaximize = async () => {
    try {
      await window.electronAPI!.windowMaximize();
      // Update local state after maximizing
      setIsMaximized((prev) => !prev);
    } catch (error) {
      console.error("Error maximizing window:", error);
    }
  };

  const handleClose = async () => {
    try {
      await window.electronAPI!.windowClose();
    } catch (error) {
      console.error("Error closing window:", error);
    }
  };

  // Only render if we're in Electron environment
  if (!showWindowControls) {
    return null;
  }

  return (
    <div className="flex items-center h-full no-drag">
      <Button
        type="text"
        onClick={handleMinimize}
        className="cursor-pointer w-12 h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
        aria-label="Minimize"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-700 dark:text-gray-300"
        >
          <rect
            x="1"
            y="5.5"
            width="10"
            height="1"
            rx="0.5"
            fill="currentColor"
          />
        </svg>
      </Button>

      <Button
        type="text"
        onClick={handleMaximize}
        className="cursor-pointer w-12 h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 mx-1"
        aria-label={isMaximized ? "Restore Down" : "Maximize"}
      >
        {isMaximized ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-700 dark:text-gray-300"
          >
            <path d="M2 3H9V10H2V3ZM3 4H8V9H3V4Z" fill="currentColor" />
            <path d="M4 2H10V8H9V3H4V2Z" fill="currentColor" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-700 dark:text-gray-300"
          >
            <rect
              x="1"
              y="1"
              width="10"
              height="10"
              rx="1"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        )}
      </Button>

      <Button
        danger
        type="text"
        onClick={handleClose}
        className="cursor-pointer w-12 h-12 flex items-center justify-center hover:bg-red-500 hover:text-white rounded-md transition-colors duration-150"
        aria-label="Close"
      >
        <CloseOutlined />
      </Button>
    </div>
  );
};

export default WindowControls;
