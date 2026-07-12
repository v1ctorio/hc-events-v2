const cache = new Map<string, { displayName: string; imageUrl: string }>()

export function useCachetUser(slackId: string | undefined | null) {
  const displayName = ref(slackId ?? '')
  const avatarUrl = ref(slackId ? `https://cachet.dunkirk.sh/users/${slackId}/r` : '')

  if (slackId && cache.has(slackId)) {
    const cached = cache.get(slackId)!
    displayName.value = cached.displayName
    avatarUrl.value = cached.imageUrl
  } else if (slackId && import.meta.client) {
    // Lazy fetch on client only — don't block SSR
    fetch(`https://cachet.dunkirk.sh/users/${slackId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.displayName) {
          displayName.value = data.displayName
          avatarUrl.value = data.imageUrl || avatarUrl.value
          cache.set(slackId, { displayName: data.displayName, imageUrl: data.imageUrl || avatarUrl.value })
        }
      })
      .catch(() => { /* keep slackId as fallback */ })
  }

  return { displayName, avatarUrl }
}
