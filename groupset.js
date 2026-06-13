let handler = async (m, { conn, args, command }) => {
    if (!m.isGroup) return global.sendForward(conn, m.chat, '*[❗] للجروبات بس*', [], m)
    let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    let status = args[1] === 'on'
    if (command === 'انتي_لينك') chat.antilink = status
    if (command === 'انتي_سبام') chat.antispam = status
    if (command === 'ترحيب') chat.welcome = status
    await global.sendForward(conn, m.chat, `✅ تم ${status? 'تفعيل' : 'تعطيل'} ${command}`, [], m)
}
handler.command = /^(انتي_لينك|انتي_سبام|ترحيب)$/i
handler.group = true
handler.admin = true
export default handler
