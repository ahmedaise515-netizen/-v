async function getRealNumber(jid, conn, groupId = null) {
    if (!jid) return null;
    if (jid.endsWith('@s.whatsapp.net')) return jid.split('@')[0];
    if (jid.endsWith('@lid')) {
        const result = await global.decodeLid(jid, conn, groupId);
        if (result.success && result.phone) {
            return result.phone + '@s.whatsapp.net';
        }
    }
    return jid;
}
let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!isAdmin &&!isOwner) return global.sendForward(conn, m.chat, '*[❗] هذا الأمر مخصص للمشرفين والمطور فقط!*', [], m)
    let rawUser;
    if (m.mentionedJid && m.mentionedJid[0]) {
        rawUser = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        rawUser = m.quoted.sender
    } else if (text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number.length >= 11 && number.length <= 15) {
            rawUser = number + '@s.whatsapp.net'
        } else {
            return global.sendForward(conn, m.chat, `*[ ⚠️ ] الرقم غير صحيح!*`, [], m)
        }
    }
    if (!rawUser) return global.sendForward(conn, m.chat, `*[❗] منشن الشخص أو رد على رسالته لحظره من البوت!*`, [], m)
    if (rawUser.includes('201015383185')) {
        return global.sendForward(conn, m.chat, 'انت احول عاوزني احظر مطوري', [], m)
    }
    try {
        let user = await getRealNumber(rawUser, conn, m.chat) || rawUser;
        if (user.includes('201015383185')) {
            return global.sendForward(conn, m.chat, 'انت احول عاوزني احظر مطوري', [], m)
        }
        if (!global.db.data.users) global.db.data.users = {}
        if (!global.db.data.users[rawUser]) global.db.data.users[rawUser] = {}
        global.db.data.users.banned = true
        global.db.data.users[rawUser].banned = true
        let msg = `╗┇═━═⏣⊰〘🚫〙⊱⏣═━═┇╔\n🔒 *تم الحظر من السيستم بنجاح*\n\n𓆩⃞❌𓆪 *المحظور:* @${user.split('@')[0]}\n𓆩⃞⚙️𓆪 *بواسطة:* @${m.sender.split('@')[0]}\n\n⚠️ *تم وضعه في القائمة السوداء*\n╝┇═━═⏣⊰〘🚫〙⊱⏣═━═┇╚`;
        await global.sendForward(conn, m.chat, msg, [user, m.sender], m);
    } catch (err) {
        console.error(err);
        global.sendForward(conn, m.chat, `❌ *حدث خطأ أثناء تنفيذ الأمر!*`, [], m)
    }
}
handler.help = ['حظر @منشن']
handler.tags = ['group', 'owner']
handler.command = /^(حظر|ban)$/i
handler.group = true
export default handler
