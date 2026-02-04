import axios from "axios";

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
    // 🔎 البحث عن الأغنية
    const searchRes = await axios.get(
      "https://hridoy-apis.vercel.app/search/youtube",
      {
        params: { query, count: 1, apikey: "hridoyXQC" },
      }
    );

    const video = searchRes.data?.result?.[0];
    if (!video) throw new Error("لا يوجد أغنية بالاسم ده");

    // ⬇️ تحميل الأغنية مباشرة
    const downRes = await axios.get(
      "https://hridoy-apis.vercel.app/downloader/ytmp3",
      {
        params: { url: video.url, apikey: "hridoyXQC" },
      }
    );

    const downloadUrl = downRes.data?.result?.downloadUrl;
    if (!downloadUrl) throw new Error("فشل تحميل الأغنية");

    const audioRes = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });

    // 📤 الإرسال مباشرة كـ Buffer
    await message.reply({
      body:
`🎶 ${video.title}
👤 ${video.author || "Unknown"}
👁️ ${video.views?.toLocaleString() || "N/A"}`,
      attachment: Buffer.from(audioRes.data),
    });

  } catch (err) {
    console.error("[sing error]", err);
    message.reply("❌ حدثت مشكلة في تشغيل الأغنية فقط");
  }
};

export { config };
