const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "notification",
  version: "4.3.0",
  hasPermssion: 2,
  credits: "MOHAMMAD AKASH",
  description: "Send compact notification with optional media to all groups",
  commandCategory: "system",
  usages: "[your message] (or reply to media/text)",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  let input = args.join(" ");
  let attachment = [];

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  if (event.messageReply) {
    const reply = event.messageReply;

    if (!input && reply.body) input = reply.body;

    if (reply.attachments && reply.attachments.length > 0) {
      for (const atc of reply.attachments) {
        let ext;
        if (atc.type === "photo") ext = ".jpg";
        else if (atc.type === "animated_image") ext = ".gif";
        else if (atc.type === "video") ext = ".mp4";
        else continue;

        const filePath = path.join(cacheDir, `${Date.now()}_${Math.floor(Math.random() * 9999)}${ext}`);
        const res = await axios.get(atc.url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));
        attachment.push(filePath);
      }
    }
  }

  if (!input && attachment.length === 0)
    return api.sendMessage("🔔 ব্যবহার: !notification [তোমার মেসেজ]\n(অথবা reply করো)", event.threadID, event.messageID);

  const title = "𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝙵𝚛𝚘𝚖 𝙱𝚘𝚝 𝙰𝚍𝚖𝚒𝚗 ☻︎";
  const body = input ? `𝙼𝙰𝚂𝚂𝙰𝙶𝙴:\n${input}` : "";

  try {
    const threads = await api.getThreadList(100, null, ["INBOX"]);
    const groupThreads = threads.filter(t => t.isGroup);
    let count = 0;

    for (const thread of groupThreads) {
      try {
        let files = attachment.map(p => fs.createReadStream(p));
        await api.sendMessage({ body: `${title}\n${body}`, attachment: files }, thread.threadID);
        count++;
        await new Promise(r => setTimeout(r, 300));
      } catch {
        console.log(`❌ Failed to send in ${thread.threadID}`);
      }
    }

    for (const file of attachment) fs.unlinkSync(file);

    return api.sendMessage(`✅ নোটিফিকেশন ${count} টি গ্রুপে পাঠানো হয়েছে।`, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ কোনো ত্রুটি ঘটেছে।", event.threadID, event.messageID);
  }
};
