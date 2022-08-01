import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import React, { useMemo } from 'react';
import './index.scss';

const Projects: React.FC = () => {
  const { maengDesign, bmart, seoul13 } = useStaticQuery(
    graphql`
      query ProjectQuery {
        maengDesign: file(absolutePath: { regex: "/maeng-design.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        bmart: file(absolutePath: { regex: "/bmart.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        seoul13: file(absolutePath: { regex: "/seoul13.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
      }
    `,
  );
  const projects = useMemo(
    () => [
      {
        link: 'https://maeng-design-docs.netlify.app',
        image: maengDesign.childImageSharp.gatsbyImageData,
        details: {
          title: ' [개인] 디자인 시스템, Maeng Design',
          term: '(22.02.13 v1.5.2)',
          description:
            '디자인 시스템 Maeng Design은 React 프로젝트를 위한 사용자 인터페이스 사양을 통일하고, 설계 차이와 구현에 필요한 불필요한 비용을 낮추며, 설계 및 프론트엔드 개발 자원을 지원하기 위해 만들어졌습니다.',
          attribution:
            '다양한 컴포넌트를 디자인하고 개발하여 오픈 소스로 배포하였습니다. API 참고를 위한 Docs와 UI 검증을 위한 Storybook도 함께 배포하였습니다.',
          tags: ['React', 'Typescript', 'Emotion', 'Storybook', 'Rollup', 'Gatsby', 'Netlify'],
        },
        github: 'https://github.com/maeng2418/Maeng-Design',
      },
      {
        link: 'https://seoul13.com',
        image: seoul13.childImageSharp.gatsbyImageData,
        details: {
          title: ' [개인] 서울일삼',
          term: '(20.10.14 v2.0.0)',
          description:
            '회의실 대여 예약사이트 제작하였습니다. 직접 서비스를 기획하고 디자인하였으며 온라인 판매 서비스를 위한 상표등록, PG사 가입, 통신판매업신고 등 개발 외의 사업 운영을 위한 전반적인 인프라를 구축하였습니다.',
          attribution:
            '추가로 기존 React만으로 짜여진 코드를 Next.js로 변경, MongoDB를 MySQL로 교체, 달력 라이브러리 직접 구현, 타입스크립트 적용 등 서비스 개선을 위한 리뉴얼을 하였습니다.',
          tags: [
            'React',
            'Typescript',
            'NextJS',
            'Express',
            'AWS',
            'JWT',
            'OAuth',
            'Passport',
            'MongoDB',
            'MySQL',
          ],
        },
        github: 'https://github.com/maeng2418/SEOUL13_edition2',
      },
      {
        link: 'https://github.com/woowa-techcamp-2020/bmart-5',
        image: bmart.childImageSharp.gatsbyImageData,
        details: {
          title: ' [팀] B 마트 모바일 웹',
          term: '(20.08.28 v1.0.0)',
          description:
            '우아한 테크 캠프 멤버들과 배달의 민족 내부 서비스 중 하나인 B마트를 NextJS를 활용하여 구현하였습니다. ',
          attribution:
            '함수형 컴포넌트 형태 개발, 상태(State) 관리를 위한 useState와 Context API 활용, Styled Component를 이용한 스타일링, 케로셀 베너를 구현, Passport + Oauth + JWT를 이용한 로그인 구현',
          tags: [
            'React',
            'Typescript',
            'NextJS',
            'Storybook',
            'Express',
            'AWS',
            'JWT',
            'OAuth',
            'Passport',
            'Github Action',
            'MySQL',
          ],
        },
        github: 'https://github.com/woowa-techcamp-2020/bmart-5',
      },
    ],
    [],
  );
  return (
    <section>
      <div className="subtitle">
        <h3 className="subtitle__h3">Projects</h3>
      </div>
      <div className="projects-container">
        {projects.map(
          ({ link, image, details: { title, term, description, attribution, tags }, github }) => (
            <div className="project" key={title}>
              <a className="project__details" href={link} target="_blank" rel="noopener noreferrer">
                <div className="item__image">
                  <GatsbyImage className="author-image" image={image} alt={title} />
                </div>
                <div className="item__details">
                  <div className="title">
                    {title}
                    <span className="term">{term}</span>
                  </div>
                  <div className="description">{description}</div>
                  <div className="attribution">{attribution}</div>
                  <div className="tags">
                    {tags.map((tag) => (
                      <div className="tag" key={tag}>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </a>
              <div className="project__links">
                <a href={github}>
                  <div className="github-logo"></div>
                </a>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default Projects;
