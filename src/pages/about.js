import { graphql } from 'gatsby';
import React from 'react';
import AboutMe from '../components/about';
import Head from '../components/head';
import '../styles/resume.scss';

const About = ({ data }) => {
  const resumeData = data.site.siteMetadata.resume;

  return (
    <>
      <Head
        title={resumeData.title}
        description={resumeData.description}
        thumbnail={resumeData.thumbnail}
      />
      <AboutMe />
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
  }
`;

export default About;
