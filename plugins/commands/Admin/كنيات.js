import fs from "fs";

const config = {
    name: "كنيات",
    description: "تعيين كنية حسب الجنس مع استبدال اسم + تسريع التنفيذ",
    usage: "كنيات <النمط>",
    cooldown: 15,
    permissions: [2],
    credits: "Gemini + تعديل",
};

const langData = {
    ar_SY: {
        notGroup: "❌ هذا الأمر يعمل داخل المجموعات فقط",
        notOwner: "⚠️ هذا الأمر مخصص لمطور البوت فقط",
        missingTemplate:
            "⚠️ لازم تكتب تنسيق فيه كلمة (اسم)\n\nمثال:\nكنيات ﹝اسم﹞ فدلبي ﹝جندي﹞🦧",
        start: "⏳ جاري تغيير كنيات {count} عضو...",
        done:
            "✅ تم الانتهاء!\n\n✔️ تم التغيير: {success}\n📝 التنسيق:\n{template}",
        error: "❌ حصل خطأ في التنفيذ",
    },
};

// 🔍 تحديد الجنس من الاسم (تقريبي لكنه عملي)
function detectGender(firstName) {
    if (!firstName) return "male";

    return /[ةىا]$/.test(firstName) ? "female" : "male";
}

// 🔄 تحويل الكلمة إلى مؤنث
function feminize(word) {
    if (word.endsWith("ة")) return word;
    return word + "ة";
}

async function onCall({ message, getLang }) {
    try {
        if (!message?.isGroup)
            return message.reply(getLang("notGroup"));

        const { threadID, senderID, args, reply } = message;

        const OWNER_ID = "61586897962846";
        if (senderID !== OWNER_ID)
            return reply(getLang("notOwner"));

        const template = args.slice(1).join(" ");
        if (!template || !template.includes("اسم"))
            return reply(getLang("missingTemplate"));

        const threadInfo = await global.api.getThreadInfo(threadID);
        const userIDs = threadInfo?.participantIDs?.slice(0, 250);
        if (!userIDs) return reply(getLang("error"));

        reply(getLang("start", { count: userIDs.length }));

        let success = 0;

        for (const uid of userIDs) {
            try {
                const info = await global.api.getUserInfo(uid);
                const fullName = info[uid]?.name || "عضو";
                const firstName = fullName.split(" ")[0];

                const gender = detectGender(firstName);

                let nickname = template.replace(
                    /[\(\[\{\<\«『「﹝]*اسم[\)\}\]\>\»』」﹞]*/g,
                    firstName
                );

                // 🔥 تعديل آخر كلمة حسب الجنس
                if (gender === "female") {
                    nickname = nickname.replace(
                        /(جندي|مواطن|طالب|مدير)\b/g,
                        (w) => feminize(w)
                    );
                }

                await global.api.changeNickname(nickname, threadID, uid);
                success++;

                // ⚡ تسريع (نصف ثانية)
                await new Promise((r) => setTimeout(r, 500));
            } catch (e) {
                // تجاهل العضو اللي ما بتتغير كنيته
            }
        }

        reply(
            getLang("done", {
                success,
                template,
            })
        );
    } catch (e) {
        console.error("Nickname error:", e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
