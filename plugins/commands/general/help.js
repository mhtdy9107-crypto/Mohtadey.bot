const config = {
    name: "مساعدة",
    aliases: ["help", "اوامر"],
    description: "عرض قائمة أوامر البوت بشكل مفصل",
    usage: "",
    credits: "XaviaTeam"
}

async function onCall({ message, args, prefix, userPermissions }) {
    const { commandsConfig } = global.plugins;

    // لو طلب شرح أمر معيّن
    const commandName = args[0]?.toLowerCase();
    if (commandName) {
        const cmd = commandsConfig.get(commandName);
        if (!cmd || cmd.isHidden)
            return message.reply("❌ الأمر غير موجود");

        return message.reply(
`📌 اسم الأمر: ${cmd.name}
🔁 الأسماء البديلة: ${cmd.aliases?.join(", ") || "لا يوجد"}
📝 الوصف: ${cmd.description || "لا يوجد"}
🛠️ الاستخدام:
${prefix}${cmd.name} ${cmd.usage || ""}

📂 القسم: ${cmd.category}
⏱️ الإنتظار: ${cmd.cooldown || 3} ثواني
👤 المطوّر: ${cmd.credits || "غير معروف"}
`);
    }

    // =========================
    // تجميع الأوامر حسب الأقسام
    // =========================
    let devCmds = [];
    let groupCmds = [];
    let toolsCmds = [];
    let funCmds = [];
    let otherCmds = [];

    for (const [key, cmd] of commandsConfig.entries()) {
        if (cmd.isHidden) continue;
        if (!cmd.permissions) cmd.permissions = [0, 1, 2];
        if (!cmd.permissions.some(p => userPermissions.includes(p))) continue;

        const name = cmd.name || key;
        const cat = (cmd.category || "").toLowerCase();

        if (cat.includes("dev") || cat.includes("owner") || cat.includes("المطور")) {
            devCmds.push(name);
        } else if (cat.includes("group") || cat.includes("admin") || cat.includes("المجموعه")) {
            groupCmds.push(name);
        } else if (cat.includes("tool") || cat.includes("util") || cat.includes("ادوات")) {
            toolsCmds.push(name);
        } else if (cat.includes("fun") || cat.includes("game") || cat.includes("ترفيه")) {
            funCmds.push(name);
        } else {
            otherCmds.push(name);
        }
    }

    // =========================
    // شكل القائمة
    // =========================
    let body =
`✨🤖 قائمة أوامر البوت 🤖✨
━━━━━━━━━━━━━━━━━━━

👑 قسم المطوّر
${devCmds.length ? devCmds.map(c => `• ${c}`).join("\n") : "لا توجد أوامر"}

━━━━━━━━━━━━━━━━━━━
👥 قسم المجموعة
${groupCmds.length ? groupCmds.map(c => `• ${c}`).join("\n") : "لا توجد أوامر"}

━━━━━━━━━━━━━━━━━━━
🛠️ قسم الأدوات
${toolsCmds.length ? toolsCmds.map(c => `• ${c}`).join("\n") : "لا توجد أوامر"}

━━━━━━━━━━━━━━━━━━━
🎮 قسم الترفيه
${funCmds.length ? funCmds.map(c => `• ${c}`).join("\n") : "لا توجد أوامر"}

━━━━━━━━━━━━━━━━━━━
📦 أوامر أخرى
${otherCmds.length ? otherCmds.map(c => `• ${c}`).join("\n") : "لا توجد أوامر"}

━━━━━━━━━━━━━━━━━━━
📝 لشرح أي أمر:
${prefix}مساعدة <اسم الأمر>
`;

    // =========================
    // 🔲 إضافة الصورة مباشرة
    // =========================
    const imageUrl = "https://i.ibb.co/xt75p0yk/1768714709999.jpg";
    return message.reply({ body, attachment: await global.getStream(imageUrl) });
}

export default {
    config,
    onCall
}
