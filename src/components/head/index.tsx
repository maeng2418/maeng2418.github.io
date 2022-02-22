import { graphql, StaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';

interface HeadProps {
  description: string;
  lang: string;
  meta: React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[];
  keywords: string[];
  title: string;
}

const Head: React.FC<HeadProps> = ({
  description,
  lang = 'en',
  meta = [],
  keywords = [],
  title,
}) => {
  return (
    <StaticQuery
      query={detailsQuery}
      render={(data) => {
        const metaDescription = description || data.site.siteMetadata.description;
        return (
          <Helmet
            htmlAttributes={{
              lang,
            }}
            title={title}
            titleTemplate={`%s | ${data.site.siteMetadata.title}`}
            meta={[
              ...[
                {
                  name: `description`,
                  content: metaDescription,
                },
                {
                  property: `og:title`,
                  content: title,
                },
                {
                  property: `og:description`,
                  content: metaDescription,
                },
                {
                  property: `og:type`,
                  content: `website`,
                },
                {
                  name: 'google-site-verification',
                  content: data.site.siteMetadata.googleSearchConsole,
                },
              ].concat(
                keywords.length > 0
                  ? {
                      name: `keywords`,
                      content: keywords.join(`, `),
                    }
                  : [],
              ),
              ...meta,
            ]}
          />
        );
      }}
    />
  );
};

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
        googleSearchConsole
      }
    }
  }
`;

export default Head;
