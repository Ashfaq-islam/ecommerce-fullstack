// app/api/_debug-export/route.js
import * as Products from '@/data/mockProducts';
import * as Categories from '@/data/mockCategories';
import * as Reviews from '@/data/mockReviews';

export async function GET() {
  return Response.json({ Products, Categories, Reviews });
}

