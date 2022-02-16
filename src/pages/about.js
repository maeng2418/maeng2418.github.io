import { graphql } from 'gatsby';
import React from 'react';
import AboutMe from '../components/about';
import Head from '../components/head';
import * as Lang from '../constants';
import '../styles/resume.scss';

const About = ({ data }) => {
  const resumeData = data.site.siteMetadata.resume;
  const resumes = data.allMarkdownRemark.edges;
  const resume = resumes
    .filter(({ node }) => node.frontmatter.lang === Lang.KOREAN)
    .map(({ node }) => node)[0];

  return (
    <>
      <Head
        title={resumeData.title}
        description={resumeData.description}
        thumbnail={resumeData.thumbnail}
      />
      <div
        className="about"
        style={{
          maxWidth: '60rem',
          margin: '0 auto',
          padding: '2rem 0',
          height: '100%',
        }}
      >
        <AboutMe />
      </div>
    </>
  );
};

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        resume {
          title
          description
          thumbnail
        }
      }
    }
    allMarkdownRemark(filter: { frontmatter: { category: { eq: null } } }) {
      edges {
        node {
          id
          excerpt(pruneLength: 160)
          html
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            lang
          }
        }
      }
    }
  }
`;

export default About;
