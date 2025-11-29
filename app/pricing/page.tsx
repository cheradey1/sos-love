'use client';

import { useState } from 'react';
import { PRICING_PLANS } from '@/lib/paddle';
import { openCheckout } from '@/lib/paddle';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleCheckout = async (priceId: string) => {
    if (!userEmail.trim()) {
      alert('Будь ласка, введіть свою пошту');
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem('sosnu_user_id') || 'user_' + Date.now();
      await openCheckout(priceId, userId, userEmail);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Помилка при відкритті каси');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Цінова пропозиція SOSNU
          </h1>
          <p className="text-xl text-gray-600">
            Виберіть план, що підходить вам
          </p>
        </div>

        {/* Email Input */}
        <div className="max-w-md mx-auto mb-12">
          <input
            type="email"
            placeholder="Введіть вашу пошту"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-black focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {PRICING_PLANS.free.name}
            </h2>
            <div className="text-4xl font-bold text-blue-600 mb-6">
              $0
              <span className="text-base text-gray-600">/назавжди</span>
            </div>
            <button
              disabled
              className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-lg mb-6 cursor-not-allowed"
            >
              ✅ Поточний план
            </button>
            <ul className="space-y-3">
              {PRICING_PLANS.free.features.map((feature, i) => (
                <li key={i} className="text-gray-700 flex items-center gap-2">
                  <span className="text-lg">{feature.split(' ')[0]}</span>
                  <span>{feature.split(' ').slice(1).join(' ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Monthly */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 transform scale-105 text-white border-4 border-yellow-400">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-bl-2xl font-bold">
              ПОПУЛЯРНА 🔥
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {PRICING_PLANS.premium_monthly.name}
            </h2>
            <div className="text-5xl font-bold mb-6">
              $5
              <span className="text-base font-normal">/місяць</span>
            </div>
            <button
              onClick={() =>
                handleCheckout(PRICING_PLANS.premium_monthly.paddleProductId)
              }
              disabled={loading}
              className="w-full py-3 bg-yellow-400 text-yellow-900 font-bold rounded-lg mb-6 hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading ? '⏳ Завантаження...' : '🚀 Перейти на Premium'}
            </button>
            <ul className="space-y-3">
              {PRICING_PLANS.premium_monthly.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-xl">{feature.split(' ')[0]}</span>
                  <span>{feature.split(' ').slice(1).join(' ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Yearly */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {PRICING_PLANS.premium_yearly.name}
            </h2>
            <div className="text-4xl font-bold text-green-600 mb-2">
              $50
              <span className="text-base text-gray-600">/рік</span>
            </div>
            <p className="text-sm text-green-600 font-bold mb-6">
              Заощадьте $10 на рік! 💚
            </p>
            <button
              onClick={() =>
                handleCheckout(PRICING_PLANS.premium_yearly.paddleProductId)
              }
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg mb-6 hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? '⏳ Завантаження...' : '💳 Придбати рік'}
            </button>
            <ul className="space-y-3">
              {PRICING_PLANS.premium_yearly.features.map((feature, i) => (
                <li key={i} className="text-gray-700 flex items-center gap-2">
                  <span className="text-lg">{feature.split(' ')[0]}</span>
                  <span>{feature.split(' ').slice(1).join(' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ❓ Часті питання
          </h2>
          <div className="space-y-4">
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-bold text-lg cursor-pointer">
                Можу я скасувати підписку?
              </summary>
              <p className="mt-3 text-gray-700">
                Так, ви можете скасувати в будь-який момент. Поточний період буде активний до кінця.
              </p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-bold text-lg cursor-pointer">
                Який спосіб оплати ви приймаєте?
              </summary>
              <p className="mt-3 text-gray-700">
                Ми приймаємо всі основні кредитні картки через Paddle.
              </p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-bold text-lg cursor-pointer">
                Чи є пробний період?
              </summary>
              <p className="mt-3 text-gray-700">
                Скоро додамо 7-денний пробний період для всіх нових користувачів.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
