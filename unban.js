let handler = async (m, { conn }) => {
    let rawUser = m.mentionedJid?.[0] || m.quoted?.sender
    if (!rawUser) return global.sendForward(conn, m.chat, `*[ ⚠️ ] منشن المحظور*`, [], m)
    let user = await global.decodeLid(rawUser, conn, m.chat) || rawUser
    if (typeof user === 'object') user = user.jid
    global.db.data.users = global.db.data.users || {}
    if (global.db.data.users) {
        global.db.data.users.banned = false
        global.db.data.users.warn = 0
    }
    await global.sendForward(conn, m.chat, `✅ تم فك حظر @${user.split('@')[0]}`,, m)
}
handler.command = /^(الغاء_حظر|unban)$/i
handler.group = true
handler.admin = true
export default handler
