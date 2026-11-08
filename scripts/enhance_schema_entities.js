const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/i;
const match = html.match(regex);

if (match) {
  let schema = JSON.parse(match[2].trim());
  if (schema['@graph']) {
    const wikidataMap = {
      'Marcus Aurelius': ['https://en.wikipedia.org/wiki/Marcus_Aurelius', 'https://www.wikidata.org/wiki/Q1430'],
      'Lão Tử': ['https://en.wikipedia.org/wiki/Laozi', 'https://www.wikidata.org/wiki/Q9333'],
      'Plato & Socrates': ['https://en.wikipedia.org/wiki/Plato', 'https://www.wikidata.org/wiki/Q859'],
      'Friedrich Nietzsche': ['https://en.wikipedia.org/wiki/Friedrich_Nietzsche', 'https://www.wikidata.org/wiki/Q9358'],
      'John Stuart Mill': ['https://en.wikipedia.org/wiki/John_Stuart_Mill', 'https://www.wikidata.org/wiki/Q50020']
    };

    const bookWikidataMap = {
      'Suy Tưởng': ['https://en.wikipedia.org/wiki/Meditations', 'https://www.wikidata.org/wiki/Q660086'],
      'Đạo Đức Kinh': ['https://en.wikipedia.org/wiki/Tao_Te_Ching', 'https://www.wikidata.org/wiki/Q129772'],
      'Cộng Hòa': ['https://en.wikipedia.org/wiki/Republic_(Plato)', 'https://www.wikidata.org/wiki/Q123397'],
      'Zarathustra Đã Nói Như Thế': ['https://en.wikipedia.org/wiki/Thus_Spoke_Zarathustra', 'https://www.wikidata.org/wiki/Q193630'],
      'Bàn Về Tự Do': ['https://en.wikipedia.org/wiki/On_Liberty', 'https://www.wikidata.org/wiki/Q1053913']
    };

    schema['@graph'].forEach(entity => {
      if (entity['@type'] === 'Person' && wikidataMap[entity.name]) {
        entity.sameAs = wikidataMap[entity.name];
        console.log(`Đã thêm sameAs Wikidata cho tác giả: ${entity.name}`);
      }
      if (entity['@type'] === 'Book' && bookWikidataMap[entity.name]) {
        entity.sameAs = bookWikidataMap[entity.name];
        console.log(`Đã thêm sameAs Wikidata cho tác phẩm: ${entity.name}`);
      }
    });

    const updatedJsonString = JSON.stringify(schema, null, 2);
    html = html.replace(regex, `$1\n${updatedJsonString}\n  $3`);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Cập nhật JSON-LD Schema thành công!');
  }
}
