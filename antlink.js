let handler = m => m
handler.before = async function(m, { conn, isAdmin }) {
    if (!m.isGroup || isAdmin) return
    let chat = global.db.data.chats[m.chat] || {}
    if (!chat.antilink) return
    let linkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
    if (m.text.match(linkRegex)) {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        await global.sendForward(conn, m.chat, `🚫 @${m.sender.split('@')[0]} طرد بسبب ارسال رابط`, [m.sender], m)
    }
}
export default handler
