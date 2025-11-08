const axios = require("axios");
const fs = require("fs-extra");
const path = __dirname + "/coinxbalance.json";

// Create file if not exists
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// Get balance
function getBalance(userID) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (data[userID]?.balance !== undefined) return data[userID].balance;
    return userID === "100078049308655" ? 10000 : 100;
  } catch {
    return 100;
  }
}

// Set balance
function setBalance(userID, balance) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    data[userID] = { balance: Math.max(0, balance) };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Balance save error:", err);
  }
}

// Format balance with ৳
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, "") + "T৳";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B৳";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M৳";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, "") + "k৳";
  return num + "৳";
}

module.exports.config = {
  name: "quiz",
  version: "6.0",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Quiz Game with ৳ Rewards",
  commandCategory: "game",
  usages: "quiz | quiz h",
  cooldowns: 5
};

module.exports.onLoad = function () {
  console.log("Quiz module loaded (Ready to Use)");
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { senderID, body, threadID } = event;
  const { author, answer, messageID, timeout } = handleReply;

  if (senderID != author) return;

  const userAnswer = body.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(userAnswer)) {
    return api.sendMessage("Please reply with A, B, C, or D only.", threadID);
  }

  clearTimeout(timeout);
  let balance = getBalance(senderID);

  if (userAnswer === answer) {
    balance += 1000;
    setBalance(senderID, balance);
    await api.unsendMessage(messageID);
    api.sendMessage(
      `Correct Answer\nYou won +1,000৳\nNew Balance: ${formatBalance(balance)}`,
      threadID
    );
  } else {
    balance = Math.max(0, balance - 50);
    setBalance(senderID, balance);
    api.sendMessage(
      `Wrong Answer\n-50৳ deducted\nCurrent Balance: ${formatBalance(balance)}\nTry again!`,
      threadID
    );
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;
  const balance = getBalance(senderID);
  const TIMEOUT = 20000;

  // Help menu
  if (args[0] && ["h", "help"].includes(args[0].toLowerCase())) {
    const helpMsg = `Quiz Guide
━━━━━━━━━━━━━━━
Correct Answer✅: +1,000৳
Wrong Answer: -50৳
Time: 20 seconds
Minimum Balance: 30৳
━━━━━━━━━━━━━━━
Example: ${global.config.PREFIX}quiz`;
    return api.sendMessage(helpMsg, threadID);
  }

  // Check balance
  if (balance < 30) {
    return api.sendMessage(
      `Low Balance\nCurrent: ${formatBalance(balance)}\nNeed at least: 30৳`,
      threadID
    );
  }

  try {
    const { data } = await axios.get(
      "https://rubish-apihub.onrender.com/rubish/quiz-api?category=Bangla&apikey=rubish69"
    );

    if (!data?.question || !data?.answer) throw new Error("Invalid API");

    // Only question + options + timer (No "Bangla Quiz")
    const question = `${data.question}\n\n🇦  ${data.A} • 🇧  ${data.B}\n🇨  ${data.C} • 🇩  ${data.D}\n\n20 seconds | Reply: A/B/C/D`;

    const msg = await api.sendMessage(question, threadID);

    const timeout = setTimeout(async () => {
      try {
        await api.unsendMessage(msg.messageID);
        api.sendMessage(`Time's up\nCorrect answer was: ${data.answer}`, threadID);
      } catch (e) {}
    }, TIMEOUT);

    global.client.handleReply.push({
      name: this.config.name,
      messageID: msg.messageID,
      author: senderID,
      answer: data.answer,
      timeout
    });

  } catch (err) {
    console.error("Quiz API Error:", err);
    api.sendMessage(
      `Error\nFailed to load quiz. Try again later.`,
      threadID
    );
  }
};
