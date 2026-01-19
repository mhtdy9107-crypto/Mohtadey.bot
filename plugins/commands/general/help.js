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
⇒ وصف: {description}
⇒ استعمال: {usage}
⇒ الصلاحيات: {permissions}
⇒ فئة: {category}
⇒ وقت الانتظار: {cooldown}
⇒ الاعتمادات: {credits}
        `,
        "0": "عضو",
        "1": "إدارة المجموعة",
        "2": "ادارة البوت"
    }
};

// تحويل اسم الأمر في حالة كان alias
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

    // صورة ثابتة لقائمة الأوامر
    const image = "https://i.ibb.co/xt75p0yk/1768714709999.jpg";

    // عرض كل الأوامر
    if (!commandName) {
        let commands = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || "en_US";

        for (const [key, value] of commandsConfig.entries()) {
            if (value.isHidden) continue;
            if (
                value.isAbsolute &&
                !global.config?.ABSOLUTES?.some(e => e == message.senderID)
            ) continue;

            if (!value.hasOwnProperty("permissions"))
                value.permissions = [0, 1, 2];

            if (!value.permissions.some(p => userPermissions.includes(p)))
                continue;

            if (!commands[value.category])
                commands[value.category] = [];

            commands[value.category].push(
                value._name && value._name[language]
                    ? value._name[language]
                    : key
            );
        }

        let list = Object.keys(commands)
            .map(
                category =>
                    `⌈ ${category.toUpperCase()} ⌋\n${commands[category].join(" ▣ ")}`
            )
            .join("\n\n");

        return message.reply(
            `${image}\n\n${getLang("help.list", {
                total: Object.values(commands)
                    .map(e => e.length)
                    .reduce((a, b) => a + b, 0),
                list,
                syntax: prefix
            })}`
        );
    }

    // عرض تفاصيل أمر واحد
    const command = commandsConfig.get(getCommandName(commandName));
    if (!command)
        return message.reply(
            getLang("help.commandNotExists", { command: commandName })
        );

    const isHidden = command.isHidden;
    const isUserValid = command.isAbsolute
        ? global.config?.ABSOLUTES?.some(e => e == message.senderID)
        : true;
    const isPermissionValid = command.permissions.some(p =>
        userPermissions.includes(p)
    );

    if (isHidden || !isUserValid || !isPermissionValid)
        return message.reply(
            getLang("help.commandNotExists", { command: commandName })
        );

    return message.reply(
        `${image}\n\n${getLang("help.commandDetails", {
            name: command.name,
            aliases: command.aliases.join(" ▣ "),
            version: command.version || "1.0.0",
            description: command.description || "",
            usage: `${prefix}${commandName} ${command.usage || ""}`,
            permissions: command.permissions
                .map(p => getLang(String(p)))
                .join(" ▣ "),
            category: command.category,
            cooldown: command.cooldown || 3,
            credits: command.credits || ""
        }).replace(/^ +/gm, "")}`
    );
}

export default {
    config,
    langData,
    onCall
};
