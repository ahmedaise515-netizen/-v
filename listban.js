let handler = async (m, { conn }) => {
    let banned = Object.entries(global.db.data.users || {})
     .filter(([_, data]) => data.banned)
     .map(([jid]) => `• @${jid.split('@')[0]}`)
    if (banned.length === 0) return global.sendForward(conn, m.chat, '*[✅] مفيش حد محظور*', [], m)
    let txt = `╗┇═━═⏣⊰〘🚫 قائمة المحظورين〙⊱⏣═━═┇╔\n${banned.join('\n')}\n╝┇═━═⏣⊰〘📊〙⊱⏣═━═┇╚`
    await global.sendForward(conn, m.chat, txt, banned.map(j => j.match(/@(\d+)/)[1] + '@s.whatsapp.net'), m)
}
handler.command = /^(لستة_الحظر|listban)$/i
handler.group = true
handler.admin = true
export default handler
