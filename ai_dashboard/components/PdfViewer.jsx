"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";

const PdfViewer = ({ url }) => {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut } = zoomPluginInstance;

  return (
    <div className="h-full w-full relative">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white/90 p-1.5 rounded-lg shadow-sm border border-gray-200">
        <ZoomOut>
          {(props) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={props.onClick}
            >
              <Minus size={14} />
            </Button>
          )}
        </ZoomOut>
        <ZoomIn>
          {(props) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={props.onClick}
            >
              <Plus size={14} />
            </Button>
          )}
        </ZoomIn>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[zoomPluginInstance]}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer; 