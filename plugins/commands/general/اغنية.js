import axios from "axios";
import fs from "fs-extra";
import path from "path";

const config = {
    name: "اغنية",
    aliases: ["music"],
    description: "🎶 البحث وتشغيل الأغاني من يوتيوب",
    cooldown: 5,
    permissions: [0],
    credits: "Hridoy",
};

const langData = {
    ar_SY: {
        noQuery: "❌ اكتب اسم الأغنية\nمثال: sing Starboy",
        searching: "🔎 جاري البحث عن الأغنية...",
        notFound: "❌ لم يتم العثور على نتائج",
        downloading: "⬇️ جاري تحميل الأغنية...",
        sending: "📤 جاري إرسال الأغنية...",
        failedDownload: "❌ فشل تحميل الأغنية",
        error: "❌ حصل خطأ أثناء تنفيذ الأمر",
        caption:
`🎶 {title}
👤 الفنان: {author}
👁️ المشاهدات: {views}`,
    },
};

async function onCall({ message, args }) {
    const query = args.join(" ").trim();
    if (!query) return message.reply(langData.ar_SY.noQuery);

    let statusMsg;

    try {
        statusMsg = await message.reply(langData.ar_SY.searching);

        // 🔎 البحث
        const searchRes = await axios.get(
            "https://hridoy-apis.vercel.app/search/youtube",
            {
                params: {
                    query,
                    count: 5,
                    apikey: "hridoyXQC",
                },
            }
        );

        const results = searchRes.data?.result;
        if (!Array.isArray(results) || !results.length) {
            return message.edit(langData.ar_SY.notFound, statusMsg.messageID);
        }

        const video = results[0];

        // ⬇️ تحميل MP3 (المسار الصحيح)
        await message.edit(langData.ar_SY.downloading, statusMsg.messageID);

        const downRes = await axios.get(
            "https://hridoy-apis.vercel.app/downloader/ytmp3",
            {
                params: {
                    url: video.url,
                    apikey: "hridoyXQC",
                },
            }
        );

        const downloadUrl = downRes.data?.result?.downloadUrl;
        if (!downloadUrl) {
            return message.edit(langData.ar_SY.failedDownload, statusMsg.messageID);
        }

        await message.edit(langData.ar_SY.sending, statusMsg.messageID);

        // 📁 حفظ مؤقت
        const cacheDir = path.join(process.cwd(), "cache");
        await fs.ensureDir(cacheDir);

        const filePath = path.join(cacheDir, `sing_${Date.now()}.mp3`);

        const audio = await axios.get(downloadUrl, {
            responseType: "arraybuffer",
            timeout: 120000,
        });

        await fs.writeFile(filePath, audio.data);

        const body = langData.ar_SY.caption
            .replace("{title}", video.title || "Unknown")
            .replace("{author}", video.author || "Unknown")
            .replace("{views}", video.views?.toLocaleString() || "N/A");

        await message.send({
            body,
            attachment: fs.createReadStream(filePath),
        });

        await fs.unlink(filePath).catch(() => {});
        await message.unsend(statusMsg.messageID);

    } catch (err) {
        console.error("[sing error]", err);
        if (statusMsg?.messageID)
            await message.edit(langData.ar_SY.error, statusMsg.messageID);
        else
            await message.reply(langData.ar_SY.error);
    }
}

export default {
    config,
    langData,
    onCall,
};
