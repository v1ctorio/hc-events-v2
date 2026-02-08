export default defineOAuthOidcEventHandler({
    async onSuccess(event, {user, tokens}) {
        await setUserSession(event, {
            user
        })

        return sendRedirect(event, "/")
    },
    onError(event, error) {
        console.error('HC oidc oauth error:', error)
        return sendRedirect(event, '/')
  },
})