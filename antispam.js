let handler = m => m
handler.before = async function(m, { conn, isAdmin }) {
    if (!m.isGroup || isAdmin) return
    let chat = global.db.data.chats[m.chat] || { spam: {} }
    if (!chat.antispam) return
    let user = m.sender
    chat.spam = chat.spam || { count: 0, last: 0 }
    let now = Date.now()
    if (now - chat.spam.last < 3000) {
        chat.spam.count += 1
        if (chat.spam.count > 5) {
            await conn.groupParticipantsUpdate(m.chat,, 'remove')
            await global.sendForward(conn, m.chat, `🚫 @${user.split('@')[0]} طرد بسبب السبام`,, m)
            chat.spam.count = 0
        }
    } else {
        chat.spam.count = 0
    }
    chat.spam.last = now
    global.db.data.chats[m.chat] = chat
}
export default handler
