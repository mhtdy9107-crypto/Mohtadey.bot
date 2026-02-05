const axios = require('axios');

const config = {
    name: "ميم",
    aliases: ["chill-guy", "شاب-هادئ"],
    credits: "Hridoy",
    version: "1.0",
    countDown: 5,
    prefix: true,
    description: "ينشئ صورة ميم شاب هادئ بالنص المرسل",
    category: "fun",
    guide: {
        ar: "{pn} <النص> - لإنشاء صورة ميم شاب هادئ"
    }
};

export default {
    config,
    onStart: async ({ api, event, args }) => {
        try {
            const text = args.join(' ').trim();
            if (!text) {
                return api.sendMessage("✋ يرجى كتابة النص لإنشاء صورة الميم.", event.threadID);
            }

            const apiUrl = `https://sus-apis-2.onrender.com/api/chill-guy?text=${encodeURIComponent(text)}`;

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            // إرسال الصورة مباشرة بدون حفظ مؤقت
            api.sendMessage({
                body: `🖼 إليك صورة ميم شاب هادئ بالنص:\n"${text}"`,
                attachment: buffer
            }, event.threadID);

        } catch (error) {
            console.error("خطأ في إنشاء ميم شاب هادئ:", error);
            api.sendMessage("❌ عذراً، لم أتمكن من إنشاء صورة الميم حالياً.", event.threadID);
        }
    }
};
