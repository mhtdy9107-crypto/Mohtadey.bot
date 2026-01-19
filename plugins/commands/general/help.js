const fs = require("fs");
const axios = require("axios");
const path = require("path");

const config = {
    name: "help",
    _name: {
        "ar_SY": "اوامر"
    },
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "ᏕᎥᏁᎨᎧ"
};

const langData = {
    "en_US": {
        "help.list": "{list}\n\n⇒ Total: {total} commands\n⇒ Use {syntax} [command] to get more information about a command.",
        "help.commandNotExists": "Command {command} does not exists.",
        "help.commandDetails": `
⇒ Name: {name}
⇒ Aliases: {aliases}
⇒ Version: {version}
⇒ Description: {description}
⇒ Usage: {usage}
⇒ Permissions: {permissions}
⇒ Category: {category}
⇒ Cooldown: {cooldown}
⇒ Credits: {credits}
        `,
        "0": "Member",
        "1": "Group Admin",
        "2": "Bot Admin"
    },
    "ar_SY": {
        "help.list": "{list}\n\n⇒ المجموع: {total} الاوامر\n⇒ يستخدم {syntax} [امر] لمزيد من المعلومات حول الأمر.",
        "help.commandNotExists": "امر {command} غير موجود.",
        "help.commandDetails": `
⇒ اسم: {name}
⇒ اسم مستعار: {aliases}
⇒ الإصدار: {version}
⇒ الوصف: {description}
⇒ الاستعمال: {usage}
⇒ الصلاحيات: {permissions}
⇒ الفئة: {category}
⇒ وقت الانتظار: {cooldown}
⇒ الاعتمادات: {credits}
        `,
        "0": "عضو",
        "1": "إدارة المجموعة",
        "2": "ادارة البوت"
    }
};

// تحميل الصورة مرة واحدة فقط
async function downloadImage(url, filePath) {
    if (fs.existsSync(filePath)) return;
    const res = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

// تحويل alias إلى اسم الأمر الحقيقي
function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;
    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }
    return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    const imageUrl = "https://i.ibb.co/xt75p0yk/1768714709999.jpg";
    const imagePath = path.join(__dirname, "help.jpg");
    await downloadImage(imageUrl, imagePath);

    // ===============================
    // عرض قائمة الأوامر
    // ===============================
    if (!commandName) {
        let commands = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || "en_US";

        for (const [key, value] of commandsConfig.entries()) {
            if (value.isHidden) continue;
            if (value.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) continue;

            if (!value.permissions) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;

            if (!commands[value.category]) commands[value.category] = [];
            commands[value.category].push(
                value._name?.[language] || key
            );
        }

        const list = Object.keys(commands)
            .map(cat => `⌈ ${cat.toUpperCase()} ⌋\n${commands[cat].join(" ▣ ")}`)
            .join("\n\n");

        return message.reply({
            body: getLang("help.list", {
                list,
                total: Object.values(commands).flat().length,
                syntax: prefix
            }),
            attachment: fs.createReadStream(imagePath)
        });
    }

    // ===============================
    // عرض تفاصيل أمر معين
    // ===============================
    const command = commandsConfig.get(getCommandName(commandName));
    if (!command)
        return message.reply(getLang("help.commandNotExists", { command: commandName }));

    if (
        command.isHidden ||
        (command.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) ||
        !command.permissions.some(p => userPermissions.includes(p))
    ) {
        return message.reply(getLang("help.commandNotExists", { command: commandName }));
    }

    return message.reply({
        body: getLang("help.commandDetails", {
            name: command.name,
            aliases: command.aliases.join(" ▣ "),
            version: command.version || "1.0.0",
            description: command.description || "",
            usage: `${prefix}${commandName} ${command.usage || ""}`,
            permissions: command.permissions.map(p => getLang(String(p))).join(" ▣ "),
            category: command.category,
            cooldown: command.cooldown || 3,
            credits: command.credits || ""
        }).replace(/^ +/gm, ""),
        attachment: fs.createReadStream(imagePath)
    });
}

export default {
    config,
    langData,
    onCall
};
