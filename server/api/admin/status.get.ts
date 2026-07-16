import { isAdmin } from '~~/server/utils'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    const slackId = (session?.user as any)?.slack_id as string | undefined
    return { isAdmin: !!slackId && isAdmin(slackId) }
})
