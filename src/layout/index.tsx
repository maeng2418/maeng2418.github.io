declare const __PATH_PREFIX__: string;

import React from 'react';
import Footer from '../components/footer';
import Header from '../components/header';
import Top from '../components/top';
import { rhythm } from '../utils/typography';
import './index.scss';

interface LayoutProps {
  title: string;
  location: Location;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;

  return (
    <React.Fragment>
      <Top title={title} location={location} rootPath={rootPath} />
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <Header title={title} location={location} rootPath={rootPath} />
        {children}
        <Footer />
      </div>
    </React.Fragment>
  );
};
