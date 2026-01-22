import { ReloadOutlined } from "@ant-design/icons";
import { Alert, FloatButton, Spin } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface IframeProps {
  url?: string;
}

const Iframe: React.FC<IframeProps> = ({ url: propUrl }) => {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(propUrl || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isValidUrl = (inputUrl: string) => {
    try {
      const parsedUrl = new URL(inputUrl);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Get URL from prop or query parameter on initial load
  useEffect(() => {
    // If URL is passed as prop, use it directly
    if (propUrl) {
      if (isValidUrl(propUrl)) {
        setTimeout(() => {
          setUrl(propUrl);
          setError("");
          setLoading(false);
        }, 0);
      } else {
        setTimeout(() => {
          setError("Invalid URL provided");
          setUrl("");
          setLoading(false);
        }, 0);
      }
    } else {
      // Otherwise, get URL from query parameter
      const urlParam = searchParams.get("url");
      if (urlParam) {
        const decodedUrl = decodeURIComponent(urlParam);
        if (isValidUrl(decodedUrl)) {
          // Using setTimeout to avoid synchronous state updates in effect
          setTimeout(() => {
            setUrl(decodedUrl);
            setError("");
            setLoading(false);
          }, 0);
        } else {
          // Using setTimeout to avoid synchronous state updates in effect
          setTimeout(() => {
            setError("Invalid URL parameter provided");
            setUrl("");
            setLoading(false);
          }, 0);
        }
      } else {
        // Default behavior when no URL parameter
        setTimeout(() => {
          setError("No URL parameter provided");
          setUrl("");
          setLoading(false);
        }, 0);
      }
    }
  }, [searchParams, propUrl]);

  const handleRefresh = () => {
    if (iframeRef.current && url) {
      try {
        // Store the current src
        const currentSrc = iframeRef.current.src;
        // Temporarily set to about:blank to clear the iframe
        iframeRef.current.src = "about:blank";
        // After a small delay, restore the original URL to trigger a refresh
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentSrc;
          }
        }, 10);
      } catch (e) {
        console.error("Error refreshing iframe:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <FloatButton icon={<ReloadOutlined />} onClick={handleRefresh} />
      {error ? (
        <div className="flex justify-center items-center h-full">
          <Alert message={error} type="error" />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden h-[calc(100vh-120px)] w-full relative">
          <iframe
            ref={iframeRef}
            src={url}
            title="Embedded Content"
            width="100%"
            height="100%"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            className="border-0 w-full h-full"
          />
        </div>
      )}
    </>
  );
};

export default Iframe;
