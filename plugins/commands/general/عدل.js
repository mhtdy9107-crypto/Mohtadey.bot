import axios from 'axios';

const config = {
    name: 'عدل',
    version: '1.0',
    permissions: 0,
    credits: '@jm (rapido)',
    description: 'edit some replied img with prompt using zaikyoo API',
    usages: '[prompt] (reply to image)',
    cooldown: 5
};

const lang = {
    "en_US": {
        "missing": "Please provide both a prompt and reply to an image"
    }
};

async function onCall({ message, args, getLang }) {
    const prompt = args.join(' ');
    const hasImage = message.messageReply?.attachments?.[0]?.type === "photo";
    
    if (!prompt || !hasImage) return message.reply(getLang("missing"));

    try {
        const imageUrl = message.messageReply.attachments[0].url;
        const apiUrl = `https://zaikyoov3-up.up.railway.app/api/editv1?prompt=${encodeURIComponent(prompt)}&img=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { responseType: 'stream' });
        
        await message.reply({
            body: "result:",
            attachment: response.data
        });
        
    } catch (error) {
        message.reply(error.message);
    }
}

export default {
    config,
    langData: lang,
    onCall
};
