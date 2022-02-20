import React from 'react';
import './index.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/maeng2418/maeng2418.github.io"
      >
        <p className="footer-contents">
          <span className="icon">© 2022</span> maeng-portfolio
        </p>
      </a>
    </footer>
  );
};

export default Footer;
