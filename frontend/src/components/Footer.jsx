import React from 'react';
import { Heart, Code2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} Smart Mess Management System. All rights reserved.
        </p>
        <div className="developer-tag">
          <Code2 size={15} className="dev-icon" />
          <span>Developed by <strong>Biswa Ananta</strong></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
