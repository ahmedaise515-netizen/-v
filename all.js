let handler = async (m, { conn, text }) => {
    let members = m.metadata.participants.map(v => v.id)
    let msg = text? text : 'اشارة للجميع 👑'
    await global.sendForward(conn, m.chat, msg, members, m)
}
handler.command = /^(منشن|all|tagall)$/i
handler.group = true
handler.admin = true
export default handler
