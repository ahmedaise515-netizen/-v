import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import config from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.db = { data: { users: {}, chats: {}, settings: {} } }
global.shownUsers = {}

// فورورد من قناة آسيا v1
global.fakeForward = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: '120363426553571462@newsletter'
    },
    message: {
        newsletterAdminInviteMessage: {
            newsletterJid: '120363426553571462@newsletter',
            newsletterName: 'آسيا v1',
            caption: 'تابع القناة عشان التحديثات'
        }
    }
}

// دالة ارسال موحدة بالفورورد
global.sendForward = async (conn, jid, text, mentions = [], quoted = null) => {
    await conn.sendMessage(jid, {
        text,
        mentions,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363426553571462@newsletter',
                newsletterName: 'آسيا v1'
            }
        }
    }, { quoted })
}

async function decodeLid(lid, conn, groupId) {
    if (!lid) return null;
    if (lid.endsWith('@s.whatsapp.net')) {
        const phone = lid.split('@')[0];
        if (phone && /^\d+$/.test(phone)) return { success: true, jid: lid, phone: phone };
    }
    if (!lid.endsWith('@lid')) return { success: false, jid: null, phone: null };
    const lidNum = lid.split('@')[0];
    if (groupId?.endsWith('@g.us')) {
        try {
            const meta = await conn.groupMetadata(groupId);
            for (const p of (meta?.participants || [])) {
                if (p.id === lid || p.id?.split('@')[0] === lidNum || p.lid === lid || p.lid?.split('@')[0] === lidNum) {
                    if (p.phoneNumber) {
                        const clean = p.phoneNumber.replace(/[^0-9]/g, '');
                        if (clean && /^\d+$/.test(clean)) return { success: true, jid: `${clean}@s.whatsapp.net`, phone: clean };
                    }
                    if (p.jid &&!p.jid.endsWith('@lid') && p.jid.includes('@s.whatsapp.net')) {
                        const clean = p.jid.split('@')[0];
                        if (clean && /^\d+$/.test(clean)) return { success: true, jid: p.jid, phone: clean };
                    }
                }
            }
        } catch (e) { console.error('[decodeLid] error:', e.message); }
    }
    try {
        const store = conn.contacts || conn.chats || {};
        for (const [contactId, c] of Object.entries(store)) {
            if (!c) continue;
            if (c.lid === lid || c.lid?.split('@')[0] === lidNum || c.id === lid) {
                if (c.phoneNumber) {
                    const clean = c.phoneNumber.replace(/[^0-9]/g, '');
                    if (clean && /^\d+$/.test(clean)) return { success: true, jid: `${clean}@s.whatsapp.net`, phone: clean };
                }
            }
        }
    } catch (_) {}
    return { success: false, jid: null, phone: null };
}
global.decodeLid = decodeLid;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const conn = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['آسيا v1', 'Chrome', '1.0.0'],
        printQRInTerminal: false
    })

    if (!state.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        const question = (text) => new Promise(resolve => rl.question(text, resolve))
        console.log('╗┇═━═⏣⊰〘👑 آسيا v1 〙⊱⏣═━═┇╔')
        const phone = await question('🔢 اكتب رقم البوت بالكود الدولي من غير + : ')
        rl.close()
        let code = await conn.requestPairingCode(phone)
        code = code.match(/.{1,4}/g).join('-')
        console.log(`\n✅ كود ربط آسيا v1: ${code}`)
        console.log('افتح واتساب > الاجهزة المرتبطة > ربط برقم الهاتف')
        console.log('دخل الكود ده: ' + code.replace(/-/g, '') + '\n')
        console.log('╝┇═━═⏣⊰〘⏳〙⊱⏣═━═┇╚')
    }

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return

        const msg = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const prefix = config.prefix
        if (!msg.startsWith(prefix)) return

        const args = msg.slice(prefix).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        // اول مرة يظهر المنيو اوتو
        if (!global.shownUsers[m.sender] && command!== 'منيو' && command!== 'menu' && command!== 'اوامر') {
            const { default: menuCmd } = await import(`file://${path.join(__dirname, 'plugins/menu.js')}`)
            await menuCmd(m, { conn })
            global.shownUsers[m.sender] = true
            return global.sendForward(conn, m.chat, `اكتب ${config.prefix}منيو تاني عشان تشوف الاوامر`, [m.sender], m)
        }

        const cmdFile = path.join(__dirname, 'plugins', `${command}.js`)
        if (fs.existsSync(cmdFile)) {
            try {
                const cmd = await import(`file://${cmdFile}`)
                let isAdmin = false, isBotAdmin = false
                if (m.isGroup) {
                    const metadata = await conn.groupMetadata(m.chat)
                    isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin
                    isBotAdmin = metadata.participants.find(p => p.id === conn.user.id)?.admin
                }
                await cmd.default(m, { conn, text: args.join(' '), args, command, isAdmin, isBotAdmin })
            } catch (e) {
                console.error(e)
                global.sendForward(conn, m.chat, '❌ خطأ في تنفيذ الامر', [], m)
            }
        }
    })

    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { handler } = await import(`file://${path.join(__dirname, 'plugins/welcome.js')}`)
            handler(conn, update)
        } catch {}
    })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('الاتصال قطع، باعيد التشغيل...')
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ آسيا v1 اشتغلت بنجاح')
        }
    })
}
startBot()
