const config = {
    name: "ضيفني",
    description: "إضافة المطور إلى القروبات",
    usage: "ضيفني",
    cooldown: 5,
    permissions: [2],
    credits: "Mustapha",
};

const langData = {
    ar_SY: {
        notDev: "❌ يا زول الأمر دا للمطور بس",
        noGroups: "⚠️ ما في قروبات متاحة هسع",
        listHeader: "⌈ 📂 القروبات الموجودة ⌋\n\n",
        replyHint: "\n✦ رد برقم القروب الداير تدخلوا",
        invalidNumber: "❌ الرقم دا ما صاح",
        addedGroup: "✅ المطور دخل القروب ✌️🔥",
        addedPrivate: "✔️ تمام، دخلناك قروب:\n{name}",
        failedAdd: "⚠️ ما قدرنا نضيفك (يمكن إنت موجود أصلاً)",
    },
};

const DEVELOPER_ID = "61586897962846";

async function onCall({ message, getLang }) {
    try {
        const { senderID, threadID } = message;

        if (senderID !== DEVELOPER_ID)
            return message.reply(getLang("notDev"));

        const threads = await global.api.getThreadList(50, null, ["INBOX"]);
        const groups = threads.filter(t => t.isGroup);

        if (!groups.length)
            return message.reply(getLang("noGroups"));

        let msg = getLang("listHeader");
        groups.forEach((g, i) => {
            msg += `${i + 1}. 💠 ${g.name}\n`;
        });
        msg += getLang("replyHint");

        global.api.sendMessage(msg, threadID, (err, info) => {
            if (err) return;

            global.client.handleReply.push({
                name: config.name,
                messageID: info.messageID,
                threadID,              // ✅ مهم
                author: senderID,
                groups,
            });
        });

    } catch (e) {
        console.error("AddMe error:", e);
    }
}

async function handleReply({ api, event, handleReply, getLang }) {
    try {
        if (event.senderID !== handleReply.author) return;

        const index = Number(event.body) - 1;
        const group = handleReply.groups[index];

        if (!group)
            return api.sendMessage(
                getLang("invalidNumber"),
                event.threadID
            );

        try {
            await api.addUserToGroup(
                DEVELOPER_ID,
                group.threadID
            );

            api.sendMessage(
                getLang("addedGroup"),
                group.threadID
            );

            api.sendMessage(
                getLang("addedPrivate", { name: group.name }),
                event.threadID
            );

        } catch (err) {
            api.sendMessage(
                getLang("failedAdd"),
                event.threadID
            );
        }

    } catch (e) {
        console.error("HandleReply AddMe error:", e);
    }
}

export default {
    config,
    langData,
    onCall,
    handleReply,
};
