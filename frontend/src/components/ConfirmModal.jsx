/* ─── ConfirmModal Component ──────────────────────────────────────────────── */

import { createPortal } from 'react-dom';

function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false, loading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onCancel} aria-label="Close">×</button>
        </div>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'} ${loading ? 'btn-loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
