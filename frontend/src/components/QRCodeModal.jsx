import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import './QRCodeModal.css';

const QRCodeModal = ({ isOpen, onClose, passData }) => {
  if (!isOpen || !passData) return null;

  const { passToken, studentName, rollNumber, date, status, qrPayload } = passData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={22} className="pass-header-icon" />
            <h3 className="modal-title">Digital Mess Pass</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="qr-wrapper">
            <QRCodeSVG value={qrPayload || passToken} size={180} level="H" />
          </div>

          <div className="student-badge-info">
            <h4 className="student-name">{studentName}</h4>
            <p className="student-roll">Roll No: <strong>{rollNumber}</strong></p>
            <p className="pass-date">Valid Date: <span>{date}</span></p>
          </div>

          <div className="pass-token-box">
            <span className="token-label">Token Code</span>
            <code className="token-code">{passToken}</code>
          </div>

          <div className="meal-status-pills">
            {['breakfast', 'lunch', 'dinner'].map((meal) => {
              const st = status ? status[meal] : 'opted-in';
              return (
                <div key={meal} className={`meal-pill ${st}`}>
                  <span className="meal-name">{meal}</span>
                  <span className="pill-badge">{st}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <p className="pass-instruction">Present this QR code to the Mess Counter staff for scanning.</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
