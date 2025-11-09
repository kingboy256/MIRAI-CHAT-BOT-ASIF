module.exports.config = {
    name: "autoreply",
    version: "1.0",
    hasPermssion: 0,
    credits: "MOHAMMAD AKASH",
    description: "Auto reply for salam & github",
    commandCategory: "noPrefix",
    cooldowns: 0
};

module.exports.handleEvent = async function({ api, event, Users }) {
    if (event.senderID == api.getCurrentUserID()) return;
    const body = (event.body || "").toLowerCase().trim();
    if (!body) return;

    let userName = "বন্ধু";
    try {
        const info = await api.getUserInfo(event.senderID);
        userName = info[event.senderID]?.name || userName;
    } catch (e) {}

    const salamWords = ["সালাম", "assalam", "salam", "w salam"];
    const forkWords = ["fork", "github", "repo"];

    const send = (msg) => {
        api.sendMessage({
            body: msg,
            mentions: [{ tag: userName, id: event.senderID }]
        }, event.threadID, null, event.messageID);
    };

    if (salamWords.some(w => body.includes(w))) {
        send(`ওলাইকুমুস সালাম ${userName}!`);
    } else if (forkWords.some(w => body.includes(w))) {
        send(`আমার GitHub repo 🎯:\nhttps://github.com/mdakashproject/MIRAI-CHAT-BOT-AKASH.git`);
    }
};

module.exports.run = function() {};
