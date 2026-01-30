const config = {
    name: "كنية" ,
    aliases: ["nick", "nickname"],
    description: "تغيير لقبك أو لقب شخص منشن في القروب",
    usage: "[الاسم الجديد] أو منشن + الاسم",
    category: "خدمات",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Ꮥ.ᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯر
};

async function onCall({ message, args }) {
    try {
        const { threadID, senderID, mentions } = message;
        const name = args.join(" ").trim();

        if (!name)
            return message.reply(
                "⚠️ اكتب الاسم الجديد\n\n📝 مثال: نيم محمد\n📝 أو: نيم @أحمد محمد"
            );

        const mentionIDs = Object.keys(mentions || {});
        const mentionID = mentionIDs[0];

        // لو ما في منشن → غيّر اسم المرسل
        if (!mentionID) {
            await message.api.changeNickname(name, threadID, senderID);
            return message.reply(`${name}`);
        }

        // لو في منشن
        const mentionedName = mentions[mentionID];
        const cleanName = name.replace(mentionedName, "").trim();

        if (!cleanName)
            return message.reply("⚠️ اكتب الاسم الجديد بعد المنشن");

        await message.api.changeNickname(cleanName, threadID, mentionID);
        return message.reply(` ${mentionedName} إلى: ${cleanName}`);

    } catch (err) {
        console.error("NICKNAME ERROR:", err);
        return message.reply("❌ حصل خطأ، تأكد إنو البوت عندو صلاحية تغيير الأسماء");
    }
}

export default {
    config,
    onCall
};
