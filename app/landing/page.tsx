'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Add email subscription logic (Mailchimp/SendGrid)
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black bg-opacity-30 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">💙❤️ SOSNU</h1>
          <Link
            href="/"
            className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition"
          >
            До додатку
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
            Знайди своє кохання <br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              прямо поруч
            </span>
          </h2>

          <p className="text-2xl text-gray-100 mb-8">
            SOSNU — це додаток, який поєднує людей з однаковими інтересами на карті вашого міста
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition transform hover:scale-105"
            >
              🔥 Розпочати зараз
            </Link>
            <button className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white hover:bg-opacity-30 transition backdrop-blur-md">
              📱 Дізнатися більше
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-white mb-12">
            <div>
              <div className="text-4xl font-bold">🌍</div>
              <p className="text-sm mt-2">Доступно в Україні</p>
            </div>
            <div>
              <div className="text-4xl font-bold">⚡</div>
              <p className="text-sm mt-2">Миттєво знайди</p>
            </div>
            <div>
              <div className="text-4xl font-bold">💬</div>
              <p className="text-sm mt-2">Спілкуйся Безпосередньо</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black bg-opacity-40 backdrop-blur-md py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-16">
            Чому саме SOSNU? 🤔
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '📍',
                title: 'Геолокація',
                desc: 'Знайди людей поруч з тобою на карті',
              },
              {
                icon: '⚡',
                title: 'Швидко',
                desc: 'Створи профіль за 1 хвилину',
              },
              {
                icon: '🔒',
                title: 'Безпечно',
                desc: 'Твої дані захищені Supabase',
              },
              {
                icon: '💬',
                title: 'Прямий контакт',
                desc: 'Telegram, WhatsApp, Viber',
              },
              {
                icon: '🎯',
                title: 'Інтереси',
                desc: 'Знайди людей з твоїми хобі',
              },
              {
                icon: '👥',
                title: 'Спільнота',
                desc: 'Приєднайся до тисяч користувачів',
              },
              {
                icon: '🚀',
                title: 'Інновація',
                desc: 'Новий спосіб знайомств',
              },
              {
                icon: '💚',
                title: 'Безкоштовно',
                desc: 'Базова версія повністю вільна',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl border border-white border-opacity-20 hover:bg-opacity-20 transition"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-16">
            Як це працює? 🎯
          </h3>

          <div className="space-y-8">
            {[
              {
                step: '1️⃣',
                title: 'Завантаж фото',
                desc: 'Виберіть красиву фотографію себе',
              },
              {
                step: '2️⃣',
                title: 'Напиши про себе',
                desc: 'Розкажи, що ти шукаєш (кава, прогулянка, дата)',
              },
              {
                step: '3️⃣',
                title: 'Вкажи адресу',
                desc: 'Виберіть місце на карті',
              },
              {
                step: '4️⃣',
                title: 'Поділися контактом',
                desc: 'Telegram, WhatsApp або Viber',
              },
              {
                step: '5️⃣',
                title: 'Чекай нових людей',
                desc: 'Побачи сигнали інших прямо на карті',
              },
              {
                step: '6️⃣',
                title: 'Спілкуйся!',
                desc: 'Пиши першому або очікуй повідомлення',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="text-5xl min-w-fit">{item.step}</div>
                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl flex-1 border border-white border-opacity-20">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black bg-opacity-40 backdrop-blur-md py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-16">
            Що говорять користувачі 💬
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Анна, 24',
                city: 'Київ',
                text: 'Знайшла свого хлопця за 2 дні! Дуже простий і зручний додаток 💕',
              },
              {
                name: 'Максим, 26',
                city: 'Львів',
                text: 'Нарешті додаток для людей, які хочуть щось реального, а не свайпання 🎯',
              },
              {
                name: 'Ольга, 23',
                city: 'Харків',
                text: 'Карта справді працює! Вигідно від інших додатків. Раджу всім!',
              },
              {
                name: 'Ігор, 28',
                city: 'Одеса',
                text: 'Найкраща реалізація ідеї знайомств на основі локації 🚀',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl text-white"
              >
                <p className="mb-4 text-lg italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-200">📍 {testimonial.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Будь першим! 📬
          </h3>
          <p className="text-xl text-gray-100 mb-8">
            Підпишись на розсилку та дізнайся про новини та оновлення
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              placeholder="Твоя пошта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-2xl transition"
            >
              ✉️ Підписатися
            </button>
          </form>

          {subscribed && (
            <p className="mt-4 text-green-300 font-bold">
              ✅ Спасибі за підписку!
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black bg-opacity-60 py-20 px-4 text-center">
        <h3 className="text-5xl font-bold text-white mb-8">
          Готовий знайти своє кохання? 💕
        </h3>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 text-white px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
        >
          🔥 ПОЧНИ ПРЯМО ЗАРАЗ
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-80 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">SOSNU</h4>
            <p>Додаток для знайомств на основі геолокації</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Посилання</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white">
                  До додатку
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Ціни
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Юридичні</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Правила користування
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Політика конфіденційності
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Соціальні мережі</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  TikTok
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8 text-center">
          <p>&copy; 2025 SOSNU. All rights reserved. 💙❤️</p>
        </div>
      </footer>
    </div>
  );
}
