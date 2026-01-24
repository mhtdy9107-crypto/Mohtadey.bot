const config = {
    name: "فعاليات",
    description: "فعاليات أنمي تلقائية بزمن",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ᏕᎥᏁᎨᎧ"
};

const langData = {
    "ar_SY": {
        "start": "🔥 بدأت الفعاليات!\nأول فعالية لليوم:",
        "correct": "✅ صح! {user} كسب نقطة",
        "noActiveGame": "ما في أي فعالية شغالة حاليا",
        "gameEnded": "🏁 انتهت الفعاليات!\nالنقاط النهائية:\n{scores}"
    }
};

/* ================= الألعاب (كل لعبة 4 أسئلة) ================= */

const gamesList = [
    {
        name: "تخمين شخصية أنمي",
        questions: [
            { clue: "شخصية شعرها أصفر وتلميذ جيرايا", answer: "ناروتو" },
            { clue: "نينجا بعين شارينغان", answer: "ساسكي" },
            { clue: "الهوكاجي الرابع", answer: "ميناتو" },
            { clue: "النينجا الناسخ", answer: "كاكاشي" }
        ]
    },
    {
        name: "أنمي غامض",
        questions: [
            { clue: "فتى يحارب شياطين لإنقاذ عائلته", answer: "قاتل الشياطين" },
            { clue: "عمالقة خلف الجدران", answer: "هجوم العمالقة" },
            { clue: "قراصنة يبحثون عن كنز", answer: "ون بيس" },
            { clue: "دفتر يقتل بالاسم", answer: "ديث نوت" }
        ]
    }
];

/* ================= التحكم ================= */

let activeGames = new Map();
let questionTimers = new Map();
let listenerAdded = false;

/* ================= الأمر ================= */

async function onCall({ message, getLang, api }) {
    const threadID = message.threadID;

    // بدء الفعاليات
    if (activeGames.has(threadID)) return;

    activeGames.set(threadID, {
        gameIndex: 0,
        questionIndex: 0,
        scores: {},
        answered: false
    });

    await message.reply(getLang("start"));
    startQuestion(threadID, api);

    // listener مرة واحدة فقط
    if (listenerAdded) return;
    listenerAdded = true;

    api.listenMessage(async (event) => {
        if (!event.body) return;

        const thread = event.threadID;
        const msg = event.body.trim().toLowerCase();

        /* ===== إنهاء الفعاليات ===== */
        if (msg === "خلاص") {
            if (!activeGames.has(thread))
                return api.sendMessage(getLang("noActiveGame"), thread);

            if (questionTimers.has(thread)) {
                clearTimeout(questionTimers.get(thread));
                questionTimers.delete(thread);
            }

            const data = activeGames.get(thread);
            const scores = Object.entries(data.scores);

            const scoresText = scores.length
                ? scores.map(([n, p]) => `${n}: ${p} نقطة`).join("\n")
                : "لا أحد كسب نقاط";

            api.sendMessage(
                getLang("gameEnded").replace("{scores}", scoresText),
                thread
            );

            activeGames.delete(thread);
            return;
        }

        if (!activeGames.has(thread)) return;

        const data = activeGames.get(thread);
        const game = gamesList[data.gameIndex];
        const q = game.questions[data.questionIndex];

        if (data.answered) return;

        // إجابة صحيحة
        if (msg === q.answer.toLowerCase()) {
            data.answered = true;

            if (questionTimers.has(thread)) {
                clearTimeout(questionTimers.get(thread));
                questionTimers.delete(thread);
            }

            const user = event.senderName;
            data.scores[user] = (data.scores[user] || 0) + 1;

            api.sendMessage(
                getLang("correct").replace("{user}", user),
                thread
            );

            setTimeout(() => nextQuestion(thread, api), 1500);
        }
    });
}

/* ================= دوال الأسئلة ================= */

function startQuestion(thread, api) {
    const data = activeGames.get(thread);
    if (!data) return;

    const game = gamesList[data.gameIndex];
    const q = game.questions[data.questionIndex];

    data.answered = false;

    api.sendMessage(
        `🎮 ${game.name}\n❓ ${q.clue}\n⏱️ عندك 30 ثانية`,
        thread
    );

    // تايمر 30 ثانية
    const timer = setTimeout(() => {
        if (!activeGames.has(thread)) return;

        const current = activeGames.get(thread);
        if (current.answered) return;

        api.sendMessage("⏰ انتهى الزمن! ننتقل للسؤال التالي", thread);
        nextQuestion(thread, api);
    }, 30000);

    questionTimers.set(thread, timer);
}

function nextQuestion(thread, api) {
    const data = activeGames.get(thread);
    if (!data) return;

    if (questionTimers.has(thread)) {
        clearTimeout(questionTimers.get(thread));
        questionTimers.delete(thread);
    }

    data.answered = false;
    data.questionIndex++;

    // خلصت أسئلة اللعبة
    if (data.questionIndex >= 4) {
        data.gameIndex++;
        data.questionIndex = 0;

        // خلصت كل الألعاب
        if (data.gameIndex >= gamesList.length) {
            api.sendMessage("🎉 كل الفعاليات خلصت! اكتب (خلاص) للإنهاء", thread);
            return;
        }

        api.sendMessage("➡️ ننتقل للفعالية التالية!", thread);
    }

    startQuestion(thread, api);
}

export default { config, langData, onCall };
