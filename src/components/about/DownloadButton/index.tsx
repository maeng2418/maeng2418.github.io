import React from 'react';
import './index.scss';

const DownloadButton: React.FC = () => {
  return <a className="download-portfolio" download href="portfolio.pdf"></a>;
};

export default DownloadButton;
