import { webhookCallback } from "grammy";
import { bot } from "@/lib/telegram/bot";

// Import all handlers
import "@/lib/telegram/commands/start";
import "@/lib/telegram/handlers/main-menu";
import "@/lib/telegram/handlers/items";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const POST = webhookCallback(bot, "std/http");
