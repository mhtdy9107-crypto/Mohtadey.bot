const config = {
    name: "إشعار",
    aliases: ["sendnotification"],
    description: "Send notification to all groups",
    usage: "[message]",
    permissions: [2],
    credits: "XaviaTeam"
};

const langData = {
    "ar_SY": {
        "sendnoti.message":
            "╭─────── ❀إشـعاࢪ مـن الــمطوࢪ❀ ───────╮\n" +
            "        "
            "                            \n\n" +
            "{message}",
        "sendnoti.success": "✅ تم إرسال الإشعار إلى {count} مجموعات",
        "sendnoti.fail": "❌ فشل إرسال الإشعار إلى {count} مجموعات"
    }
};

// 🔹 رابط الصورة الثابت
const IMAGE_URL = "https://i.ibb.co/1GkLbB3r/1768714709999.jpg";

async function onCall({ message, getLang, prefix }) {
    const { threadID } = message;

    let msg = message.body.slice(prefix.length + config.name.length + 1) || "";
    if (!msg.trim()) msg = " ";

    const imagePath = `${global.cachePath}/notification.jpg`;

    // تحميل الصورة
    try {
        await global.downloadFile(imagePath, IMAGE_URL);
    } catch (err) {
        return message.reply("❌ فشل تحميل صورة الإشعار");
    }

    const allTIDs = Array.from(global.data.threads.keys()).filter(tid => tid !== threadID);
    let success = 0;

    for (let i = 0; i < allTIDs.length; i++) {
        const tid = allTIDs[i];
        await new Promise(resolve => {
            setTimeout(async () => {
                try {
                    await message.send({
                        body: getLang("sendnoti.message", { message: msg }),
                        attachment: global.reader(imagePath)
                    }, tid);
                    success++;
                } catch (_) {}
                resolve();
            }, i * 350);
        });
    }

    try { global.deleteFile(imagePath); } catch (_) {}

    let result = getLang("sendnoti.success", { count: success });
    if (success < allTIDs.length) {
        result += "\n" + getLang("sendnoti.fail", {
            count: allTIDs.length - success
        });
    }

    message.reply(result);
}

export default {
    config,
    langData,
    onCall
};
