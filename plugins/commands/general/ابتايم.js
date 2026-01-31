import { createCanvas } from "canvas";
import fs from "fs";
import * as os from "node:os";
import path from "path";

const config = {
    name: "upt",
    aliases: ["up", "ابتايم "],
    credits: "Azadx69x"
};

// تنسيق الوقت
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
        // رسالة تحميل مؤقتة
        const loadingMsg = await message.reply("⏳ جاري إنشاء لوحة النظام...");

        const start = Date.now();

        // ===== البيانات =====
        const botUptime = formatTime(process.uptime());
        const systemUptime = formatTime(os.uptime());

        const totalMem = os.totalmem() / 1024 / 1024;
        const freeMem = os.freemem() / 1024 / 1024;
        const usedMem = totalMem - freeMem;
        const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpu = os.cpus()[0]?.model || "Unknown CPU";
        const cores = os.cpus().length;
        const platform = `${os.platform()} (${os.arch()})`;
        const nodeVersion = process.version;
        const hostname = os.hostname();
        const botRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const ping = Date.now() - start;
        const now = new Date().toLocaleString();

        // ===== Canvas =====
        const width = 650;
        const height = 480;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // الخلفية
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, width, height);

        // الكرت
        ctx.fillStyle = "#111a2e";
        ctx.fillRect(25, 70, width - 50, height - 120);

        // العنوان
        ctx.fillStyle = "#00d9ff";
        ctx.font = "26px Arial";
        ctx.fillText("SYSTEM STATUS", 30, 45);

        ctx.font = "14px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText(`Time: ${now}`, width - 260, 45);

        // البيانات
        const labels = [
            "Bot Uptime",
            "System Uptime",
            "CPU",
            "RAM Usage",
            "Platform",
            "Node.js",
            "Host",
            "Ping",
            "Bot Memory"
        ];

        const values = [
            botUptime,
            systemUptime,
            `${cpu} (${cores} cores)`,
            `${usedMem.toFixed(0)} / ${totalMem.toFixed(0)} MB`,
            platform,
            nodeVersion,
            hostname,
            `${ping} ms`,
            `${botRam} MB`
        ];

        ctx.font = "16px Arial";
        labels.forEach((label, i) => {
            ctx.fillStyle = "#00ffff";
            ctx.fillText(label, 50, 120 + i * 32);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(values[i], 220, 120 + i * 32);
        });

        // ===== دائرة الرام =====
        const cx = width - 120;
        const cy = 170;
        const r = 50;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 8;
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
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.fillStyle = "#00ffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${ramPercent}% RAM`, cx, cy + 6);

        // حالة البوت
        ctx.textAlign = "center";
        ctx.fillStyle = "#00ff9c";
        ctx.font = "18px Arial";
        ctx.fillText("Bot is running smoothly 🚀", width / 2, height - 25);

        // حفظ الصورة
        filePath = path.join(os.tmpdir(), `uptime_${Date.now()}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        // حذف رسالة التحميل
        await loadingMsg.delete?.();

        // إرسال الصورة فقط (بدون أي نص)
        await message.reply({
            attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);

    } catch (err) {
        console.error(err);
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await message.reply("❌ حصل خطأ أثناء إنشاء لوحة النظام.");
    }
}

export default {
    config,
    onCall
};
