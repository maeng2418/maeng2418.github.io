import { graphql, Link, StaticQuery } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import React, { forwardRef } from 'react';
import './index.scss';

export const Bio = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <StaticQuery
      query={bioQuery}
      render={(data) => {
        const { author, social, introduction } = data.site.siteMetadata;

        return (
          <div ref={ref} className="bio">
            <div className="author">
              <div className="author-description">
                <GatsbyImage
                  className="author-image"
                  image={data.avatar.childImageSharp.gatsbyImageData}
                  alt={author}
                  style={{
                    borderRadius: `100%`,
                  }}
                />
                <div className="author-name">
                  <span className="author-name-prefix">Frontend Developer</span>
                  <Link to={'/about'} className="author-name-content">
                    <span>@{author}</span>
                  </Link>
                  <div className="author-introduction">{introduction}</div>
                  <p className="author-socials">
                    {social.github && <a href={`https://github.com/${social.github}`}>✤ GitHub</a>}
                    {social.instagram && (
                      <a href={`https://www.instagram.com/${social.instagram}`}>✤ Instagram</a>
                    )}
                    {social.facebook && (
                      <a href={`https://www.facebook.com/${social.facebook}`}>✤ Facebook</a>
                    )}
                    {social.linkedin && (
                      <a href={`https://www.linkedin.com/in/${social.linkedin}/`}>✤ LinkedIn</a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
});

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile.png/" }) {
      childImageSharp {
        gatsbyImageData(layout: FIXED, width: 72, height: 72)
      }
    }
    site {
      siteMetadata {
        author
        introduction
        social {
          github
          facebook
          linkedin
          instagram
        }
      }
    }
  }
`;

export default Bio;
