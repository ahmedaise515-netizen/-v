export async function handler(conn, update) {
    if (!update.participants ||!update.id) return
    let chat = global.db.data.chats[update.id] || {}
    if (!chat.welcome) return
    for (let user of update.participants) {
        let pp = await conn.profilePictureUrl(user, 'image').catch(() => 'https://i.imgur.com/2Dzr4iw.jpeg')
        let text = update.action === 'add'
     ? `╗┇═━═⏣⊰〘👋〙⊱⏣═━═┇╔\nاهلا بيك @${user.split('@')[0]} في الجروب\nنورت آسيا v1 👑\n╝┇═━═⏣⊰〘❤️〙⊱⏣═━═┇╚`
        : `🚪 @${user.split('@')[0]} غادر الجروب`
        await conn.sendMessage(update.id, {
            image: { url: pp },
            caption: text,
            mentions:
        })
    }
}
