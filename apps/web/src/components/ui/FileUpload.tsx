import { useState, useRef, useCallback } from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  preview?: boolean;
  currentUrl?: string | null;
}

export function FileUpload({ onFileSelect, accept = 'image/*', maxSize = 5 * 1024 * 1024, preview = true, currentUrl }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
      return;
    }
    if (preview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    onFileSelect(file);
  }, [maxSize, preview, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt="Preview"
            className="max-h-32 rounded-lg object-cover"
          />
          <button
            type="button"
            className="btn btn-xs btn-circle btn-error absolute -top-2 -right-2"
            onClick={(e) => { e.stopPropagation(); clearPreview(); }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-base-content/50">
          {accept === 'image/*' ? <ImageIcon size={32} /> : <FileText size={32} />}
          <span className="text-sm">Arraste um arquivo ou clique para selecionar</span>
          <span className="text-xs">{accept.replace('/*', '')} · Máx {maxSize / 1024 / 1024}MB</span>
        </div>
      )}
    </div>
  );
}
