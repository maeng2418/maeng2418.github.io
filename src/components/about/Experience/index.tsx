import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import React, { useMemo } from 'react';
import './index.scss';

const Experience: React.FC = () => {
  const { igaworks, woowa, zimssa, develup, dable, seoultech } = useStaticQuery(
    graphql`
      query ExperienceQuery {
        igaworks: file(absolutePath: { regex: "/igaworks.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        woowa: file(absolutePath: { regex: "/woowa.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        zimssa: file(absolutePath: { regex: "/zimssa.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        develup: file(absolutePath: { regex: "/develup.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        dable: file(absolutePath: { regex: "/dable.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
        seoultech: file(absolutePath: { regex: "/seoultech.png/" }) {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED)
          }
        }
      }
    `,
  );
  const experiences = useMemo(
    () => [
      {
        image: igaworks.childImageSharp.gatsbyImageData,
        details: {
          title: '아이지에이웍스 (Adpopcorn)',
          term: '(2021.07.19 - 현재 진행 중)',
          description: `아이지에이웍스는 모바일 데이터분석, 마케팅 자동화, AI와 머신 러닝 기반의 DMP(Data Management Platform), 트레이드데스크, 마켓인텔리전스 등 모바일 데이터와 플랫폼을 제공합니다. IGAWorks 애드팝콘 개발팀에서 프론트엔드 개발자로 근무하고 있고, 인앱비딩 알고리즘과 DMP 기반 애드서버, 미디에이션 기능 등 수익화를 위한 서비스인 SSP 파트를 담당하고 있습니다.`,
          subDetails: [
            {
              subTitle: 'Adpopcorn SSP',
              contents: [
                {
                  contentTitle: 'SSP 콘솔 3.0 리뉴얼',
                  contentDetails: [
                    '기존 NextJS를 React18로 리뉴얼',
                    'React-query 및 Recoil을 활용한 상태관리',
                    '디자인 개편 및 일관성 유지',
                    '빌드 및 배포 시간 단축',
                    '중복 API 요청 이슈 제거',
                    '라이브러리 최신 업데이트',
                  ],
                },
                {
                  contentTitle: '애드팝콘 SSP 콘솔 리펙토링',
                  contentDetails: [
                    'NextJS 12 업데이트 및 디펜던시 버젼 업데이트',
                    'Redux + Saga를 통한 상태관리 리펙토링',
                    '토큰 갱신 이슈 수정 및 권한 설정 개선',
                  ],
                },
                {
                  contentTitle: '라이브러리 교체 및 자체 개발',
                  contentDetails: [
                    '기존 그래프 라이브러리를 SVG를 활용하여 자체 개발한 그래프로 교체',
                    '기존 테이블 및 필터 라이브러리 커스텀마이징',
                  ],
                },
              ],
            },
            {
              subTitle: 'Adpopcorn 랜딩페이지',
              contents: [
                {
                  contentTitle: '분사에 따른 개발 및 유지보수',
                  contentDetails: [
                    '분사에 따른 팝업 공고 디자인 및 구현',
                    '분사에 따른 기존 페이지 정보 수정',
                    '홈페이지 잔여이슈 수정',
                    'Svelte를 활용한 리뉴얼페이지 개발',
                  ],
                },
              ],
            },
            {
              subTitle: 'CI/CD 개선',
              contents: [
                {
                  contentTitle: 'CodePipeline을 통한 배포 자동화',
                  contentDetails: ['AWS ESC와 CodePipeline을 통한 CI/CD 개선'],
                },
              ],
            },
          ],
        },
      },
      {
        image: zimssa.childImageSharp.gatsbyImageData,
        details: {
          title: '짐싸',
          term: '(20.12.01 - 2021.07.08)',
          description: `짐싸는 이사를 준비하는 사용자에게는 편리함과 새로운 시작의 기쁨을, 함께하는 파트너(기사님)에게는 성공을 위한 성장의 발판을 마련하여 누구나 한 번쯤 겪게 될 이사의 불편함을 해결하고자 만든 사용자와 이삿짐 파트너(기사님) 매칭 서비스입니다. 짐싸 프론트엔드팀에서 파트너(기사님)들을 위한 서비스를 제공하는 파트너앱 개발 및 유지보수를 담당하였습니다.`,
          subDetails: [
            {
              subTitle: '짐싸 파트너앱',
              contents: [
                {
                  contentTitle: 'Dependency 버젼 업데이트',
                  contentDetails: [
                    'Typescript 도입 및 부분 적용',
                    'Redux Toolkit 적용',
                    'Webpack 설정 변경',
                    'ESLint + Prettier + Husky + lint-staged 적용',
                  ],
                },
                {
                  contentTitle: '디자인 2.0',
                  contentDetails: [
                    '다크모드 디자인 적용',
                    '컴포넌트 생성 스크립트 이용한 자동화',
                    'Cordova 플러그인 이용한 사용자 권한 설정 개선',
                    '모달 및 팝업 의존성 라이브러리 제거 및 자체 개발',
                    'Lazy-loading 구현',
                  ],
                },
                {
                  contentTitle: '공통 디자인 시스템',
                  contentDetails: [
                    'Atomic Design 적용',
                    'Styled Component 적용',
                    'Storybook 기반 UI 검증',
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        image: woowa.childImageSharp.gatsbyImageData,
        details: {
          title: '우아한 테크 캠프',
          term: '(2020.07.01 - 2020.08.28)',
          description: `우아한테크캠프는 우아한 형제들에서 운영하는 웹프론트엔트 중심으로 백엔드를 함께 배우는 자기 주도형 풀스택 과정입니다. 8주 동안 학습 내용을 바탕으로 우아한형제들의 서비스를 커스터마이징한 몇 개의 미니 프로젝트를 수행하며, 실제 서비스를 만들어보는 학습을 통해 하나의 서비스를 이루는 전체 데이터의 흐름과 시스템의 구조를 파악할 수 있는 것을 목표로 멤버들과 페어프로그래밍, 협업 등을 배우며 웹 개발자의 역량을 키워나갑니다.`,
          subDetails: [
            {
              subTitle: '배민상회 회원가입 및 로그인 페이지 개발',
              contents: [
                {
                  contentTitle: '프론트엔드 개발',
                  contentDetails: [
                    '외부 라이브러리 사용하지 않고 Vanila.js와 HTML, CSS를 사용하여 개발',
                    'PUG 템플릿 사용',
                  ],
                },
                {
                  contentTitle: '백엔드 개발',
                  contentDetails: [
                    'Node.js, Express.js 사용하여 개발',
                    '로그인 구현 시, 쿠키와 JWT 사용하여 개발',
                    '별도의 설치가 필요한 DBMS 사용하지 않고, 직접 Embedded DB 구현',
                  ],
                },
              ],
            },
            {
              subTitle: 'TODO 웹 애플리케이션 개발',
              contents: [
                {
                  contentTitle: '프론트엔드 개발',
                  contentDetails: [
                    'Webpack과 Babel 기본환경 설정 (sourceMap, 브라우저 지원 등)',
                    '협업과 코드의 혼란을 방지하기 위한 ESLint 및 Prettier설정',
                    'ES Modules 방식으로 모듈화를 구성',
                    'Drag and Drop API 사용 없이 직접 구현',
                  ],
                },
                {
                  contentTitle: '백엔드 개발',
                  contentDetails: [
                    'Node.js, Express.js, MySQL 사용하여 개발',
                    '로그인 구현 시, 세션을 사용하여 개발',
                    '사용자별 각 목록에 대한 접근 권한 설정',
                  ],
                },
              ],
            },
            {
              subTitle: '개인 가계부 서비스 개발',
              contents: [
                {
                  contentTitle: '프론트엔드 개발',
                  contentDetails: [
                    'Observer 패턴 활용',
                    '외부 라이브러리 없이 Single Page Application 직접 구현',
                    '상태(State) 관리를 위한 Store 구현',
                    '데이터 시각화를 위해 SVG를 활용하여 그래프 구현',
                  ],
                },
                {
                  contentTitle: '백엔드 개발',
                  contentDetails: [
                    'Passport + Oauth + JWT를 이용한 로그인 구현',
                    '별도의 외부 도구나 CI 툴 없이 EC2에 자동 배포 구현',
                  ],
                },
              ],
            },
            {
              subTitle: '모바일 B마트 서비스 개발',
              contents: [
                {
                  contentTitle: '프론트엔드 개발',
                  contentDetails: [
                    'React.js, Next.js 기반 개발',
                    '함수형 컴포넌트 형태 개발',
                    '상태(State) 관리를 위한 useState와 Context API 활용',
                    '스타일드컴포넌트를 활용한 스타일 작업',
                    '미디어쿼리를 이용하여 반응형 디자인 구현',
                    '케러셀 베너 구현',
                  ],
                },
                {
                  contentTitle: '백엔드 개발',
                  contentDetails: [
                    'Express + MySQL 사용',
                    'GitHub 액션을 이용한 자동배포 구현',
                    'Passport + Oauth + JWT를 이용한 로그인 구현',
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        image: seoultech.childImageSharp.gatsbyImageData,
        details: {
          title: '철도경영정책연구소',
          term: '(2019.10.01 - 2020.06.30)',
          description: `서울과학기술대학교 철도 경영 정책 연구소에서는 버스 및 철도 등과 같은 대중교통 노선 변경에 따른 영향 및 대안을 분석하는 연구소입니다. 해당 연구소에서 학부생으로 교통수요분석 작업 효율화에 대해 연구하였고, "EMME" 라는 프로그램을 이용하여 우리나라 교통 데이터를 활용하여 공공투자사업에 앞서 해당 사업의 경제성을 평가하는 단계를 자동화시키는 프로그램 개발을 맡았습니다.`,
          subDetails: [
            {
              subTitle: '철도경영정책연구소 학부생',
              contents: [
                {
                  contentTitle: '교통 수요 분석을 위한 DB구축 자동화',
                  contentDetails: [
                    '수작업으로 이루어지던 DB구축을 Python을 이용하여 자동화하여 시간 단축',
                    'Emme4 Notebook을 이용하여 교통 수요 분석',
                  ],
                },
                {
                  contentTitle: '교통 DB 자료 구축 및 Emme 사용법에 대한 연구소 세미나',
                  contentDetails: [
                    'Python 기초 교육과 Python 스크립트 작성을 통한 교통수요분석 자동화에 대해 연구소내에서 세미나 진행',
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        image: develup.childImageSharp.gatsbyImageData,
        details: {
          title: '데벨업 (Devel Up)',
          term: '(2019.9.16 - 2019.11.30)',
          description: `데벨업 (DevelUp)은 구름(Groom)에서 주최한 함께 프로그래밍을 배우고 즐기려는 열성적인 커뮤니티로 프로그래머가 되는 방법을 배우려는 사람들을 위한 3개월 집중 온라인과정입니다. 다양한 오프라인 기반의 세미나, 밋업, 해커톤을 진행하며 여러 사람들과 함께 프로젝트를 수행하고 멘토분들의 도움을 받으며 개발 실력을 향상시켰습니다.`,
          subDetails: [
            {
              subTitle: '데벨업 시즌 1 수료',
              contents: [
                {
                  contentTitle: '1~3차 웹어플리케이션 개발 퀘스트 수행',
                  contentDetails: [
                    '동네 주민 오픈 채팅방 서비스 개발',
                    '랜덤 데이트 코스 추천 서비스 개발',
                  ],
                },
                {
                  contentTitle: `데벨업 해커톤 '렙업톤' 참가`,
                  contentDetails: ['맛집 예약 서비스 Revel Up (Restaurant + Level Up) 개발'],
                },
              ],
            },
          ],
        },
      },
      {
        image: dable.childImageSharp.gatsbyImageData,
        details: {
          title: '데이블 (Dable)',
          term: '(2019.08.12 - 2019.09.11)',
          description: `데이블은 빅데이터 및 개인화 추천 기술을 바탕으로 미디어 사이트 방문자들이 소비한 콘텐츠를 실시간으로 분석하여 ‘당신이 좋아할 만한 콘텐츠’와 같은 고품질 개인 맞춤형 콘텐츠 추천 서비스를 제공합니다. 데이블 내 사내 신규 광고 차단서비스 Blokee 개발팀에서 프론트엔드 개발 인턴으로 근무하며 협업능력과 실무 경험을 쌓았습니다.`,
          subDetails: [
            {
              subTitle: '블로키TF 팀 프론트엔드 개발 인턴',
              contents: [
                {
                  contentTitle: 'Blokee 메인 페이지 개발',
                  contentDetails: [
                    'IE 7버젼 이상에서 동작하는 반응형 웹페이지 개발',
                    'Google API를 활용한 문의메일 서비스 개발',
                  ],
                },
                {
                  contentTitle: 'Blokee 광고 랜딩 페이지 개발',
                  contentDetails: [
                    'Lottie를 활용한 애니메이션 구현',
                    'Fullpage.js를 이용한 슬라이딩 페이징 구현',
                  ],
                },
                {
                  contentTitle: '데이터베이스 수집',
                  contentDetails: ['광고 차단을 위한 데이터베이스 수집 및 구축'],
                },
              ],
            },
          ],
        },
      },
    ],
    [],
  );
  return (
    <section className="experience-section">
      <div className="subtitle">
        <h3 className="subtitle__h3">Experiences</h3>
      </div>
      <div className="experience-container">
        {experiences.map(({ details: { title, term, description, subDetails }, image }) => (
          <div key={title} className="experience">
            <div className="item__image">
              <GatsbyImage className="author-image" image={image} alt={title} />
            </div>
            <div className="item__details">
              <div className="title">
                {title} <span className="term">{term}</span>
              </div>
              <div className="description">
                <input id={title} className="exp" type="checkbox" />
                <div className="text">
                  <label className="btn" htmlFor={title}></label>
                  {description}
                  {subDetails?.map(({ subTitle, contents }) => (
                    <section key={subTitle} className="experience-detail">
                      <h3 className="sub-title">{subTitle}</h3>
                      <h3 className="work-label">작업내용</h3>
                      <ul className="works">
                        {contents.map(({ contentTitle, contentDetails }) => (
                          <li key={contentTitle}>
                            <b className="role">{contentTitle}</b>
                            <ul>
                              {contentDetails.map((content) => (
                                <li key={content}>{content}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
