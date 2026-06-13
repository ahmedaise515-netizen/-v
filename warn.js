let handler = async (m, { conn }) => {
    if (!m.isGroup) return global.sendForward(conn, m.chat, '*[❗] للجروبات بس*', [], m)
    let rawUser = m.mentionedJid?.[0] || m.quoted?.sender
    if (!rawUser) return global.sendForward(conn, m.chat, `*[ ⚠️ ] منشن الشخص*`, [], m)
    let user = await global.decodeLid(rawUser, conn, m.chat) || rawUser
    if (typeof user === 'object') user = user.jid
    global.db.data.users = global.db.data.users || {}
    global.db.data.users = global.db.data.users || { warn: 0 }
    global.db.data.users.warn += 1
    let warn = global.db.data.users.warn
    if (warn >= 3) {
        global.db.data.users.banned = true
        await global.sendForward(conn, m.chat, `🚫 @${user.split('@')[0]} وصل 3 تحذيرات وتم حظره`,, m)
        return
    }
    await global.sendForward(conn, m.chat, `⚠️ @${user.split('@')[0]} تحذير رقم ${warn}/3`,, m)
}
handler.command = /^(تحذير|warn)$/i
handler.group = true
handler.admin = true
export default handler
