import os
from dotenv import load_dotenv

# Явно указываем путь к .env в корне проекта (на уровень выше папки bot)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path)

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не задан в .env")