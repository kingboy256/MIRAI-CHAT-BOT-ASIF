const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "emoji_voice",
  version: "3.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "শুধু একই ইমোজি — কোনো টেক্সট না থাকলে কাজ করবে",
  commandCategory: "noPrefix",
  usages: "🥺 | 🥺🥺 | 🥺🥺🥺 (শুধু ইমোজি)",
  cooldowns: 2
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  const text = body.trim();

  // যদি কোনো টেক্সট (ইমোজি ছাড়া) থাকে → বন্ধ
  const hasText = /[^\p{Emoji}\s]/u.test(text);
  if (hasText) return;

  // শুধু ইমোজি + স্পেস থাকতে পারে
  const emojis = text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/gu) || [];
  if (emojis.length === 0) return;

  // সব ইমোজি একই কিনা চেক
  const uniqueEmojis = [...new Set(emojis)];
  if (uniqueEmojis.length !== 1) return;

  const targetEmoji = uniqueEmojis[0];

  const supportedEmojiMap = {
    "🥱": "https://files.catbox.moe/9pou40.mp3",
    "😁": "https://files.catbox.moe/60cwcg.mp3",
    "😌": "https://files.catbox.moe/epqwbx.mp3",
    "🥺": "https://files.catbox.moe/wc17iq.mp3",
    "🤭": "https://files.catbox.moe/cu0mpy.mp3",
    "😅": "https://files.catbox.moe/jl3pzb.mp3",
    "😏": "https://files.catbox.moe/z9e52r.mp3",
    "😞": "https://files.catbox.moe/tdimtx.mp3",
    "🤫": "https://files.catbox.moe/0uii99.mp3",
    "🍼": "https://files.catbox.moe/p6ht91.mp3",
    "🤔": "https://files.catbox.moe/hy6m6w.mp3",
    "🥰": "https://files.catbox.moe/dv9why.mp3",
    "🤦": "https://files.catbox.moe/ivlvoq.mp3",
    "😘": "https://files.catbox.moe/sbws0w.mp3",
    "😑": "https://files.catbox.moe/p78xfw.mp3",
    "😢": "https://files.catbox.moe/shxwj1.mp3",
    "🙊": "https://files.catbox.moe/3bejxv.mp3",
    "🤨": "https://files.catbox.moe/4aci0r.mp3",
    "😡": "https://files.catbox.moe/shxwj1.mp3",
    "🙈": "https://files.catbox.moe/3qc90y.mp3",
    "😍": "https://files.catbox.moe/qjfk1b.mp3",
    "😭": "https://files.catbox.moe/itm4g0.mp3",
    "😱": "https://files.catbox.moe/mu0kka.mp3",
    "😻": "https://files.catbox.moe/y8ul2j.mp3",
    "😿": "https://files.catbox.moe/tqxemm.mp3",
    "💔": "https://files.catbox.moe/6yanv3.mp3",
    "🤣": "https://files.catbox.moe/2sweut.mp3",
    "🥹": "https://files.catbox.moe/jf85xe.mp3",
    "😩": "https://files.catbox.moe/b4m5aj.mp3",
    "🫣": "https://files.catbox.moe/ttb6hi.mp3",
    "🐸": "https://files.catbox.moe/utl83s.mp3",
    "💋": "https://files.catbox.moe/37dqpx.mp3",
    "🫦": "https://files.catbox.moe/61w3i0.mp3",
    "😴": "https://files.catbox.moe/rm5ozj.mp3",
    "🙏": "https://files.catbox.moe/7avi7u.mp3",
    "😼": "https://files.catbox.moe/4oz916.mp3",
    "🖕": "https://files.catbox.moe/593u3j.mp3",
    "🥵": "https://files.catbox.moe/l90704.mp3",
    "🙂": "https://files.catbox.moe/mt5il0.mp3",
    "😒": "https://files.catbox.moe/mt5il0.mp3",
    "😓": "https://files.catbox.moe/zh3mdg.mp3",
    "🤧": "https://files.catbox.moe/zh3mdg.mp3"
  };

  const audioUrl = supportedEmojiMap[targetEmoji];
  if (!audioUrl) return;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const filePath = path.join(cacheDir, `${Date.now()}_${encodeURIComponent(targetEmoji)}.mp3`);

  try {
    const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data));

    await api.sendMessage(
      {
        body: "",
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );
  } catch (error) {
    console.error("Emoji voice error:", error);
    api.sendMessage("ভয়েস পাঠাতে সমস্যা হচ্ছে", threadID, messageID);
  }
};

module.exports.run = function () {};
