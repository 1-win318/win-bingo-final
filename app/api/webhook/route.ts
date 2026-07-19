import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.WEB_APP_URL || 'https://studio-main-theta-umber.vercel.app';

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: unknown) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set.');
    return false;
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    console.error('Telegram sendMessage failed', {
      status: response.status,
      description: data?.description || 'No description returned',
      responseBody: data,
    });
    return false;
  }

  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    console.log('Incoming Telegram update:', JSON.stringify(body));

    if (!body) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const message = body?.message ?? null;
    const callbackQuery = body?.callback_query ?? null;
    const chatId = message?.chat?.id ?? callbackQuery?.message?.chat?.id ?? null;
    const text = message?.text ?? callbackQuery?.data ?? null;

    if (!chatId || typeof text !== 'string') {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const command = text.split(' ')[0].split('@')[0];

    if (command === '/start' || command === '/play') {
      await sendTelegramMessage(
        chatId,
        'Welcome to Lucky Bingo! Tap below to open the game and start playing.',
        {
          inline_keyboard: [
            [
              {
                text: 'Play Game',
                web_app: {
                  url: WEB_APP_URL,
                },
              },
            ],
          ],
        },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
