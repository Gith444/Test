const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Токен бота из .env
const TOKEN = process.env.TELEGRAM_TOKEN;

// Создание экземпляра бота с long polling
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
app.use(express.json());

// Функция для создания кнопок
const createMenu = (chatId) => {
  bot.sendMessage(chatId, 'Выберите пункт меню:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Пункт 1', callback_data: 'submenu_1' },
          { text: 'Пункт 2', callback_data: 'submenu_2' },
        ]
      ]
    }
  });
};

// Функция для создания подпунктов
const createSubmenu = (chatId, menu) => {
  const submenu = [
    { text: 'Подпункт 1', callback_data: `${menu}_1` },
    { text: 'Подпункт 2', callback_data: `${menu}_2` },
    { text: 'Подпункт 3', callback_data: `${menu}_3` }
  ];

  bot.sendMessage(chatId, 'Выберите подпункт:', {
    reply_markup: {
      inline_keyboard: [submenu]
    }
  });
};

// Функция для возвращения в меню
const goBackToMenu = (chatId) => {
  bot.sendMessage(chatId, 'Вы вернулись в основное меню.', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Назад в меню', callback_data: 'back_to_menu' }
        ]
      ]
    }
  });
};

// Обработчик на команду /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  createMenu(chatId);
});

// Обработчик на нажатие кнопок меню
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'submenu_1') {
    createSubmenu(chatId, 'submenu_1');
  } else if (data === 'submenu_2') {
    createSubmenu(chatId, 'submenu_2');
  } else if (data.startsWith('submenu_1_') || data.startsWith('submenu_2_')) {
    const menu = data.split('_')[0]; // submenu_1 или submenu_2
    const subNum = data.split('_')[2]; // 1, 2, или 3

    const imageUrl = `https://example.com/image${subNum}.jpg`; // замените на реальные URL изображений
    const text = `Это описание для подпункта ${subNum}`;

    // Отправляем картинку и описание
    bot.sendPhoto(chatId, imageUrl, { caption: text }).then(() => {
      goBackToMenu(chatId);  // Возвращаемся в меню
    });
  } else if (data === 'back_to_menu') {
    createMenu(chatId); // Возвращаемся в основное меню
  }

  bot.answerCallbackQuery(query.id);  // Подтверждаем обработку callback запроса
});

// Запуск Express сервера (для работы с Glitch)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});
