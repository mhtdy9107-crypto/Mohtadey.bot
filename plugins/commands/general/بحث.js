import axios from "axios";

export const config = {
  name: "بحث",
  aliases: ["anime"],
  description: "جلب صورة أنمي عشوائية",
  usage: "انمي",
  credits: "سينكو"
};

export async function onCall({ message }) {
  const msg = await message.reply("⏳ جاري جلب صورة أنمي...");

  try {
    const res = await axios.get("https://api.waifu.pics/sfw/waifu");
    await message.edit({
      body: "🖼️ صورة أنمي",
      attachment: await global.utils.getStreamFromURL(res.data.url)
    });
  } catch {
    await msg.edit("❌ فشل جلب الصورة");
  }
}
