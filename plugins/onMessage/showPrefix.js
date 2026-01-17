const langData = {
    "en_US": {
        "dev.info": `
╮═══════ᏕᎥᏁᎨᎧ══════╭
Nam:   ᏕᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯ


🔑 Prefix   :  [{prefix}] 
╯═══════ᏕᎥᏁᎨᎧ══════╰
`
    }
};

function onCall({ message, getLang, data }) {
    if (message.body == "prefix" && message.senderID != global.botID) {
        message.reply(
            getLang("dev.info", {
                prefix: data?.thread?.data?.prefix || global.config.PREFIX
            })
        );
    }
}

export default {
    langData,
    onCall
};
