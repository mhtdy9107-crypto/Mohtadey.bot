import axios from "axios";

const config = {
    name: "بين",
    aliases: ["pin", "pint", "بن", "pinterest", "صور"],
    description: "البحث عن صور من Pinterest",
    usage: "<كلمة البحث> [عدد الصور]",
    category: "بحث",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "Ꮥ.ᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯ"
};

async function onCall({ message, args }) {
    try {
        if (!args.length)
            return message.reply("⚠️ اكتب كلمة البحث\n\n📝 مثال: بين cat 5");

        let count = 6;
        const lastArg = args[args.length - 1];
        if (!isNaN(lastArg)) {
            count = Math.min(parseInt(lastArg), 20);
            args.pop();
        }

        const query = args.join(" ");
        await message.reply(`🔍 بفتش ليك عن: ${query} ...`);

        // API بديل شغال
        const { data } = await axios.get(
            "https://pinterest-api-one.vercel.app/",
            {
                params: {
                    q: query,
                    limit: count
                }
            }
        );

        if (!data || !data.images || !data.images.length)
            return message.reply(`❌ ما لقيت صور لـ "${query}"`);

        const attachments = [];

        for (const url of data.images.slice(0, count)) {
            try {
                attachments.push(await global.getStream(url));
            } catch {}
        }

        if (!attachments.length)
            return message.reply("⚠️ فشل تحميل الصور");

        return message.reply({
            body: `✅ لقيت ${attachments.length} صورة لـ "${query}"`,
            attachment: attachments
        });

    } catch (err) {
        console.error(err);
        return message.reply("❌ حصل خطأ أثناء البحث");
    }
}

export default {
    config,
    onCall
};
