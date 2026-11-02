// 옛 Gatsby 사이트(gatsby-plugin-offline)가 재방문자 브라우저에 남긴 서비스 워커 제거용.
// 같은 경로(/sw.js)로 교체되면 옛 캐시를 지우고 자신을 해제한 뒤 열린 탭을 한 번 새로고침한다.
// 해제 후에는 다시 등록되지 않으므로 새로고침이 반복되지 않는다.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith('gatsby-plugin-offline')).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
      await self.registration.unregister()
      const windows = await self.clients.matchAll({ type: 'window' })
      await Promise.all(windows.map((client) => client.navigate(client.url).catch(() => undefined)))
    })(),
  )
})
