const config = {
    name: "عرض",
    aliases: ["groups", "القروبات"],
    version: "1.2.1",
    description: "يعرض قروبات البوت مع إمكانية الخروج بالرد برقم (أدمن فقط)",
    usage: "",
    cooldown: 10,
    permissions: [1],
    credits: "ᏕᎥᏁᎨᎧ"
};

const cache = new Map();

async function onCall({ api, message }) {
    try {
        const botAdmins = global.config?.ADMINBOT |"61583321681266"| [];

        if (!botAdmins.includes(message.senderID)) {
            return api.sendMessage(
                "🚫 الأمر ده مخصص لأدمن البوت فقط.",
                message.threadID,
                message.messageID
            );
        }

        // معالجة الرد برقم
        if (message.type === "message_reply") {
            const num = Number(message.body);
            const groups = cache.get(message.senderID);

            if (!groups || !Number.isInteger(num)) return;

            const target = groups[num - 1];
            if (!target) {
                return api.sendMessage(
                    "❌ الرقم غير موجود في القائمة.",
                    message.threadID,
                    message.messageID
                );
            }

            await api.removeUserFromGroup(
                api.getCurrentUserID(),
                target.threadID
            );

            cache.delete(message.senderID);

            return api.sendMessage(
                `✅ تم الخروج بنجاح من:\n${target.name || "قروب بدون اسم"}`,
                message.threadID,
                message.messageID
            );
        }

        // جلب القروبات
        const threads = await api.getThreadList(100, null, ["INBOX"]);
        const groups = threads.filter(t => t.isGroup);

        if (!groups.length) {
            return api.sendMessage(
                "❌ البوت غير موجود في أي قروب حالياً.",
                message.threadID,
                message.messageID
            );
        }

        cache.set(message.senderID, groups);

        let msg = "📋 | قروبات البوت:\n\n";
        groups.forEach((g, i) => {
            msg += `${i + 1}. ${g.name || "قروب بدون اسم"}\n`;
        });

        msg += `\n📊 العدد: ${groups.length}`;
        msg += `\n🗑️ للخروج: رد على الرسالة برقم القروب`;

        api.sendMessage(msg, message.threadID, message.messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage(
            "⚠️ حصل خطأ غير متوقع.",
            message.threadID,
            message.messageID
        );
    }
}

module.exports = { config, onCall };
