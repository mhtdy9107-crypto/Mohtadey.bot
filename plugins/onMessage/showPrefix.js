const langData = {
    "en_US": {
        "dev.info": `
╭═══════ 𝐊𝐈𝐅𝐀𝐍𝐁𝐎𝐓초 ═══════╮

⌯︙ 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 ↫     Ꮥ.ᎥᏁᎨᎧ  


⌯︙ 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄 ↫『 𝐊𝐈𝐅𝐀𝐍「✽」𝐁𝐎𝐓 』  


⌯︙ 🔑 𝐏𝐑𝐄𝐅𝐈𝐗 : 【 {prefix} 】

╰═══════ 𝐊𝐈𝐅𝐀𝐍𝐁𝐎𝐓초 ═══════╯
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
