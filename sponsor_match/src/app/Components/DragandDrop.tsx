"use client";

import React, { useState, useCallback } from "react";

export default function ImageDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const allowedTypes = ["image/jpeg", "image/png"];

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const validImages = Array.from(files).filter((file) =>
      allowedTypes.includes(file.type)
    );

    const urls = validImages.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          id="image-input"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <label htmlFor="image-input" className="cursor-pointer">
          <p className="font-semibold">Drag & drop JPG or PNG images</p>
          <p className="text-sm text-gray-500 mt-1">or click to browse</p>
        </label>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="w-full h-28 rounded-lg overflow-hidden">
              <img
                src={src}
                className="w-full h-full object-cover"
                alt={`preview-${i}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
