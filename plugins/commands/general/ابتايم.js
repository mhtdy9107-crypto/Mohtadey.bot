import { createCanvas } from "canvas";
import fs from "fs";
import * as os from "node:os";
import path from "path";

const config = {
    name: "ابتايم ",
    aliases: ["up", "upt"],
    credits: "Azadx69x"
};

function formatTime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

async function onCall({ message }) {
    let filePath;
    try {
        const loadingMsg = await message.reply("⏳ Generating system status card...");

        const start = Date.now();

        const uptimeBot = formatTime(process.uptime());
        const uptimeSystem = formatTime(os.uptime());

        const totalMem = os.totalmem() / 1024 / 1024;
        const freeMem = os.freemem() / 1024 / 1024;
        const usedMem = totalMem - freeMem;
        const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpuModel = os.cpus()[0]?.model || "Unknown";
        const cores = os.cpus().length;
        const platform = `${os.platform()} (${os.arch()})`;
        const hostname = os.hostname();
        const nodeVersion = process.version;
        const botMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

        const ping = Date.now() - start;

        // ===== Canvas =====
        const width = 600;
        const height = 460;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#0c1420";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#1a1f2b";
        ctx.fillRect(30, 60, width - 60, height - 100);

        ctx.fillStyle = "#00bfff";
        ctx.font = "22px Arial";
        ctx.fillText("SYSTEM STATUS", 40, 40);

        const labels = [
            "Bot Uptime",
            "System Uptime",
            "CPU",
            "RAM",
            "Platform",
            "Node.js",
            "Host",
            "Ping",
            "Bot Memory"
        ];

        const values = [
            uptimeBot,
            uptimeSystem,
            `${cpuModel} (${cores} cores)`,
            `${usedMem.toFixed(0)} / ${totalMem.toFixed(0)} MB`,
            platform,
            nodeVersion,
            hostname,
            `${ping} ms`,
            `${botMemory} MB`
        ];

        ctx.font = "15px Arial";
        labels.forEach((label, i) => {
            ctx.fillStyle = "#00ffff";
            ctx.fillText(label, 50, 110 + i * 30);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(values[i], 210, 110 + i * 30);
        });

        // RAM circle
        const cx = width - 100;
        const cy = 140;
        const r = 45;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            cx,
            cy,
            r,
            -Math.PI / 2,
            -Math.PI / 2 + (Math.PI * 2 * ramPercent) / 100
        );
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.fillStyle = "#00ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${ramPercent}%`, cx, cy + 5);

        ctx.font = "16px Arial";
        ctx.fillText("Bot is running smoothly 🚀", width / 2, height - 20);

        // حفظ في temp
        filePath = path.join(os.tmpdir(), `uptime_${Date.now()}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        // حذف رسالة التحميل
        await loadingMsg.delete?.();

        // إرسال الصورة
        await message.reply({
            body: "✅ **System status ready**",
            attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);

    } catch (err) {
        console.error(err);
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await message.reply("❌ حصل خطأ أثناء إنشاء كرت الحالة.");
    }
}

export default {
    config,
    onCall
};
