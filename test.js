const { io } = require("socket.io-client");

// ⚠️ Replace with a real JWT from your login API
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTVkODA1NGM4OWQ0ZmYzZGRiMjE3ZiIsIm5hbWUiOiJHYXVyYXYiLCJudW1iZXIiOiI3OTA2Mjg3NzAxIiwiaWF0IjoxNzYwNTA4OTg1LCJleHAiOjE3NjA1OTUzODV9.vV7IIMeuBD7Rd_1WWxcEoU4tFOMB8OYx9-KEGMCccuI";
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmViZGRmMWZkNzM4MGUxYjkxNDkyYiIsIm5hbWUiOiJHYXVyYXYiLCJudW1iZXIiOiI3OTA2Mjg3NzAzIiwiaWF0IjoxNzU3MzM1Nzg0LCJleHAiOjE3NTc0MjIxODR9.jjhLcbDvCa1mMB3_cSrN0VFBSvuv8bg6RwgjpC6Zpzg";

const socket = io("https://ctbackend.crobstacle.com", {
  transports: ["websocket"],
  auth: { token },
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

// ✅ Server immediately pushes active rounds
socket.on("current:rounds", (rounds) => {
  console.log("🎯 Active rounds received:", rounds);

  if (rounds.length > 0) {
    const round = rounds[0];
    socket.emit("join", { room: `game:${round.period}` });
    console.log(`📡 Auto-joined game room: game:${round.period}`);
  }
});

socket.on("user:balance", (data) => {
  console.log("🆕 User Balance:", data);
});

socket.on("round:created", (data) => {
  console.log("🆕 New round created:", data);
});

socket.on("round:finalized", (data) => {
  console.log("🎉 Round finalized:", data);
});

socket.on("balance:update", (data) => {
  console.log("💰 Balance updated:", data);
});

socket.on("game:result", (data) => {
  console.log("🏆 Game result:", data);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
