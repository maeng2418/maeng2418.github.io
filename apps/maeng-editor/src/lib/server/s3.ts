// S3 클라이언트 (서버 전용) — REQ-EDITOR-010 (클라이언트 번들에 @aws-sdk/* 미포함)
// 자격증명은 SDK 기본 provider chain(AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env)에 위임한다.
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { getS3Env } from './env'

let client: S3Client | null = null

export function getS3Client(): S3Client {
  if (!client) {
    client = new S3Client({ region: getS3Env().region })
  }
  return client
}

/** prefix 하위 전체 오브젝트 키 나열 (ContinuationToken 페이지네이션) */
export async function listAllKeys(prefix: string): Promise<string[]> {
  const { bucket } = getS3Env()
  const s3 = getS3Client()
  const keys: string[] = []
  let continuationToken: string | undefined

  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    )
    for (const object of page.Contents ?? []) {
      if (object.Key) keys.push(object.Key)
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}
