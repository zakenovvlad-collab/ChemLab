from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)
from bot.config import WEBAPP_URL

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🧪 Открыть лабораторию",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )
    await message.answer(
        f"Привет, {message.from_user.first_name}!\n\n"
        "Это <b>ChemLab</b> — интерактивная таблица Менделеева "
        "с лабораторией реакций.\n\n"
        "Жми кнопку ниже 👇",
        reply_markup=kb,
    )