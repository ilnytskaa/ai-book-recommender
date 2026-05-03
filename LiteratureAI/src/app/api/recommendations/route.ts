import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface BookRecommendation {
  title: string;
  author: string;
  description: string;
  genre: string;
  year?: number;
  rating?: number;
  reason: string;
}

const getFallbackRecommendations = (query: string): BookRecommendation[] => {
  const fallbackBooks: BookRecommendation[] = [
    {
      title: "1984",
      author: "Джордж Орвелл",
      description: "Антиутопічний роман про тоталітарне суспільство майбутнього, де Велика Брат стежить за кожним кроком громадян.",
      genre: "Антиутопія",
      year: 1949,
      rating: 4.8,
      reason: "Класична книга, яка змушує замислитися про свободу, приватність та контроль влади."
    },
    {
      title: "Гаррі Поттер і філософський камінь",
      author: "Дж.К. Роулінг",
      description: "Перша книга про юного чарівника та його пригоди в школі чаклунства Хогвартс.",
      genre: "Фентезі",
      year: 1997,
      rating: 4.7,
      reason: "Захоплююча магічна історія, яка підходить для читачів будь-якого віку."
    },
    {
      title: "Маленький принц",
      author: "Антуан де Сент-Екзюпері",
      description: "Філософська казка про маленького принца, який подорожує планетами та відкриває важливі життєві істини.",
      genre: "Філософська казка",
      year: 1943,
      rating: 4.6,
      reason: "Глибока та зворушлива історія про дружбу, любов та сенс життя."
    },
    {
      title: "Кобзар",
      author: "Тарас Шевченко",
      description: "Збірка поезій великого українського поета, що стала символом української літератури.",
      genre: "Поезія",
      year: 1840,
      rating: 4.9,
      reason: "Основа української літератури, обов'язкова для розуміння української культури."
    },
    {
      title: "Атлант розправив плечі",
      author: "Айн Ренд",
      description: "Філософський роман про індивідуалізм, капіталізм та боротьбу проти колективізму.",
      genre: "Філософський роман",
      year: 1957,
      rating: 4.3,
      reason: "Потужний роман про особисту відповідальність та важливість індивідуальних досягнень."
    },
    {
      title: "Гра престолів",
      author: "Джордж Р.Р. Мартін",
      description: "Епічне фентезі про політичні інтриги та боротьбу за владу в середньовічному світі.",
      genre: "Епічне фентезі",
      year: 1996,
      rating: 4.4,
      reason: "Складний та захоплюючий світ з багатьма персонажами та несподіваними поворотами."
    },
    {
      title: "Убити пересмішника",
      author: "Харпер Лі",
      description: "Роман про расизм та моральне зростання в американському Півдні 1930-х років.",
      genre: "Класична література",
      year: 1960,
      rating: 4.7,
      reason: "Потужна історія про справедливість, моральність та людяність."
    },
    {
      title: "Сто років самотності",
      author: "Габріель Гарсія Маркес",
      description: "Магічний реалізм про сім поколінь родини Буендіа в вигаданому місті Макондо.",
      genre: "Магічний реалізм",
      year: 1967,
      rating: 4.5,
      reason: "Неперевершений твір латиноамериканської літератури з глибоким філософським змістом."
    },
    {
      title: "Злочин і кара",
      author: "Федір Достоєвський",
      description: "Психологічний роман про студента Раскольникова, який вчинив вбивство.",
      genre: "Психологічна драма",
      year: 1866,
      rating: 4.6,
      reason: "Глибоке дослідження людської психології, моралі та викуплення."
    },
    {
      title: "Гаррі Поттер і в'язень Азкабану",
      author: "Дж.К. Роулінг",
      description: "Третя книга серії про Гаррі Поттера, де він дізнається правду про свою сім'ю.",
      genre: "Фентезі",
      year: 1999,
      rating: 4.8,
      reason: "Найкраща книга серії з темнішими мотивами та складнішим сюжетом."
    },
    {
      title: "Майстер і Маргарита",
      author: "Михайло Булгаков",
      description: "Фантастичний роман про візит диявола до радянської Москви.",
      genre: "Містична фантастика",
      year: 1967,
      rating: 4.8,
      reason: "Блискучий твір про добро і зло, любов і творчість."
    },
    {
      title: "Гордість і упередження",
      author: "Джейн Остін",
      description: "Романтична історія про Елізабет Беннет та містера Дарсі в Англії XIX століття.",
      genre: "Романтична класика",
      year: 1813,
      rating: 4.5,
      reason: "Витончена історія кохання з гострим гумором та соціальною критикою."
    },
    {
      title: "Дюна",
      author: "Френк Герберт",
      description: "Епічна наукова фантастика про пустельну планету Арракіс та політичні інтриги.",
      genre: "Наукова фантастика",
      year: 1965,
      rating: 4.6,
      reason: "Одна з найвеличніших книг наукової фантастики з детально проробленим світом."
    }
  ];

  const queryLower = query.toLowerCase();
  let selectedBooks: BookRecommendation[] = [];

  if (queryLower.includes('романтич') || queryLower.includes('любов') || queryLower.includes('кохання') || queryLower.includes('подорож')) {
    selectedBooks = [fallbackBooks[11], fallbackBooks[2], fallbackBooks[10]];
  }
  else if (queryLower.includes('фантастик') || queryLower.includes('магі') || queryLower.includes('чаклун') || queryLower.includes('дракон')) {
    selectedBooks = [fallbackBooks[1], fallbackBooks[9], fallbackBooks[5]];
  }
  else if (queryLower.includes('детектив') || queryLower.includes('злочин') || queryLower.includes('вбивств') || queryLower.includes('таємниц')) {
    selectedBooks = [fallbackBooks[8], fallbackBooks[0], fallbackBooks[6]];
  }
  else if (queryLower.includes('наукова фантастика') || queryLower.includes('sci-fi') || queryLower.includes('космос') || queryLower.includes('майбутн')) {
    selectedBooks = [fallbackBooks[12], fallbackBooks[0], fallbackBooks[10]];
  }
  else if (queryLower.includes('філософ') || queryLower.includes('сенс життя') || queryLower.includes('мудрість') || queryLower.includes('розвиток')) {
    selectedBooks = [fallbackBooks[2], fallbackBooks[4], fallbackBooks[8]];
  }
  else if (queryLower.includes('україн') || queryLower.includes('поез') || queryLower.includes('класик')) {
    selectedBooks = [fallbackBooks[3], fallbackBooks[6], fallbackBooks[10]];
  }
  else if (queryLower.includes('антиутоп') || queryLower.includes('диктатур') || queryLower.includes('контроль')) {
    selectedBooks = [fallbackBooks[0], fallbackBooks[4], fallbackBooks[8]];
  }
  else if (queryLower.includes('сучасн') || queryLower.includes('нов')) {
    selectedBooks = [fallbackBooks[5], fallbackBooks[9], fallbackBooks[12]];
  }
  else if (queryLower.includes('класичн')) {
    selectedBooks = [fallbackBooks[6], fallbackBooks[8], fallbackBooks[11]];
  }
  else {
    selectedBooks = [fallbackBooks[1], fallbackBooks[0], fallbackBooks[2]];
  }

  selectedBooks = selectedBooks.map(book => ({
    ...book,
    reason: `Підібрано для запиту "${query}": ${book.reason}`
  }));

  return selectedBooks.slice(0, 3);
};

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Запит не може бути порожнім' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('❌ OpenAI API ключ не налаштований, використовуємо fallback рекомендації');
      
      const fallbackRecommendations = getFallbackRecommendations(query);
      
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        query: query,
        note: "🎭 Демонстраційні рекомендації. Додайте OpenAI API ключ для персоналізованих рекомендацій від ChatGPT."
      });
    }

    console.log('✅ OpenAI API ключ знайдено, намагаємося використати ChatGPT...');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Ти - експерт з літератури та бібліотекар з великим досвідом. Користувач описав свої уподобання: "${query}"

Надай 3-5 персоналізованих рекомендацій книг у форматі JSON. Кожна рекомендація повинна містити:
- title: назва книги
- author: автор
- description: короткий опис (2-3 речення)
- genre: жанр
- year: рік публікації (якщо відомий)
- rating: рейтинг від 1 до 5 (якщо відомий)
- reason: пояснення, чому ця книга підходить користувачу (1-2 речення)

Відповідай ТІЛЬКИ валідним JSON масивом без додаткового тексту. Приклад формату:
[
  {
    "title": "Назва книги",
    "author": "Ім'я автора",
    "description": "Опис книги...",
    "genre": "Жанр",
    "year": 2020,
    "rating": 4.5,
    "reason": "Ця книга ідеально підходить, тому що..."
  }
]

Враховуй українську літературу та світові бестселери. Намагайся підібрати різноманітні варіанти.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ти - експерт з літератури, який надає персоналізовані рекомендації книг. Відповідай тільки валідним JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Порожня відповідь від OpenAI');
    }

    let recommendations: BookRecommendation[];
    try {
      recommendations = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Помилка парсингу JSON:', parseError);
      console.error('Відповідь OpenAI:', responseText);
      
      recommendations = getFallbackRecommendations(query);
    }

    const validRecommendations = recommendations.filter(book => 
      book.title && book.author && book.description && book.genre && book.reason
    );

    if (validRecommendations.length === 0) {
      const fallbackRecommendations = getFallbackRecommendations(query);
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        query: query,
        note: "Використано резервні рекомендації через помилку обробки відповіді ШІ."
      });
    }

    return NextResponse.json({
      recommendations: validRecommendations,
      query: query
    });

  } catch (error) {
    console.error('Помилка API:', error);
    
    const fallbackRecommendations = getFallbackRecommendations(
      typeof request.body === 'string' ? JSON.parse(request.body).query || 'загальні рекомендації' : 'загальні рекомендації'
    );
    
    return NextResponse.json({
      recommendations: fallbackRecommendations,
      query: 'загальні рекомендації',
      note: "🔧 Демонстраційні рекомендації через помилку сервера. Перевірте налаштування OpenAI API."
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 