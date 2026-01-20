const config = {
    name: "غادر",
    aliases: ["leave"],
    description:
        "Leave the group/all groups, please note that the out all will not include the message request/spam group",
    usage: "[groupID/all]",
    cooldown: 5,
    permissions: [2],
    credits: "XaviaTeam",
    isAbsolute: true,
};

const langData = {
    vi_VN: {},
    en_US: {},
    ar_SY: {},
};

function out(threadID) {
    return new Promise((resolve) => {
        global.api.removeUserFromGroup(global.botID, threadID, () => {
            resolve(true);
        });
    });
}

async function onCall({ message, args }) {
    try {
        const input = args[0]?.toLowerCase();
        const threadIDs = [];

        if (input === "all") {
            const threadList =
                (await global.api.getThreadList(100, null, ["INBOX"])) || [];

            const groups = threadList.filter(
                (thread) =>
                    thread.threadID !== message.threadID &&
                    thread.isGroup &&
                    thread.isSubscribed
            );

            threadIDs.push(...groups.map((t) => t.threadID));
        } else if (args.length > 0) {
            const inputThreadIDs = args
                .map((id) => id.replace(/[^0-9]/g, ""))
                .filter((id) => id.length >= 16 && !isNaN(id));

            threadIDs.push(...inputThreadIDs);
        } else {
            threadIDs.push(message.threadID);
        }

        for (const threadID of threadIDs) {
            await out(threadID);
            await global.utils.sleep(300);
        }
    } catch (e) {
        console.error(e);
    }
}

export default {
    config,
    langData,
    onCall,
};
