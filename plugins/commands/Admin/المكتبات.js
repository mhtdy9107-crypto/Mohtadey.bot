import { exec } from "child_process";
import fs from "fs";

const config = {
    name: "المكتبات",
    aliases: ["libs", "libraries"],
    description: "إدارة مكتبات البوت (install / uninstall / list / clean) مع حماية",
    usage: "المكتبات [install/uninstall/list/clean] [اسم]",
    permissions: [2],
    credits: "Gemini + تعديل xzava"
};

// ✅ قائمة المكتبات الخطرة التي لا يمكن العبث بها
const blockedLibs = [
    "fs", "child_process", "process", "os", "http", "https", "net"
];

const langData = {
    "ar_SY": {
        "noPermission": "⚠️ الأمر دا مخصص للمطور فقط.",
        "noLibs": "📂 ما في مكتبات مثبتة حالياً.",
        "needName": "⚠️ اكتب اسم المكتبة.",
        "cleaning": "🧹 جاري تنظيف الكاش...",
        "cleanDone": "✨ تم تنظيف الكاش بنجاح!",
        "installing": "⚙️ جاري تثبيت {lib}...\n⏳ اصبر شوية.",
        "installFail": "❌ فشل التثبيت:\n{err}",
        "installDone": "✅ تم تثبيت {lib}\n🔄 إعادة تشغيل...",
        "uninstalling": "🗑️ جاري حذف {lib}...",
        "uninstallDone": "✅ تم حذف {lib}\n🔄 إعادة تشغيل...",
        "blockedLib": "🚫 لا يمكن تثبيت أو حذف المكتبة المحظورة: {lib}"
    }
};

function box(title, content) {
    return `╭─── [ ${title} ] ───╮\n${content}\n╰──────────────────╯`;
}

async function onCall({ message, args, getLang }) {
    const developerID = "61586897962846";
    if (String(message.senderID) !== developerID) {
        return message.reply(getLang("noPermission"));
    }

    const action = args[0];
    const libName = args.slice(1).join(" ");

    /* ===== list ===== */
    if (!action || action === "list") {
        try {
            const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
            const deps = Object.entries(pkg.dependencies || {});
            if (!deps.length) return message.reply(getLang("noLibs"));

            let body = "";
            deps.forEach(([name, ver], i) => {
                body += `🔹 ${i + 1}. ${name} ➪ ${ver.replace("^", "")}\n`;
            });

            return message.reply(
                box(`📦 المكتبات (${deps.length})`, body)
            );
        } catch {
            return message.reply("❌ خطأ في قراءة package.json");
        }
    }

    /* ===== clean ===== */
    if (action === "clean") {
        message.reply(getLang("cleaning"));
        return exec("npm cache clean --force", err => {
            if (err) return message.reply("❌ فشل التنظيف.");
            message.reply(getLang("cleanDone"));
        });
    }

    /* ===== uninstall ===== */
    if (action === "uninstall") {
        if (!libName) return message.reply(getLang("needName"));
        if (blockedLibs.includes(libName)) {
            return message.reply(getLang("blockedLib", { lib: libName }));
        }
        message.reply(getLang("uninstalling", { lib: libName }));
        return exec(`npm uninstall ${libName}`, err => {
            if (err) return message.reply("❌ فشل الحذف.");
            message.reply(getLang("uninstallDone", { lib: libName }));
            process.exit(1);
        });
    }

    /* ===== install (default) ===== */
    const target = action === "install" || action === "i"
        ? libName
        : args.join(" ");

    if (!target) return message.reply(getLang("needName"));
    if (blockedLibs.includes(target)) {
        return message.reply(getLang("blockedLib", { lib: target }));
    }

    message.reply(getLang("installing", { lib: target }));
    exec(`npm install ${target} --save --legacy-peer-deps --force`, (err) => {
        if (err) {
            return message.reply(
                getLang("installFail", { err: err.message })
            );
        }
        message.reply(getLang("installDone", { lib: target }));
        process.exit(1);
    });
}

export default {
    config,
    langData,
    onCall
};
