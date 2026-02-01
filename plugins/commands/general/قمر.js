import axios from "axios";

export const config = {
  name: "قمر",
  aliases: ["moon"],
  description: "صورة القمر بتاريخ محدد",
  usage: "قمر يوم/شهر/سنة",
  credits: "XaviaTeam"
};

export async function onCall({ message, args }) {
  if (!args[0])
    return message.reply("⚠️ استخدم: قمر 12/1/2024");

  const msg = await message.reply("🌙 جاري جلب صورة القمر...");

  try {
    const res = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`
    );

    await message.edit({
      body: `🌙 صورة القمر`,
      attachment: await global.utils.getStreamFromURL(res.data.url)
    });
  } catch {
    await msg.edit("❌ فشل جلب صورة القمر");
  }
        }
