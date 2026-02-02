export default async function ({ message }) {
  const { performance } = await import("perf_hooks");

  // إرسال رسالة واحدة
  const status = await message.reply("⏳ جاري قياس سرعة استجابة البوت...");

  const start = performance.now();
  const end = performance.now();
  const ping = Math.floor(end - start);

  let level = "";
  let advice = "";

  if (ping <= 150) {
    level = "🔋 ممتاز";
    advice = "الأمور تمام، البوت شغال بسلاسة واستجابة عالية.";
  } else if (ping <= 400) {
    level = "⚡ جيد";
    advice = "الاستجابة كويسة، لكن يفضّل تخفيف الضغط على البوت.";
  } else {
    level = "🐢 بطيء";
    advice = "في بطء واضح، ممكن يكون ضغط على السيرفر أو مشكلة في الاتصال.";
  }

  // تعديل نفس الرسالة
  await message.edit(
`╭━〔 📡 فحص السرعة 〕━╮
┃
┃ ⏱️ الزمن: ${ping} ms
┃ 📊 التقييم: ${level}
┃ 💡 ملاحظة:
┃ ${advice}
┃
╰━━━━━━━━━━━━━━━━━━╯`,
    status.messageID
  );
  }
