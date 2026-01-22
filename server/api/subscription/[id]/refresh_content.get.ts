import { db } from "~~/server/db";
import { contentTable, subscriptionTable } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { createInsertSchema } from "drizzle-zod";

type Subscription = typeof subscriptionTable.$inferSelect;
type Content = typeof contentTable.$inferInsert;

export async function execCode(code: string) {
  const context = {
    XMLParser,
    cheerio,
  };
  const func = new Function("context", code);
  return await func(context);
}
async function batchInsertContent(contents: Content[], subId: number) {
  if (!Array.isArray(contents)) {
    throw new Error("contents must be an array");
  }
  const contentInsertSchema = createInsertSchema(contentTable);
  for (const item of contents) {
    item.subscription_id = subId;
    contentInsertSchema.parse(item);
  }
  return db.insert(contentTable).values(contents).onConflictDoNothing().run();
}
async function subscription_refresh_content(sub: Subscription) {
  const code = `return fetch('https://blog.codingnow.com/atom.xml')
.then(r => r.text())
.then(xml => new context.XMLParser({ignoreAttributes : false}).parse(xml))
.then(root => root.feed.entry.map(item => ({
  title: item.title,
  link: item.link['@_href'],
  time: item.published,
  author: item.author.name,
  image: '',
  description: item.summary,
  content: item.content['#text']
})))`;
  // const res = await execCode(sub.code);
  const contents = await execCode(code);
  return batchInsertContent(contents, sub.id);
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "id 不能为空",
    });
  }
  const sub = (
    await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, parseInt(id)))
  ).at(0);
  if (!sub) {
    throw createError({
      statusCode: 404,
      statusMessage: "订阅不存在",
    });
  }
  const { changes } = await subscription_refresh_content(sub);
  return changes;
});

// XML for RSS 2.0
// const code = `return fetch('https://jellyfin.org/index.xml')
// .then(r => r.text())
// .then(xml => new context.XMLParser().parse(xml))
// .then(root => root.rss.channel.item.map(item => ({
//   title: item.title,
//   link: item.link,
//   time: new Date(item.pubDate).toISOString(),
//   author: '',
//   image: '',
//   description: item.description,
//   content: item['content:encoded']
// })))`;

// XML for Feed
// const code = `return fetch('https://blog.codingnow.com/atom.xml')
// .then(r => r.text())
// .then(xml => new context.XMLParser({ignoreAttributes : false}).parse(xml))
// .then(root => root.feed.entry.map(item => ({
//   title: item.title,
//   link: item.link['@_href'],
//   time: item.published,
//   author: item.author.name,
//   image: '',
//   description: item.summary,
//   content: item.content['#text']
// })))`;

// HTML for caixin
// const code = `return context.cheerio.fromURL('https://www.caixin.com/')
// .then($ => $.extract({
//   items: [
//     {
//       selector: '#zyqh dl',
//       value: el => ({
//         title: $(el).find('.wzdf > a').text().trim(),
//         link: $(el).find('a').attr('href'),
//         time: new Date().toISOString(),
//         author: '',
//         image: $(el).find('a > img').attr('src').trim(),
//         description: '',
//         content: ''
//       })
//     }
//   ]
// }).items)`;
