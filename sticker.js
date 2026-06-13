import { sticker } from 'wa-sticker-formatter'
let handler = async (m, { conn }) => {
    let q = m.quoted? m.quoted : m
    let mime = q.mtype || ''
    if (!/image/.test(mime)) return global.sendForward(conn, m.chat, '*[❗] رد على صورة*', [], m)
    let media = await q.download()
    let stiker = await sticker(media, false, 'آسيا v1', 'ملكة الحماية')
    conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
}
handler.command = /^(ستكر|sticker)$/i
export default handler
