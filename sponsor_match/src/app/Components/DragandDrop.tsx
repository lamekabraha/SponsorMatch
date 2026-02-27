"use client";

import React, { useState, useCallback, useId } from "react";

interface ImageDropzoneProps {
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  /** Accept string for file input, e.g. ".jpg,.jpeg,.png" or ".jpg,.jpeg,.png,.pdf" */
  accept?: string;
  /** Allowed MIME types for validation. Default: image/jpeg, image/png */
  allowedTypes?: string[];
}

const DEFAULT_TYPES = ["image/jpeg", "image/png"];

export default function ImageDropzone({
  multiple = false,
  onFilesChange,
  accept = ".jpg,.jpeg,.png",
  allowedTypes = DEFAULT_TYPES,
}: ImageDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const valid = Array.from(files).filter((file) =>
        allowedTypes.includes(file.type)
      );

      const toUse = multiple ? valid : valid.slice(0, 1);
      const urls = toUse.map((file) =>
        file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%23999'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 16H6V4h7v5h5v9z'/%3E%3C/svg%3E"
      );
      setPreviews(urls);
      onFilesChange?.(toUse);
    },
    [multiple, onFilesChange, allowedTypes]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-4 font-Body">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-200
          ${isDragging ? "border-Yellow bg-Yellow/10" : "border-Black/35"}`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          id={inputId}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <label htmlFor={inputId} className="cursor-pointer">
          <p className="font-Body font-bold text-Black">
            {accept.includes("pdf")
              ? "Drag & drop PDF or images"
              : "Drag & drop JPG or PNG images"}
          </p>
          <p className="text-xs text-Black/65 mt-1 font-Body">or click to browse</p>
        </label>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="w-full h-28 rounded-lg overflow-hidden bg-Grey flex items-center justify-center border border-Black/12">
              {src.startsWith("data:image/svg") ? (
                <img src={src} className="w-12 h-12" alt="Document" />
              ) : (
                <img
                  src={src}
                  className="w-full h-full object-cover"
                  alt={`preview-${i}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
