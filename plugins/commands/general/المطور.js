import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
    name: "المطور",
    description: "عرض معلومات مطور البوت مع صورة",
    usage: "المطور",
    cooldown: 5,
    permissions: [0],
    credits: "ابو عبيده علي",
};

const langData = {
    ar_SY: {
        info:
`👑 معلومات مطور البوت 👑

👤 الاسم : ابو عبيده علي
💻 الدور : مطور البوت
🌍 الدولة : السودان
🛠️ الخبرة : JavaScript • Node.js • Bots
🤖 نوع البوت : إدارة / ترفيه

📞 للتواصل:
🔹 فيسبوك : https://www.facebook.com/profile.php?id=61586897962846


✨ شكراً لاستخدامك البوت ✨`,
        error: "❌ حدث خطأ أثناء إرسال معلومات المطور",
    },
};

async function onCall({ message, getLang }) {
    try {
        const imgUrl = "https://i.ibb.co/wZDHSMvM/received-897009799489398.jpg"; // 🔁 غير الرابط لصورتك
        const imgPath = path.join(process.cwd(), "cache", "developer.jpg");

        // تحميل الصورة
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, res.data);

        // إرسال صورة + رسالة
        await message.reply({
            body: getLang("info"),
            attachment: fs.createReadStream(imgPath),
        });

        fs.unlinkSync(imgPath);
    } catch (e) {
        console.error("Developer command error:", e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
