import axios from "axios";
import fs from "fs-extra";
import path from "path";

const config = {
  name: "اغنية",
  aliases: ["music"],
  description: "🎶 تشغيل أغاني من يوتيوب",
  cooldown: 5,
  permissions: [0],
  credits: "Hridoy | Modified",
};

export default async function ({ message, args }) {
  const query = args.join(" ").trim();
  if (!query)
    return message.reply(
      "❌ اكتب اسم الأغنية\nمثال:\n sing Starboy"
    );

  try {
    // 🔎 البحث
    await message.reply("🔎 جاري البحث عن الأغنية...");

    const searchRes = await axios.get(
      "https://hridoy-apis.vercel.app/search/youtube",
      {
        params: {
          query,
          count: 1,
          apikey: "hridoyXQC",
        },
      }
    );

    const video = searchRes.data?.result?.[0];
    if (!video)
      return message.reply("❌ ما لقينا أي أغنية بالاسم ده");

    // ⬇️ التحميل
    await message.reply("⬇️ جاري تحميل الأغنية...");

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
    if (!downloadUrl)
      return message.reply("❌ فشل تحميل الأغنية");

    // 📁 حفظ مؤقت
    const cacheDir = path.join(process.cwd(), "cache");
    await fs.ensureDir(cacheDir);

    const filePath = path.join(
      cacheDir,
      `sing_${Date.now()}.mp3`
    );

    const audio = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });

    await fs.writeFile(filePath, audio.data);

    // 📤 الإرسال
    await message.reply({
      body:
`🎶 ${video.title}
👤 ${video.author || "Unknown"}
👁️ ${video.views?.toLocaleString() || "N/A"}`,
      attachment: fs.createReadStream(filePath),
    });

    await fs.unlink(filePath).catch(() => {});

  } catch (err) {
    console.error("[sing error]", err);
    message.reply("❌ حصل خطأ أثناء تشغيل الأغنية");
  }
}

export { config };
