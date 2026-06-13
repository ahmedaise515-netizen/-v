import config from '../config.js'
let handler = async (m, { conn }) => {
    let menu = `╗┇═━═⏣⊰〘👑〙⊱⏣═━═┇╔\n*مرحبا بك في بوت آسيا v1*\n𓆩⃞⚙️𓆪 *البريفكس:* ${config.prefix}\n𓆩⃞📊𓆪 *الحالة:* شغالة 24 ساعة\n*〘🛡️ اوامر الادارة〙*\n${config.prefix}حظر @منشن\n${config.prefix}طرد @منشن\n${config.prefix}تحذير @منشن\n${config.prefix}الغاء_حظر @منشن\n*〘🔒 اوامر الحماية〙*\n${config.prefix}انتي_لينك on/off\n${config.prefix}انتي_سبام on/off\n${config.prefix}ترحيب on/off\n*〘ℹ️ خدمات〙*\n${config.prefix}منشن\n${config.prefix}لستة_الحظر\n${config.prefix}ستكر\n*〘👑 المطور〙*\n${config.prefix}eval\n${config.prefix}ريستارت\n╝┇═━═⏣⊰〘🚫〙⊱⏣═━═┇╚`
    await global.sendForward(conn, m.chat, menu, [m.sender], m)
    global.shownUsers[m.sender] = true
}
handler.command = /^(منيو|menu|اوامر)$/i
export default handler
