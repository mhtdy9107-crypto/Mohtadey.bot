const config = {
    name: "فعاليات",
    description: "لعبة فعاليات أنمي مستمرة حتى أمر الخلاص",
    usage: "[رقم اللعبة أو 'خلاص']",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ᏕᎥᏁᎨᎧ"
};

const langData = {
    "ar_SY": {
        "chooseGame": "دي قائمة الفعاليات الأنمي:\n{list}\nاكتب الرقم عشان تختار اللعبة",
        "invalidChoice": "رقم غير صالح حاول مرة تانية",
        "gameStart": "اللعبة {name} بدأت! أول واحد يجاوب صح ياخد ✅\n{clue}",
        "correct": "✅ صح! {user} كسب نقطة",
        "wrong": "❌ غلط!",
        "scores": "النقاط الحالية:\n{scores}",
        "noActiveGame": "ما في أي فعالية شغالة حاليا",
        "gameEnded": "الفعلية انتهت! الفائز: {winner} 🏆\nالنقاط النهائية:\n{scores}"
    }
};

const gamesList = [
    { name: "تخمين شخصية أنمي", clue: "شخصية شعر أصفر ومعلّم يوزوكا", answer: "نينجا ناروتو" },
    { name: "لون الشعر", clue: "ما هو لون شعر لينك؟", answer: "أشقر" },
    { name: "الأنمي الغامض", clue: "فتى يحارب شياطين لإنقاذ عائلته", answer: "قاتل الشياطين" },
    { name: "شخصية من الصوت", clue: "صوته عالي ونبرته مليانة طاقة", answer: "غوكو" },
    { name: "حركة مشهورة", clue: "قفزة الطاقة", answer: "قفزة الطاقة" },
    { name: "رمز الأنمي", clue: "رمز الجدار الشهير", answer: "هجوم العمالقة" },
    { name: "عدد الحلقات", clue: "كم عدد حلقات وان بيس؟", answer: "1000" },
    { name: "السلاح المفضل", clue: "ما هو السلاح المفضل لليفي؟", answer: "سيف مزدوج" },
    { name: "القدرة الخاصة", clue: "ما هي القدرة الخاصة لساتسوكي؟", answer: "هاكي" },
    { name: "مقولة مشهورة", clue: "من لا يستطيع القتال ليس له مكان في الجيش", answer: "ليفي" }
];

// خريطة لتخزين كل فعالية حسب الجروب
let activeGames = new Map();
let listenerAdded = false;

async function onCall({ message, getLang, api }) {
    try {
        const threadID = message.threadID;

        // لو ما في فعالية شغالة للجروب الحالي، اعرض القائمة
        if (!activeGames.has(threadID)) {
            const list = gamesList.map((g, i) => `${i + 1}. ${g.name}`).join("\n");
            await message.reply(getLang("chooseGame").replace("{list}", list));
        }

        // listener عام مرة واحدة
        if (!listenerAdded) {
            listenerAdded = true;
            api.listenMessage(async (event) => {
                if (!event.body) return;

                const thread = event.threadID;
                const msg = event.body.trim();

                // إنهاء اللعبة
                if (msg.toLowerCase() === "خلاص") {
                    if (!activeGames.has(thread)) return api.sendMessage(getLang("noActiveGame"), thread);

                    const active = activeGames.get(thread);
                    let scoresEntries = Object.entries(active.scores);

                    let winner = "لا أحد";
                    if (scoresEntries.length > 0) {
                        scoresEntries.sort((a, b) => b[1] - a[1]);
                        const topScore = scoresEntries[0][1];
                        const topPlayers = scoresEntries.filter(([_, pts]) => pts === topScore);
                        winner = topPlayers.map(([name]) => name).join(", ");
                    }

                    let scoresText = scoresEntries
                        .sort((a,b)=> b[1]-a[1])
                        .map(([name, pts]) => `${name}: ${pts} نقطة`).join("\n") || "لا أحد كسب نقاط";

                    api.sendMessage(getLang("gameEnded").replace("{winner}", winner).replace("{scores}", scoresText), thread);
                    activeGames.delete(thread);
                    return;
                }

                // لو ما في لعبة شغالة، نتأكد إذا الرسالة رقم لاختيار اللعبة
                if (!activeGames.has(thread)) {
                    const choice = parseInt(msg);
                    if (!isNaN(choice) && choice >= 1 && choice <= gamesList.length) {
                        const game = gamesList[choice - 1];
                        activeGames.set(thread, { game, scores: {}, stage: "started" });
                        api.sendMessage(getLang("gameStart").replace("{name}", game.name).replace("{clue}", game.clue), thread);
                    } else {
                        api.sendMessage(getLang("invalidChoice"), thread);
                    }
                    return;
                }

                // لو في لعبة شغالة والجيم بدأت
                const active = activeGames.get(thread);
                if (active.stage === "started") {
                    const answer = msg.toLowerCase();
                    if (answer === active.game.answer.toLowerCase()) {
                        const userName = event.senderName;
                        active.scores[userName] = (active.scores[userName] || 0) + 1;
                        api.sendMessage(getLang("correct").replace("{user}", userName), thread);
                    } else {
                        api.sendMessage(getLang("wrong"), thread);
                    }
                }

            });
        }

    } catch (err) {
        console.error(err);
    }
}

export default { config, langData, onCall };
