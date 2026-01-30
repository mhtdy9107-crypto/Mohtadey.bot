import os from "os";

const config = {
    name: "uptime",
    aliases: ["upt", "status", "sys"],
    credits: "Ꮥ.ᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯ"
};

async function onCall({ message }) {
    // رسالة مؤقتة
    const loadingMsg = await message.reply("⏳ Getting uptime information...");

    const start = Date.now();

    const uptime = global.msToHMS(process.uptime() * 1000);

    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);

    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;

    const platform = os.platform();
    const nodeVersion = process.version;

    const ping = Date.now() - start;

    const text = `
╭─── ⏳ SYSTEM UPTIME ───╮
│
│ ⏱️ Uptime   : ${uptime}
│ 📡 Ping     : ${ping} ms
│
│ 💾 RAM Used : ${usedRam} GB
│ 💾 RAM Max  : ${totalRam} GB
│
│ ⚙️ CPU      : ${cpuModel}
│ ⚙️ Cores    : ${cpuCores}
│
│ 🧠 OS       : ${platform}
│ 🟢 Node.js  : ${nodeVersion}
│
╰─────────── ✦ ───────────╯
    `.trim();

    // تعديل نفس الرسالة
    await loadingMsg.edit(text);
}

export default {
    config,
    onCall
};
