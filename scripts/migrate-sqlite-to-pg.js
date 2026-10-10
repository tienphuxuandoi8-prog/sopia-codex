/**
 * SOPHIA CODEX - DATA MIGRATION: SQLite -> Supabase Postgres
 * Đọc dữ liệu từ data/sophia.db (SQLite) và chuyển toàn bộ vào Postgres qua Prisma.
 *
 * Chạy lệnh: node scripts/migrate-sqlite-to-pg.js
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DB_PATH = path.join(__dirname, '..', 'data', 'sophia.db');

async function migrate() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Không tìm thấy file SQLite tại:', DB_PATH);
    process.exit(1);
  }

  console.log('📂 Mở cơ sở dữ liệu SQLite cũ:', DB_PATH);
  const sqlite = new DatabaseSync(DB_PATH);

  try {
    // 1. Migrate Categories
    console.log('📂 1. Chuyển đổi Danh mục (Categories)...');
    const categories = sqlite.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          icon: cat.icon || null,
          sortOrder: cat.sort_order || 0
        },
        create: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || null,
          sortOrder: cat.sort_order || 0
        }
      });
    }
    console.log(`   ✓ Đã chuyển ${categories.length} categories.`);

    // 2. Migrate Philosophers
    console.log('🧠 2. Chuyển đổi Triết gia (Philosophers)...');
    const philosophers = sqlite.prepare('SELECT * FROM philosophers').all();
    for (const phil of philosophers) {
      await prisma.philosopher.upsert({
        where: { id: phil.id },
        update: {
          name: phil.name,
          title: phil.title || null,
          era: phil.era || null,
          school: phil.school || null,
          avatarUrl: phil.avatar || null,
          fallbackAvatar: phil.fallback_avatar || null,
          quote: phil.quote || null,
          bio: phil.bio || null,
          color: phil.color || null,
        },
        create: {
          id: phil.id,
          name: phil.name,
          title: phil.title || null,
          era: phil.era || null,
          school: phil.school || null,
          avatarUrl: phil.avatar || null,
          fallbackAvatar: phil.fallback_avatar || null,
          quote: phil.quote || null,
          bio: phil.bio || null,
          color: phil.color || null,
        }
      });
    }
    console.log(`   ✓ Đã chuyển ${philosophers.length} philosophers.`);

    // 3. Migrate Books
    console.log('📚 3. Chuyển đổi Tác phẩm (Books)...');
    const books = sqlite.prepare('SELECT * FROM books').all();
    for (const b of books) {
      let coverThemeJson = null;
      if (b.cover_theme_json) {
        try {
          coverThemeJson = JSON.parse(b.cover_theme_json);
        } catch (e) {}
      }

      const bookData = {
        id: b.id,
        slug: b.id, // dùng id làm slug ban đầu
        title: b.title,
        originalTitle: b.original_title || null,
        author: b.author,
        authorRole: b.author_role || null,
        school: b.school || null,
        categoryId: b.category_id || null,
        readTime: b.read_time || null,
        audioDuration: b.audio_duration || null,
        year: b.year || null,
        rating: b.rating ? parseFloat(b.rating) : 5.0,
        readersCount: b.readers_count || '0',
        featured: Boolean(b.featured),
        accessLevel: 'FREE', // Ban đầu để FREE, admin có thể chỉnh sau
        previewParagraphs: 3,
        tagline: b.tagline || null,
        coverImage: b.cover_image || null,
        fallbackCover: b.fallback_cover || null,
        bgmTheme: b.bgm_theme || null,
        studioAudioUrl: b.studio_audio_url || null,
        coverThemeJson: coverThemeJson,
        summary: b.summary || null,
        status: b.status === 'published' ? 'PUBLISHED' : 'DRAFT',
      };

      await prisma.book.upsert({
        where: { id: b.id },
        update: bookData,
        create: bookData
      });
    }
    console.log(`   ✓ Đã chuyển ${books.length} books.`);

    // 4. Migrate Chapters
    console.log('📖 4. Chuyển đổi Chương mục (Chapters)...');
    const chapters = sqlite.prepare('SELECT * FROM chapters').all();
    let importedChapters = 0;
    for (const c of chapters) {
      let content = [];
      if (c.paragraphs_json) {
        try {
          content = JSON.parse(c.paragraphs_json);
        } catch (e) {
          content = [c.paragraphs_json];
        }
      }

      let takeaways = null;
      if (c.takeaways_json) {
        try {
          takeaways = JSON.parse(c.takeaways_json);
        } catch (e) {}
      }

      await prisma.chapter.upsert({
        where: { id: c.id },
        update: {
          bookId: c.book_id,
          chapterIndex: c.chapter_index,
          chapterNumber: c.chapter_number || null,
          title: c.title,
          subtitle: c.subtitle || null,
          content: content,
          readingTimeMinutes: c.reading_time_minutes || 5,
          audioUrl: c.audio_url || null,
          takeaways: takeaways,
          accessLevel: 'INHERIT',
          status: c.is_published ? 'PUBLISHED' : 'DRAFT',
          isPublished: Boolean(c.is_published)
        },
        create: {
          id: c.id,
          bookId: c.book_id,
          chapterIndex: c.chapter_index,
          chapterNumber: c.chapter_number || null,
          title: c.title,
          subtitle: c.subtitle || null,
          content: content,
          readingTimeMinutes: c.reading_time_minutes || 5,
          audioUrl: c.audio_url || null,
          takeaways: takeaways,
          accessLevel: 'INHERIT',
          status: c.is_published ? 'PUBLISHED' : 'DRAFT',
          isPublished: Boolean(c.is_published)
        }
      });
      importedChapters++;
    }
    console.log(`   ✓ Đã chuyển ${importedChapters} chapters.`);

    // 5. Migrate Quotes
    console.log('💬 5. Chuyển đổi Danh ngôn (Quotes)...');
    const quotes = sqlite.prepare('SELECT * FROM quotes').all();
    for (const q of quotes) {
      await prisma.quote.create({
        data: {
          quote: q.quote,
          author: q.author,
          school: q.school || null,
          context: q.context || null,
          bookId: q.book_id || null,
          isDailyQuote: Boolean(q.is_daily),
          sharesCount: q.shares_count || 0
        }
      });
    }
    console.log(`   ✓ Đã chuyển ${quotes.length} quotes.`);

    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN ĐỔI THÀNH CÔNG SANG POSTGRES!');
  } catch (err) {
    console.error('❌ Lỗi khi chuyển đổi dữ liệu:', err);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate();
