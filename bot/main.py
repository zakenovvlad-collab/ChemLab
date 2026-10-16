import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiohttp import web

from bot.config import BOT_TOKEN
from bot.handlers import start


WEBAPP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "webapp")


async def serve_static(request):
    """Отдаёт файлы Mini App"""
    path = request.match_info.get("path", "index.html")
    if path == "" or path == "/":
        path = "index.html"

    file_path = os.path.join(WEBAPP_DIR, path)
    if not os.path.isfile(file_path):
        return web.Response(status=404, text="Not found")

    # правильный content-type для JSON и JS
    if file_path.endswith(".json"):
        return web.FileResponse(file_path, headers={"Content-Type": "application/json; charset=utf-8"})
    if file_path.endswith(".js"):
        return web.FileResponse(file_path, headers={"Content-Type": "application/javascript; charset=utf-8"})
    if file_path.endswith(".css"):
        return web.FileResponse(file_path, headers={"Content-Type": "text/css; charset=utf-8"})

    return web.FileResponse(file_path)


async def start_web_server():
    app = web.Application()
    app.router.add_get("/", serve_static)
    app.router.add_get("/{path:.*}", serve_static)

    runner = web.AppRunner(app)
    await runner.setup()

    port = int(os.getenv("PORT", 8000))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    print(f"Веб-сервер запущен на порту {port}")


async def main():
    logging.basicConfig(level=logging.INFO)

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(start.router)

    # запускаем и веб-сервер, и бота параллельно
    await start_web_server()
    print("Бот запущен. Жду сообщения...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())