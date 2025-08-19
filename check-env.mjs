import "dotenv/config";

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
	"TELEGRAM_BOT_TOKEN:",
	process.env.TELEGRAM_BOT_TOKEN ? "Present" : "Missing",
);

if (process.env.TELEGRAM_BOT_TOKEN) {
	console.log(
		"Token first 20 chars:",
		process.env.TELEGRAM_BOT_TOKEN.substring(0, 20) + "...",
	);
}
