// 에디터 UI가 소비하는 데이터 계약 — M2는 UI만 이관하고 실제 저장소 구현(GitHub/fs 드라이버)은
// M3에서 연결한다(design.md §B D4 PostStore/ImageStore). M3에서 src/lib/editor-server/store/types.ts
// 가 도입되면 이 타입과의 정합을 유지하거나 이 파일을 재노출(re-export) 지점으로 정리한다.
export interface PostSummary {
  key: string
  category: string
  fileName: string
  lastModified: string | null
}

export interface LoadedPostFrontmatter {
  title: string
  category: string
  thumbnail?: string
  draft?: boolean
  date: string | null
}

export interface LoadedPost {
  key: string
  frontmatter: LoadedPostFrontmatter
  body: string
}
