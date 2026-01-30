import { join } from "path";
import axios from "axios";
import fs from "fs";

const config = {
    name: "تيكتوك",
    aliases: ['tt', 'tiktokvideo'],
    version: "1.0.0",
    description: "Search and download TikTok videos",
    usage: '<keyword>',
    cooldown: 5,
    credits: "no credits tho cuz i used the xaviateam's video cmd"
}

const langData = {
    "en_US": {
        "tiktok.missingArguement": "Please provide a search term",
        "tiktok.noResult": "No videos found",
        "tiktok.error": "Error occurred",
        "tiktok.downloading": "Downloading...",
        "tiktok.choose": "Choose a video (reply with number):"
    }
}

async function downloadFile(url, path) {
    const writer = fs.createWriteStream(path);
    const response = await axios({url, method: 'GET', responseType: 'stream'});
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function playVideo(message, video, getLang) {
    message.react("⏳");
    const cachePath = join(global.cachePath, `_tiktok${Date.now()}.mp4`);
    
    try {
        await message.reply(getLang("tiktok.downloading"));
        await downloadFile(video.url, cachePath);
        
        if (!fs.existsSync(cachePath)) throw new Error("Download failed");
        
        await message.reply({
            body: video.title || "TikTok Video",
            attachment: fs.createReadStream(cachePath)
        });
        message.react("✅");
    } catch (err) {
        message.react("❌");
        message.reply(getLang("tiktok.error"));
    } finally {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }
}

async function chooseVideo({ message, eventData, getLang }) {
    const { videos } = eventData;
    const index = parseInt(message.body) - 1;
    if (isNaN(index) || index < 0 || index >= videos.length) return message.reply("Invalid selection");
    await playVideo(message, videos[index], getLang);
}

async function onCall({ message, args, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("tiktok.missingArguement"));
        
        const searchTerm = encodeURIComponent(args.join(" "));
        const apiUrl = `https://rapido.zetsu.xyz/api/tk?search=${searchTerm}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        if (!data || !data.data || data.data.length === 0) {
            return message.reply(getLang("tiktok.noResult"));
        }
        
        const videos = data.data.slice(0, 6);
        const formattedList = videos.map((v, i) => `${i+1}. ${v.title || "No title"}`).join("\n\n");
        
        const sendData = await message.reply({
            body: `${getLang("tiktok.choose")}\n\n${formattedList}`
        });
        
        return sendData.addReplyEvent({
            callback: chooseVideo,
            videos: videos.map(v => ({title: v.title, url: v.video_url}))
        });
    } catch (err) {
        message.reply(getLang("tiktok.error"));
    }
}

export default {
    config,
    langData,
    onCall
}
