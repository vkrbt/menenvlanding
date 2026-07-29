/** @type {import('next').NextConfig} */
const nextConfig = {
  // Статический экспорт: на выходе out/ с готовым HTML, Node-сервер не нужен
  output: 'export',

  // Стандартный режим: /blog/<slug> без слеша — как у всех 40 статей сейчас.
  // Плата — /blog/ становится /blog (единственный изменившийся URL, 308 в vercel.json)
  trailingSlash: false,

  // next/image мы не используем, но флаг страхует от случайного добавления:
  // при output:'export' оптимизатор недоступен и сборка бы упала
  images: { unoptimized: true },

  reactStrictMode: true,
}

export default nextConfig
