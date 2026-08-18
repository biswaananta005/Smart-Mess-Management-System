import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle, Home } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="not-found-content">
        <div className="not-found-card animate-fade-in">
          <AlertTriangle size={56} className="not-found-icon" />
          <h2>404 - Page Not Found</h2>
          <p>The page you are looking for does not exist or has been moved.</p>
          <Link to="/" className="home-link-btn">
            <Home size={18} />
            Back to Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
