import React, { useRef, useState } from 'react';
import { resolveAsset } from '../lib/assets';
import './ImageUploader.css';

const compressImage = (file, maxWidth = 1600) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to 80% quality JPEG to save massive amounts of space
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Image load error'));
    };
    reader.onerror = () => reject(new Error('File read error'));
  });
};

/**
 * ImageUploader — converts files to base64 and stores them.
 *
 * Props:
 *  value       – current base64 string (or URL)
 *  onChange    – (base64) => void
 *  label       – string label
 *  aspectHint  – e.g. "16:9" shown as hint
 *  maxSizeMB   – max file size allowed (default 10)
 */
export default function ImageUploader({ value, onChange, label = 'Image', aspectHint, maxSizeMB = 10 }) {
  const inputRef  = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');

  const processFile = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File must be an image.'); return; }
    if (file.size > maxSizeMB * 1024 * 1024) { setError(`Max size is ${maxSizeMB}MB.`); return; }

    try {
      const compressed = await compressImage(file, 1600);
      onChange(compressed);
    } catch (e) {
      setError('Error processing image');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        processFile(item.getAsFile());
        break;
      }
    }
  };

  return (
    <div className="img-uploader" onPaste={onPaste}>
      <div className="img-uploader-label mono">
        {label}
        {aspectHint && <span className="img-uploader-hint"> — {aspectHint} recommended</span>}
      </div>

      <div
        className={`img-drop-zone ${dragging ? 'dragging' : ''} ${value ? 'has-image' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {value ? (
          <>
            <img src={resolveAsset(value)} alt={label} className="img-preview" />
            <div className="img-overlay">
              <span className="mono img-overlay-text">Change Image</span>
            </div>
          </>
        ) : (
          <div className="img-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="mono">Click, drag & drop, or paste</p>
            <p className="mono img-sub">PNG, JPG, WEBP · max {maxSizeMB}MB</p>
          </div>
        )}
      </div>

      {error && <p className="img-error mono">{error}</p>}

      {value && (
        <button
          type="button"
          className="img-remove mono"
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
        >
          × Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])}
      />
    </div>
  );
}

/**
 * MultiImageUploader — upload multiple project screenshots
 */
export function MultiImageUploader({ values = [], onChange, maxImages = 6, label = 'Project Screenshots' }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const processFiles = (files) => {
    setError('');
    const remaining = maxImages - values.length;
    const toProcess = Array.from(files).slice(0, remaining);

    if (toProcess.length === 0) {
      setError(`Max ${maxImages} images allowed.`);
      return;
    }

    const processors = toProcess.map(async file => {
      if (!file.type.startsWith('image/')) return null;
      if (file.size > 8 * 1024 * 1024) return null;
      try {
        return await compressImage(file, 1600);
      } catch {
        return null;
      }
    });

    Promise.all(processors).then(results => {
      const valid = results.filter(Boolean);
      onChange([...values, ...valid]);
    });
  };

  const removeImage = (idx) => onChange(values.filter((_, i) => i !== idx));

  const moveImage = (from, to) => {
    const arr = [...values];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onChange(arr);
  };

  return (
    <div className="multi-uploader">
      <div className="multi-uploader-label mono">
        {label}
        <span className="img-uploader-hint"> — {values.length}/{maxImages}</span>
      </div>

      <div className="multi-grid">
        {values.map((src, i) => (
          <div key={i} className="multi-thumb" draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); moveImage(Number(e.dataTransfer.getData('text')), i); }}
          >
            <img src={resolveAsset(src)} alt={`screenshot ${i+1}`} />
            <div className="multi-thumb-overlay">
              <span className="mono">⠿ drag</span>
              <button type="button" className="multi-remove" onClick={() => removeImage(i)}>×</button>
            </div>
          </div>
        ))}

        {values.length < maxImages && (
          <button
            type="button"
            className="multi-add-btn"
            onClick={() => inputRef.current?.click()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="mono">Add</span>
          </button>
        )}
      </div>

      {error && <p className="img-error mono">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => processFiles(e.target.files)}
      />
    </div>
  );
}
