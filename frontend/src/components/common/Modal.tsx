import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  instanceUrl?: string; // optional URL for CTF instance
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  instanceUrl,
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (instanceUrl) navigator.clipboard.writeText(instanceUrl);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">{children}</div>

          {instanceUrl && (
            <div className="modal-instance">
              <label>Instance URL:</label>
              <div className="instance-url-wrapper">
                <input type="text" readOnly value={instanceUrl} />
                <button onClick={handleCopyUrl}>Copy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
