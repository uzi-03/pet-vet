import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
// @ts-expect-error: node-fetch types may not be present until installed
const fetch: any = (...args: any[]) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import db from '@/lib/database';

const BASE_URL = 'https://www.vetlocator.com/search_results.php?radius=10&zip=';

async function getPartneredOffices(): Promise<{ name: string; address: string }[]> {
  return db.prepare('SELECT name, address FROM partnered_vet_offices').all() as any;
}

function isPartnered(office: { name: string, address: string }, partneredList: { name: string, address: string }[]) {
  return partneredList.some(
    p => p.name.trim().toLowerCase() === office.name.trim().toLowerCase() &&
         p.address.trim().toLowerCase() === office.address.trim().toLowerCase()
  );
}

async function scrapeVets(zip: string): Promise<any[]> {
  let results: any[] = [];
  let page = 1;
  let hasNext = true;
  const partneredList = await getPartneredOffices();

  while (hasNext) {
    const url = `${BASE_URL}${zip}${page > 1 ? `&page=${page}` : ''}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // For each vet result row
    $('tr[valign="top"]').each((i, el) => {
      const tds = $(el).find('td.vetText');
      // Name: first td.vetText, remove .distanceText span
      const name = $(tds[0]).clone().children('.distanceText').remove().end().text().replace(/\s+/g, ' ').trim();
      // Detail link: second td.vetText > a
      const detailLink = $(tds[1]).find('a').attr('href');
      // Address: next tr > td[colspan=2] > div.vetText
      let address = '';
      const nextTr = $(el).parent().children().eq($(el).index() + 1);
      if (nextTr.length) {
        address = nextTr.find('div.vetText').text().replace(/\s+/g, ' ').trim();
      }
      if (name && detailLink) {
        const partnered = isPartnered({ name, address }, partneredList);
        results.push({ name, address, detailLink: 'https://www.vetlocator.com/' + detailLink, partnered });
      }
    });

    hasNext = $(`a[title='Next Page']`).length > 0;
    page++;
  }
  return results;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip') || '22192';
  if (!zip.match(/^\d{5}$/)) {
    return NextResponse.json({ error: 'Invalid zipcode' }, { status: 400 });
  }
  try {
    const vets = await scrapeVets(zip);
    return NextResponse.json({ vets });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch vet data', details: String(e) }, { status: 500 });
  }
} 