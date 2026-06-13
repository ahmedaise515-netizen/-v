let handler = async (m, { conn }) => {
    if (!m.isGroup) return global.sendForward(conn, m.chat, '*[❗] الامر ده للجروبات بس*', [], m)
    let rawUser = m.mentionedJid?.[0] || m.quoted?.sender
    if (!rawUser) return global.sendForward(conn, m.chat, `*[ ⚠️ ] منشن الشخص او رد على رسالته*`, [], m)
    let user = await global.decodeLid(rawUser, conn, m.chat) || rawUser
    if (typeof user === 'object') user = user.jid
    await conn.groupParticipantsUpdate(m.chat,, 'remove')
    await global.sendForward(conn, m.chat, `✅ تم طرد @${user.split('@')[0]}`,, m)
}
handler.command = /^(طرد|kick)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
