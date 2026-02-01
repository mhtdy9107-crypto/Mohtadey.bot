export const config = {
    name: "كنية",
    version: "0.0.3-xaviaBot-port",
    permissions: [2], // مسؤولي المجموعات فقط
    credits: "Mirai Team",
    description: "تغيير أو مسح كنية عضو في المجموعة",
    usage: "كنية <الاسم> (بالرد أو المنشن)",
    cooldowns: 3
};

export async function onCall({ message, args }) {
    // لو ما في اسم → مسح الكنية
    const nickname = args.length > 0 ? args.join(" ") : "";

    let targetID;

    // رد
    if (message.type === "message_reply") {
        targetID = message.messageReply.senderID;
    }
    // منشن
    else if (Object.keys(message.mentions).length > 0) {
        targetID = Object.keys(message.mentions)[0];
    }
    // نفسه
    else {
        targetID = message.senderID;
    }

    try {
        await global.api.changeNickname(
            nickname,
            message.threadID,
            targetID
        );
        // 🔕 بدون أي رسالة نجاح
    } catch (err) {
        message.reply("❌ حصل خطأ، تأكد إنو البوت أدمن");
    }
            }
