const config = {
    name: "حذف",
    aliases: ["gỡ"],
    description: "Unsend bot's message directly",
    usage: "[reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ᏕᎥᏁᎨᎧ"
}

const langData = {
    "vi_VN": {
        "notReply": "Bạn phải reply tin nhắn của bot",
        "notBotMessage": "Tin nhắn bạn reply không phải của bot",
        "error": "Đã có lỗi xảy ra"
    },
    "en_US": {
        "notReply": "You must reply to the bot's message",
        "notBotMessage": "The message you reply is not from the bot",
        "error": "An error has occurred"
    },
    "ar_SY": {
        "notReply": "انت عيان •-•؟",
        "notBotMessage": "يا عب دي ما رسالتي ヽʕ •͡-•ʔ⁩ノ",
        "error": "حدث خطأ"
    }
}

async function onCall({ message, getLang }) {
    try {
        if (message.type !== "message_reply")
            return message.reply(getLang("notReply"));

        if (message.messageReply?.senderID !== global.botID)
            return message.reply(getLang("notBotMessage"));

        const targetMessageID = message.messageReply.messageID;

        return global.api.unsendMessage(targetMessageID);
    } catch (err) {
        console.error(err);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
        }
