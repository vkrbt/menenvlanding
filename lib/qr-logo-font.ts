/**
 * Dela Gothic One, подрезанный до букв «М» и «С» (800 байт) — тем же начертанием
 * набран логотип в шапке сайта.
 *
 * Шрифт встроен в файл, а не подключён ссылкой, потому что знак рисуется внутри
 * SVG с кодом: скачанный SVG откроют там, где этого шрифта нет, а PNG мы получаем
 * растеризацией SVG через <img> — туда шрифты страницы не доходят. Data-URI решает
 * оба случая разом и делает картинку самодостаточной.
 *
 * Обновить (если сменится начертание знака):
 *   curl "https://fonts.googleapis.com/css2?family=Dela+Gothic+One&text=МС"
 *   # взять из ответа ссылку на woff2, скачать и перекодировать в base64
 */
export const LOGO_FONT_WOFF2_BASE64 =
  'd09GMgABAAAAAAMgABAAAAAABjAAAALKAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhYbHhwuBmAARBEICoFwgVkLDgABNgIkAxgE' +
  'IAWEKAcgFyQYDhvyBMgEArSjJpsc4L3O0MOqiAqqv4PdiXt0KgfwBZ4kQDH8ZF+yO5fNTWOTFrC2JhWoFSrQ1gjP5gvyCm+uRQDW' +
  'KNUChYYQCYKWeKNT5OSV1GCO6vQaBoWzIITXJNa7d8+cNILzSOeUMZx7e4jLpbwoNmAC2iqtgenFcYVoI0qEMJ8JDlOT3JxZU1xG' +
  'BrrylxOMFaBWCF3XxC4S8tbuunTIlMbF4CxpAkgRETbHvD2rK2/lfxAxrTJe/Hn/5zVNunRWGAaWuWYaGta7oqKMqrJwLVNSA4ah' +
  '8FAvGysTBzVruu3oFLs7d8XCe1Zra2/XnLhrueo2C+5Yrb4Xfaf29m3L2a3WbS3e07TbNDZ7vT3xNnbCnE2Om/+47tP388/izpkT' +
  'J+9ce5kydL/Rd0bquTmxmR2tPUUVPT0D1Z1xw5XB8+MiZ3xoX0XK57uld6SdSbeJaa+wFbL0Tk3d/eL7oCEBDQ2sAQK4tcpHu0uA' +
  '8V0u1z6d85QQ+YsdfgW326V8M7eS78XU4+V2NfLSJwFLkv9d+//czFLNEzSzO+Of8odqxf/n4LDl37V/Z80s70twSk3le7w4jxp5' +
  'lACVa3M5T1rMlF940YbZFE2VQ+b0PS1HWfDRI8I5J4j68h1Yw5b3BNEMDgMrwpiFTfCkA5sSRBzYSsdhgClMYQKTSSKccKm9m0kM' +
  'MoEpJgpjMozgnuNMop9wysmjhBx6GaGTfMaZwgCDdFPOGL2EUiWF+5nal55EHb3gFoBxtk8nkjAiiCDWmNVlQ5fp9K4pryqZTGoo' +
  'pozkI/QpjbBtdTbjTGDmI9D6H05QJ4pxPujQBo421PR1FUxinCF66Z4UzmRqD/fw5k9GJ+BxQz/P9a6bShdhdDPO6Ev490w6GWYq' +
  's+hljPCLegP5H7iN09/hAOe6sEd8/W8t38v3/z//91cb/k5dOCXke1bJCSxlK1tZCgA='
