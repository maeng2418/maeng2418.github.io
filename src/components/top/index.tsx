import { Link } from "gatsby";
import React from "react";
import GitHubIcon from "../social-share/github-icon";
import ThemeSwitch from "../theme-switch";
import "./index.scss";

interface TopProps {
  title: string;
  location: Location;
  rootPath: string;
}

const Top: React.FC<TopProps> = ({ title, location, rootPath }) => {
  const isRoot = location.pathname === rootPath;
  return (
    <div className="top">
      {!isRoot && (
        <Link to={`/`} className="link">
          {title}
        </Link>
      )}
      <ThemeSwitch />
      <GitHubIcon />
    </div>
  );
};

export default Top;
