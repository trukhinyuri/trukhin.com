import type { APIRoute } from 'astro';
import { legalPage } from '../lib/legal';

export const GET: APIRoute = ({ site }) =>
  new Response(legalPage('privacy', site ?? new URL('https://trukhin.com')), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
