// 서버 전용 env 접근 계층 — REQ-EDITOR-009 (시크릿은 서버 env 에서만, NEXT_PUBLIC_ 금지)
// 경계 검증은 zod (plan §B.3) — 호출 시점에 lazily 파싱한다 (모듈 레벨 캐시 없음).
//
// prefix 기본값은 실 버킷 read-only 조회로 검증된 값이다 (2026-07-24, maeng-workspace-bucket):
//   마크다운: blog/markdowns/{category}/{fileName}.md → markdownPrefix='blog' (+ 키 헬퍼가 markdowns/ 세그먼트 부착)
//   이미지:   blog/images/{name}.{ext}               → imagePrefix='blog/images'
import { z } from 'zod'

export interface S3RuntimeEnv {
  region: string
  bucket: string
  /** trailing slash 제거된 CloudFront base URL */
  cloudfrontUrl: string
  /** buildMarkdownKey 의 prefix 인자 (markdowns/ 세그먼트 앞에 붙는 조각) */
  markdownPrefix: string
  /** 이미지 오브젝트 키의 폴더 prefix (blog/images) */
  imagePrefix: string
}

export interface OpenAIRuntimeEnv {
  apiKey: string
  /** 모델명 — env 주입 필수, 하드코딩 금지 (REQ-EDITOR-007) */
  model: string
}

const nonEmpty = z.string().trim().min(1)

const S3EnvSchema = z.object({
  AWS_REGION: nonEmpty,
  AWS_BUCKET_NAME: nonEmpty,
  AWS_CLOUDFRONT_URL: nonEmpty,
  AWS_BUCKET_MARKDOWN_FOLDER_PREFIX: z.string().optional(),
  AWS_BUCKET_IMAGE_FOLDER_PREFIX: z.string().optional(),
})

const OpenAIEnvSchema = z.object({
  OPENAI_API_KEY: nonEmpty,
  OPENAI_MODEL: nonEmpty,
})

/** 누락/공백 키 이름을 식별 가능한 에러 메시지로 표면화한다 (§C: silent failure 금지) */
function parseEnv<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.infer<z.ZodObject<T>> {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))].join(', ')
    throw new Error(`missing required env: ${keys} (apps/maeng-editor/.env.local 을 확인하세요)`)
  }
  return parsed.data
}

export function getS3Env(): S3RuntimeEnv {
  const env = parseEnv(S3EnvSchema)
  return {
    region: env.AWS_REGION,
    bucket: env.AWS_BUCKET_NAME,
    cloudfrontUrl: env.AWS_CLOUDFRONT_URL.replace(/\/+$/, ''),
    markdownPrefix: (env.AWS_BUCKET_MARKDOWN_FOLDER_PREFIX?.trim() || 'blog').replace(/\/+$/, ''),
    imagePrefix: (env.AWS_BUCKET_IMAGE_FOLDER_PREFIX?.trim() || 'blog/images').replace(/\/+$/, ''),
  }
}

export function getOpenAIEnv(): OpenAIRuntimeEnv {
  const env = parseEnv(OpenAIEnvSchema)
  return { apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL }
}

/** REQ-EDITOR-008 capability gate — 미설정 시 null (기능 비활성/숨김). 검증 아닌 존재 게이트라 zod 미적용 */
export function getBlogContentDir(): string | null {
  const dir = process.env.BLOG_CONTENT_DIR?.trim()
  return dir ? dir : null
}
