import util from 'util'
import config from '../config.js'
let handler = async (m, { conn, text }) => {
    if (!config.owner.includes(m.sender)) return global.sendForward(conn, m.chat, '*[❗] للمطور فقط*', [], m)
    if (!text) return global.sendForward(conn, m.chat, '*[⚠️] اكتب الكود*', [], m)
    try {
        let evaled = await eval(text)
        if (typeof evaled!== 'string') evaled = util.inspect(evaled)
        await global.sendForward(conn, m.chat, `✅ النتيجة:\n${evaled}`, [], m)
    } catch (e) {
        await global.sendForward(conn, m.chat, `❌ خطأ:\n${e}`, [], m)
    }
}
handler.command = /^(eval|=>|>)$/i
export default handler
