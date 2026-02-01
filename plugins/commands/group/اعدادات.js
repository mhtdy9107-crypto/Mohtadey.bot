const config = {
    name: "اعدادات",
    aliases: ["setting"],
    description: "🛡 إعدادات حماية المجموعة",
    cooldown: 3,
    permissions: [1],
    credits: "ᏕᎥᏁᎨᎧ",
};

const langData = {
    ar_SY: {
        menu:
`╭━〔 🛡 إعدادات المجموعة 🛡 〕━╮

① [{antiSpam}] ✦ مكافحة السبام
② [{antiOut}] ✦ منع الخروج
③ [{antiChangeGroupName}] ✦ حماية اسم المجموعة
④ [{antiChangeGroupImage}] ✦ حماية صورة المجموعة
⑤ [{antiChangeNickname}] ✦ حماية الكُنى
⑥ [{notifyChange}] ✦ إشعارات الأحداث

╰━━━━━━━━━━━━━━━━━━━━╯
↫ رد بالأرقام لتغيير الإعدادات`,

        warnings: {
            antiSpam: "﹝سبام﹞: ممنوع السبام، التكرار قد يؤدي للطرد",
            antiOut: " ﹝خروج﹞: ماشي وين يا عب يا عب بل بس هنا ",
            antiChangeGroupName: "﹝مجموعة﹞: يمنع تغيير اسم المجموعة",
            antiChangeGroupImage: "﹝تحذير﹞: يمنع تغيير صورة المجموعة",
            antiChangeNickname: "تغير الكنيات غير مسموح به ﹝كنيات﹞",
        },

        notGroup: "❌ هذا الأمر يعمل داخل المجموعات فقط",
        invalid: "❌ اختيار غير صالح",
        success: "✅ تم حفظ الإعدادات بنجاح",
        error: "❌ حدث خطأ",
        botNotAdmin:
            "⚠️ البوت ليس مشرفاً، سيتم تعطيل السبام ومنع الخروج",
        confirm:
`╭━━〔 ⚙️ الإعدادات الجديدة 〕━━╮

① [{antiSpam}] مكافحة السبام
② [{antiOut}] منع الخروج
③ [{antiChangeGroupName}] حماية الاسم
④ [{antiChangeGroupImage}] حماية الصورة
⑤ [{antiChangeNickname}] حماية الكنية
⑥ [{notifyChange}] إشعارات

╰━━━━━━━━━━━━━━╯
👍 اضغط حفظ`,
    },
};

async function confirmChange({ message, getLang, eventData }) {
    if (message.reaction !== "👍") return;

    const { newSettings } = eventData;
    await global.controllers.Threads.updateData(message.threadID, {
        antiSettings: newSettings,
    });

    await message.send(getLang("success"));
}

async function chooseMenu({ message, getLang, data }) {
    const choices = message.args
        .map(Number)
        .filter((n) => n >= 1 && n <= 6);

    if (!choices.length) return message.reply(getLang("invalid"));

    const current = data.thread.data?.antiSettings || {};
    const keys = [
        "antiSpam",
        "antiOut",
        "antiChangeGroupName",
        "antiChangeGroupImage",
        "antiChangeNickname",
        "notifyChange",
    ];

    const newSettings = {};
    for (const k of keys)
        newSettings[k] = !!current[k];

    for (const c of choices) {
        const key = keys[c - 1];
        newSettings[key] = !newSettings[key];

        // ⚠️ إرسال رسالة التحذير الخاصة بالإعداد
        if (langData.ar_SY.warnings[key])
            await message.send(langData.ar_SY.warnings[key]);
    }

    const isBotAdmin = data.thread.info.adminIDs.includes(global.botID);
    if (!isBotAdmin) {
        newSettings.antiSpam = false;
        newSettings.antiOut = false;
        await message.reply(getLang("botNotAdmin"));
    }

    const display = {};
    for (const k of keys)
        display[k] = newSettings[k] ? "✅" : "❌";

    const msg = await message.reply(
        getLang("confirm", display)
    );

    msg.addReactEvent({
        callback: confirmChange,
        newSettings,
    });
}

async function onCall({ message, getLang, data }) {
    if (!data.thread?.info?.isGroup)
        return message.reply(getLang("notGroup"));

    const settings = data.thread.data?.antiSettings || {};
    const show = {};
    for (const k of [
        "antiSpam",
        "antiOut",
        "antiChangeGroupName",
        "antiChangeGroupImage",
        "antiChangeNickname",
        "notifyChange",
    ]) {
        show[k] = settings[k] ? "✅" : "❌";
    }

    const msg = await message.reply(getLang("menu", show));
    msg.addReplyEvent({ callback: chooseMenu });
}

export default {
    config,
    langData,
    onCall,
};
