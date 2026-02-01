import Jimp from "jimp";

export const config = {
  name: "تدوير",
  aliases: ["rotate"],
  description: "تدوير الصورة بدرجة معينة",
  usage: "تدوير <درجة>",
  credits: "سينكو"
};

export async function onCall({ message, args }) {
  const degree = parseFloat(args[0]);
  if (isNaN(degree))
    return message.reply("⚠️ اكتب درجة صحيحة");

  let imgUrl;
  if (message.attachments?.length) {
    imgUrl = message.attachments[0].url;
  } else {
    return message.reply("⚠️ أرسل صورة");
  }

  const msg = await message.reply("🔄 جاري تدوير الصورة...");

  try {
    const img = await Jimp.read(imgUrl);
    img.rotate(degree);
    const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

    await message.edit({
      body: "✅ تم تدوير الصورة",
      attachment: buffer
    });
  } catch {
    await msg.edit("❌ فشل تدوير الصورة");
  }
}
