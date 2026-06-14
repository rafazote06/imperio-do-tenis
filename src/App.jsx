import { useState, useEffect, useCallback } from "react";

const WHATSAPP_NUMBER = "554899940366";

// ── Supabase ──────────────────────────────────────────
const SUPA_URL = "https://epjnpzwtkjibgdyvbwnb.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwam5wend0a2ppYmdkeXZid25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTIyNjIsImV4cCI6MjA5MjQyODI2Mn0.SKvhCXClYLCVo2giuR8KDJ0g4Emi0D-q0pAj92OTCt4";
const SUPA_STORAGE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwam5wend0a2ppYmdkeXZid25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg1MjI2MiwiZXhwIjoyMDkyNDI4MjYyfQ.3fbrAYw8a-U_IsXem3F7n2Jp48Sh5WDgtVYfC52-YXs";

const supaHeaders = {
  "apikey": SUPA_KEY,
  "Authorization": `Bearer ${SUPA_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

const supaFetch = async (path, opts = {}) => {
  const { headers: extraHeaders, ...restOpts } = opts;
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { ...supaHeaders, ...extraHeaders },
    ...restOpts,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("supaFetch error:", res.status, path, err);
    return null;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const supa = {
  from: (table) => ({
    select: (cols = "*", opts = {}) => {
      let url = `${table}?select=${cols}`;
      if (opts.filter) url += `&${opts.filter}`;
      return supaFetch(url);
    },
    insert: (data) => supaFetch(table, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
};

const PIX_DISCOUNT = 0.05;


const BANNERS = [];

const CATEGORIES_DEFAULT = [
  { id:"Todos",    label:"Todos"     },
  { id:"Tenis",    label:"Tenis"     },
  { id:"Camiseta", label:"Camisetas" },
  { id:"Bone",     label:"Bones"     },
  { id:"Blusa",    label:"Blusas"    },
  { id:"Corrente", label:"Correntes" },
  { id:"Relogio",  label:"Relogios"  },
  { id:"Meia",     label:"Meias"     },
  { id:"Chinelo",  label:"Chinelos"  },
  { id:"Perfume",  label:"Perfumes"  },
];

const PRODUCTS_DEFAULT = [];

const ANNOUNCEMENTS = [
  "PIX 5% DE DESCONTO EM TODAS AS COMPRAS",
  "USE O CUPOM: PRIMEIRACOMPRA",
  "ENVIAMOS PARA TODO O BRASIL",
];

const fmt  = (n) => (n != null ? Number(n).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }) : "R$ 0,00");
const pixP = (n) => (n != null ? Number(n) * (1 - PIX_DISCOUNT) : 0);
const disc = (old, cur) => Math.round((1 - cur / old) * 100);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --black:#000000; --dark:#0E0E0E; --card:#181818;
    --gold:#DCB43C; --gold2:#F0C850; --gold3:#A07828;
    --white:#F0F0F0; --cream:#E8E4DC;
    --muted:#666; --border:#252525;
    --pix:#25D366; --red:#C0392B;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--black); color:var(--white); font-family:'Inter',sans-serif; }

  .ann-bar { background:linear-gradient(90deg,#0c0900,#1a1200,#0c0900); border-bottom:1px solid var(--gold3); height:36px; position:relative; overflow:hidden; }
  .ann-item { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; letter-spacing:3px; color:var(--gold); text-transform:uppercase; opacity:0; transition:opacity .5s; }
  .ann-item.visible { opacity:1; }

  .nav { position:sticky; top:0; z-index:100; background:rgba(10,10,10,.97); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); }
  .nav-top { display:flex; align-items:center; justify-content:space-between; padding:0 24px; height:64px; gap:16px; }
  .nav-logo { font-family:'Playfair Display',serif; font-size:17px; color:var(--gold); letter-spacing:1px; display:flex; align-items:center; gap:10px; cursor:pointer; flex-shrink:0; }
  .nav-logo img { width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--gold3); }
  .nav-search { flex:1; max-width:400px; display:flex; background:#111; border:1px solid var(--border); border-radius:999px; overflow:hidden; }
  .nav-search input { flex:1; background:transparent; border:none; outline:none; color:var(--cream); padding:9px 16px; font-size:13px; }
  .nav-search input::placeholder { color:var(--muted); }
  .nav-search-btn { background:var(--gold); border:none; padding:9px 14px; color:var(--black); cursor:pointer; font-size:13px; font-weight:700; }
  .nav-actions { display:flex; align-items:center; gap:12px; }
  .nav-wpp { background:var(--pix); color:#fff; border:none; padding:8px 16px; border-radius:999px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; text-decoration:none; white-space:nowrap; }
  .nav-cart-btn { background:var(--gold); color:var(--black); border:none; border-radius:999px; padding:8px 16px; font-weight:800; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .2s; }
  .nav-cart-btn:hover { background:var(--gold2); }
  .cart-badge { background:var(--black); color:var(--gold); border-radius:999px; padding:1px 7px; font-size:11px; font-weight:800; }
  .nav-pix-strip { background:#0c0900; border-top:1px solid #1a1200; padding:5px 24px; text-align:right; font-size:11px; font-weight:700; color:var(--gold); letter-spacing:2px; text-transform:uppercase; }

  .hero { text-align:center; padding:56px 24px 52px; background:radial-gradient(ellipse at 50% 10%,#110d00 0%,#080600 50%,#000 100%); position:relative; overflow:hidden; }
  .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(220,180,60,.12) 0%,transparent 55%),radial-gradient(ellipse at 50% 100%,rgba(220,180,60,.04) 0%,transparent 60%); pointer-events:none; }
  .hero-logo-circle { display:flex; justify-content:center; margin-bottom:28px; animation:crownFloat 3.5s ease-in-out infinite; }
  .hero-logo-img { width:clamp(200px,55vw,300px); height:clamp(200px,55vw,300px); border-radius:50%; object-fit:cover; object-position:center; box-shadow:0 0 0 2px var(--gold3),0 0 40px rgba(220,180,60,.35),0 0 80px rgba(220,180,60,.15); }
  @keyframes crownFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .hero-tagline { font-size:clamp(10px,2.5vw,13px); letter-spacing:4px; color:var(--gold); font-weight:700; text-transform:uppercase; opacity:.85; margin-bottom:20px; }
  .hero-info { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; }
  .hero-info span { font-size:13px; color:var(--muted); display:flex; align-items:center; gap:6px; }
  .hero-cta { margin-top:28px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .btn-primary { background:var(--gold); color:var(--black); border:none; border-radius:999px; padding:12px 28px; font-size:14px; font-weight:800; cursor:pointer; transition:background .2s; }
  .btn-primary:hover { background:var(--gold2); }
  .btn-outline { background:transparent; color:var(--gold); border:1px solid var(--gold); border-radius:999px; padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:all .2s; display:inline-block; }
  .btn-outline:hover { background:var(--gold); color:var(--black); }

  .section-header { display:flex; align-items:center; justify-content:space-between; padding:36px 24px 16px; }
  .section-title { font-family:'Playfair Display',serif; font-size:22px; color:var(--white); }
  .section-title span { color:var(--gold); }
  .section-link { font-size:13px; color:var(--gold); cursor:pointer; font-weight:600; }
  .section-link:hover { color:var(--gold2); }

  .cat-pills { display:flex; gap:8px; padding:0 24px 28px; overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:wrap; }
  .cat-pills::-webkit-scrollbar { display:none; }
  .cat-pill { flex-shrink:0; background:var(--card); border:1px solid var(--border); border-radius:8px; padding:9px 18px; font-size:13px; font-weight:600; color:var(--muted); cursor:pointer; transition:all .2s; white-space:nowrap; letter-spacing:.3px; }
  .cat-pill:hover { border-color:var(--gold); color:var(--gold); }
  .cat-pill.active { background:#1a1000; border-color:var(--gold); color:var(--gold); font-weight:700; }


  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; padding:0 24px 48px; }

  .card { background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden; cursor:pointer; transition:transform .25s,border-color .25s,box-shadow .25s; position:relative; }
  .card:hover { transform:translateY(-4px); border-color:var(--gold); box-shadow:0 8px 32px rgba(201,168,76,.12); }
  .card-img-wrap { position:relative; }
  .card-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; background:#222; }
  .card-stock-low { position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,.85); color:var(--gold2); font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:.5px; border:1px solid var(--gold3); }
  .card-body { padding:14px; }
  .card-brand { font-size:10px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:2px; margin-bottom:3px; }
  .card-name { font-family:'Playfair Display',serif; font-size:15px; color:var(--white); margin-bottom:8px; line-height:1.3; }
  .card-old-price { font-size:12px; color:var(--muted); text-decoration:line-through; }
  .card-price { font-size:19px; font-weight:800; color:var(--gold); }
  .card-pix { font-size:12px; color:var(--pix); font-weight:700; margin-top:2px; }
  .card-install { font-size:11px; color:var(--muted); margin-top:1px; }
  .sizes-preview { display:flex; gap:5px; flex-wrap:wrap; margin:8px 0; }
  .size-pill { background:#252525; border:1px solid #333; color:var(--muted); padding:2px 7px; border-radius:5px; font-size:11px; font-weight:600; }
  .size-pill.avail { border-color:var(--gold); color:var(--gold); }
  .size-pill.out { opacity:.3; text-decoration:line-through; }
  .card-btn { width:100%; background:var(--gold); border:none; color:var(--black); padding:10px; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; transition:background .2s; letter-spacing:.5px; margin-top:4px; }
  .card-btn:hover { background:var(--gold2); }

  .overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.88); backdrop-filter:blur(8px); display:flex; align-items:flex-end; justify-content:center; }
  .modal { background:var(--dark); border:1px solid var(--border); border-radius:24px 24px 0 0; width:100%; max-width:540px; max-height:92vh; overflow-y:auto; padding:24px 24px 44px; }
  .modal-close { float:right; background:#252525; border:none; color:var(--muted); width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .modal-img { width:100%; border-radius:14px; aspect-ratio:1; object-fit:cover; margin-bottom:18px; }
  .modal-brand { font-size:11px; font-weight:700; color:var(--gold); letter-spacing:2px; text-transform:uppercase; }
  .modal-name { font-family:'Playfair Display',serif; font-size:24px; color:var(--cream); margin:5px 0 12px; }
  .modal-old { font-size:14px; color:var(--muted); text-decoration:line-through; }
  .modal-price { font-size:28px; font-weight:900; color:var(--gold); }
  .modal-pix { font-size:15px; color:var(--pix); font-weight:700; margin-top:3px; }
  .modal-install { font-size:13px; color:var(--muted); margin-top:2px; margin-bottom:4px; }
  .modal-stock-warn { font-size:12px; color:var(--gold2); font-weight:700; margin:10px 0; }
  .modal-desc { font-size:13px; color:var(--muted); margin:14px 0; line-height:1.7; }
  .modal-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
  .sizes-grid { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .size-btn { padding:9px 15px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid #333; background:#1a1a1a; color:var(--cream); transition:all .15s; }
  .size-btn.selected { background:var(--gold); border-color:var(--gold); color:var(--black); font-weight:800; }
  .size-btn.out { opacity:.3; cursor:not-allowed; text-decoration:line-through; }
  .size-btn:not(.out):not(.selected):hover { border-color:var(--gold); }
  .qty-row { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
  .qty-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; }
  .qty-ctrl { display:flex; align-items:center; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
  .qty-btn { background:#222; border:none; color:var(--cream); width:36px; height:36px; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
  .qty-btn:hover { background:var(--gold); color:var(--black); }
  .qty-num { padding:0 14px; font-size:14px; font-weight:700; color:var(--cream); background:#1a1a1a; min-width:40px; text-align:center; line-height:36px; }
  .modal-add { width:100%; padding:15px; background:var(--gold); color:var(--black); border:none; border-radius:12px; font-size:15px; font-weight:800; cursor:pointer; transition:background .2s; letter-spacing:.5px; }
  .modal-add:hover { background:var(--gold2); }
  .modal-add:disabled { opacity:.4; cursor:not-allowed; }

  .mini-popup { position:fixed; top:80px; right:16px; z-index:450; background:var(--dark); border:1px solid var(--gold); border-radius:14px; padding:14px; width:280px; box-shadow:0 8px 32px rgba(0,0,0,.6); animation:popIn .3s ease; }
  @keyframes popIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .mini-popup-added { font-size:11px; color:var(--green2); font-weight:700; text-align:center; margin-bottom:10px; letter-spacing:2px; text-transform:uppercase; }
  .mini-popup-row { display:flex; gap:10px; align-items:center; }
  .mini-popup-row img { width:52px; height:52px; border-radius:8px; object-fit:cover; flex-shrink:0; }
  .mini-popup-name { font-size:13px; font-weight:600; color:var(--cream); margin-bottom:2px; }
  .mini-popup-detail { font-size:11px; color:var(--muted); }
  .mini-popup-price { font-size:14px; font-weight:800; color:var(--gold); margin-top:2px; }
  .mini-popup-btn { width:100%; margin-top:12px; padding:9px; background:var(--gold); border:none; border-radius:8px; color:var(--black); font-size:13px; font-weight:800; cursor:pointer; }

  .cart-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,.8); backdrop-filter:blur(4px); }
  .cart-drawer { position:fixed; right:0; top:0; bottom:0; z-index:301; background:var(--dark); border-left:1px solid var(--border); width:min(400px,100vw); padding:24px 20px; display:flex; flex-direction:column; overflow-y:auto; }
  .cart-title { font-family:'Playfair Display',serif; font-size:20px; color:var(--gold); margin-bottom:16px; }
  .cart-item { display:flex; gap:12px; align-items:flex-start; padding:12px 0; border-bottom:1px solid var(--border); }
  .cart-item-img { width:58px; height:58px; border-radius:8px; object-fit:cover; background:#222; flex-shrink:0; }
  .cart-item-info { flex:1; }
  .cart-item-name { font-size:13px; font-weight:600; color:var(--cream); margin-bottom:2px; }
  .cart-item-size { font-size:11px; color:var(--muted); }
  .cart-item-price { font-size:13px; font-weight:800; color:var(--gold); margin-top:3px; }
  .cart-item-remove { background:none; border:none; color:var(--muted); cursor:pointer; font-size:16px; padding:4px; flex-shrink:0; }
  .cart-item-remove:hover { color:#e55; }
  .cart-empty { text-align:center; color:var(--muted); padding:60px 0; font-size:14px; }
  .cart-summary { margin-top:auto; padding-top:16px; border-top:1px solid var(--border); }
  .cart-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .cart-row-label { font-size:13px; color:var(--muted); }
  .cart-row-val { font-size:13px; color:var(--cream); font-weight:600; }
  .cart-pix-box { background:#0e0b00; border:1px solid var(--gold3); border-radius:8px; padding:10px 14px; margin:10px 0; display:flex; justify-content:space-between; align-items:center; }
  .cart-pix-label { font-size:12px; color:var(--pix); font-weight:700; }
  .cart-pix-val { font-size:17px; color:var(--pix); font-weight:900; }
  .cart-payment-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
  .cart-payment-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
  .cart-pay-btn { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:10px 12px; cursor:pointer; text-align:left; transition:all .2s; display:flex; flex-direction:column; gap:3px; }
  .cart-pay-btn:hover { border-color:var(--gold); }
  .cart-pay-btn.selected { border-color:var(--gold); background:#1a1000; }
  .cart-pay-name { font-size:13px; font-weight:700; color:var(--cream); }
  .cart-pay-desc { font-size:11px; color:var(--muted); }
  .cart-pay-desc.gold { color:var(--pix); font-weight:700; }
  .cart-total-box { background:#1c1c1c; border:1px solid var(--border); border-radius:10px; padding:12px 16px; margin-bottom:14px; display:flex; flex-direction:column; gap:2px; }
  .cart-total-box.pix { background:#0e0b00; border-color:var(--gold3); }
  .cart-total-label { font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px; }
  .cart-total-val { font-size:24px; font-weight:900; color:var(--gold); }
  .cart-total-box.pix .cart-total-val { color:var(--pix); }
  .cart-total-saving { font-size:12px; color:var(--pix); font-weight:700; margin-top:2px; }
  .cart-checkout { width:100%; padding:14px; background:var(--gold); border:none; border-radius:12px; color:var(--black); font-size:15px; font-weight:800; cursor:pointer; margin-bottom:8px; transition:all .2s; letter-spacing:.5px; }
  .cart-checkout:hover:not(:disabled) { background:var(--gold2); }
  .cart-checkout:disabled { background:#2a2a2a; color:var(--muted); cursor:not-allowed; }
  .cart-continue { width:100%; padding:10px; background:transparent; border:1px solid var(--border); border-radius:12px; color:var(--muted); font-size:13px; cursor:pointer; transition:all .2s; }
  .cart-continue:hover { border-color:var(--gold); color:var(--gold); }

  .footer { background:#050500; border-top:1px solid var(--border); margin-top:40px; }
  .footer-top { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:28px; padding:44px 24px 28px; }
  .footer-col h4 { font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:2px; margin-bottom:14px; }
  .footer-col a, .footer-col p { display:block; font-size:13px; color:var(--muted); margin-bottom:7px; text-decoration:none; cursor:pointer; transition:color .2s; line-height:1.6; }
  .footer-col a:hover { color:var(--gold); }
  .footer-bottom { border-top:1px solid var(--border); padding:20px 24px; text-align:center; }
  .footer-payments { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:10px; }
  .pay-badge { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px; padding:4px 10px; font-size:11px; color:var(--muted); font-weight:600; }
  .footer-admin-link { font-size:11px; color:#333; cursor:pointer; text-decoration:underline; margin-top:10px; display:inline-block; }
  .footer-admin-link:hover { color:var(--muted); }
  .footer-copy { font-size:12px; color:#333; margin-top:6px; }

  .admin-modal { position:fixed; inset:0; z-index:400; background:rgba(0,0,0,.92); display:flex; align-items:center; justify-content:center; padding:24px; }
  .admin-box { background:var(--dark); border:1px solid var(--border); border-radius:16px; padding:32px; width:100%; max-width:500px; max-height:90vh; overflow-y:auto; }
  .admin-title { font-family:'Playfair Display',serif; font-size:20px; color:var(--gold); margin-bottom:20px; }
  .form-group { margin-bottom:14px; }
  .form-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block; }
  .form-input { width:100%; background:#111; border:1px solid var(--border); color:var(--cream); padding:10px 14px; border-radius:8px; font-size:13px; outline:none; transition:border-color .2s; }
  .form-input:focus { border-color:var(--gold); }
  .btn-gold { background:var(--gold); color:var(--black); border:none; border-radius:10px; padding:10px 22px; font-size:13px; font-weight:800; cursor:pointer; }
  .btn-gold:hover { background:var(--gold2); }
  .btn-ghost { background:transparent; color:var(--muted); border:1px solid var(--border); border-radius:10px; padding:10px 22px; font-size:13px; cursor:pointer; margin-right:10px; }


  /* BANNER CARROSSEL */
  .banner-wrap {
    position: relative;
    margin: 0 0 8px;
    overflow: hidden;
    border-top: 1px solid #1a1200;
    border-bottom: 1px solid #1a1200;
  }
  .banner-slide {
    display: flex;
    align-items: center;
    min-height: 320px;
    position: relative;
    overflow: hidden;
  }
  .banner-img-col {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0.22;
    filter: grayscale(20%);
  }
  .banner-img-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.6) 50%, rgba(0,0,0,.2) 100%);
  }
  .banner-content {
    position: relative;
    z-index: 2;
    padding: 48px 48px;
    max-width: 560px;
  }
  .banner-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 4px 12px;
    border: 1px solid;
    border-radius: 999px;
    margin-bottom: 16px;
  }
  .banner-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 4vw, 48px);
    font-weight: 900;
    color: var(--white);
    line-height: 1.1;
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }
  .banner-subtitle {
    font-size: clamp(13px, 1.8vw, 16px);
    color: #999;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  .banner-prices {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
  }
  .banner-old {
    font-size: 14px;
    color: #555;
    text-decoration: line-through;
  }
  .banner-price {
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 900;
    color: var(--white);
  }
  .banner-highlight {
    display: inline-block;
    color: #000;
    font-size: 13px;
    font-weight: 900;
    padding: 6px 18px;
    border-radius: 999px;
    letter-spacing: 1px;
  }
  .banner-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: rgba(0,0,0,.6);
    border: 1px solid #333;
    color: var(--white);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .2s;
    line-height: 1;
  }
  .banner-arrow:hover { background: rgba(220,180,60,.2); border-color: var(--gold); color: var(--gold); }
  .banner-prev { left: 16px; }
  .banner-next { right: 16px; }
  .banner-dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 7px;
    z-index: 10;
  }
  .banner-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: none;
    background: #444;
    cursor: pointer;
    transition: all .3s;
    padding: 0;
  }
  .banner-dot.active { width: 22px; border-radius: 999px; }
  .banner-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255,255,255,.08);
    z-index: 10;
  }
  .banner-progress-bar {
    height: 100%;
    width: 0%;
  }
  @keyframes progressBar { from { width: 0% } to { width: 100% } }

  /* Mobile banner */
  @media(max-width:600px) {
    .banner-slide { min-height: 220px; }
    .banner-content { padding: 28px 20px; }
    .banner-arrow { width: 32px; height: 32px; font-size: 18px; }
    .banner-prev { left: 8px; }
    .banner-next { right: 8px; }
  }


  /* CHECKOUT MODAL */
  .checkout-overlay {
    position: fixed; inset: 0; z-index: 350;
    background: rgba(0,0,0,.9); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .checkout-modal {
    background: var(--dark); border: 1px solid #2a2000;
    border-radius: 20px; width: 100%; max-width: 480px;
    max-height: 90vh; overflow-y: auto;
    padding: 32px 28px 40px;
    box-shadow: 0 0 60px rgba(220,180,60,.08);
  }
  .checkout-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px;
  }
  .checkout-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; color: var(--white); font-weight: 900;
  }
  .checkout-close {
    background: none; border: none; color: var(--muted);
    font-size: 22px; cursor: pointer; line-height: 1;
    transition: color .2s;
  }
  .checkout-close:hover { color: var(--white); }
  .checkout-subtitle {
    font-size: 13px; color: var(--muted); margin-bottom: 28px;
    line-height: 1.5;
  }

  /* Resumo do pedido */
  .checkout-summary {
    background: #111; border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;
  }
  .checkout-summary-title {
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;
  }
  .checkout-summary-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid #1e1e1e; font-size: 13px;
  }
  .checkout-summary-item:last-child { border-bottom: none; }
  .checkout-summary-name { color: var(--white); font-weight: 500; }
  .checkout-summary-size { color: var(--muted); font-size: 11px; margin-top: 1px; }
  .checkout-summary-price { color: var(--gold); font-weight: 700; flex-shrink: 0; margin-left: 12px; }
  .checkout-summary-total {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 12px; margin-top: 6px;
  }
  .checkout-summary-total-label { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .checkout-summary-total-val { font-size: 20px; font-weight: 900; color: var(--gold); }

  /* Campos */
  .checkout-section-label {
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 2px;
    margin: 20px 0 12px;
  }
  .checkout-field { margin-bottom: 12px; }
  .checkout-field label {
    display: block; font-size: 11px; font-weight: 600;
    color: var(--muted); margin-bottom: 5px; letter-spacing: .5px;
  }
  .checkout-input {
    width: 100%; background: #111; border: 1px solid var(--border);
    color: var(--white); padding: 11px 14px; border-radius: 10px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color .2s;
  }
  .checkout-input:focus { border-color: var(--gold); }
  .checkout-input.err { border-color: #c0392b; }
  .checkout-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* Entrega */
  .checkout-delivery-opts {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;
  }
  .checkout-delivery-btn {
    padding: 12px 10px; border-radius: 10px; text-align: center;
    border: 1px solid var(--border); background: #111;
    color: var(--muted); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .2s;
  }
  .checkout-delivery-btn.active {
    border-color: var(--gold); background: #1a1200; color: var(--gold);
  }
  .checkout-delivery-icon { font-size: 20px; display: block; margin-bottom: 4px; }

  /* Botao finalizar */
  .checkout-submit {
    width: 100%; padding: 15px; margin-top: 24px;
    background: var(--gold); color: #000;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 900; cursor: pointer;
    transition: background .2s; letter-spacing: .5px;
  }
  .checkout-submit:hover { background: var(--gold2); }
  .checkout-submit:disabled { background: #2a2a2a; color: var(--muted); cursor: not-allowed; }

  .checkout-wpp-note {
    text-align: center; font-size: 12px; color: var(--muted);
    margin-top: 10px; line-height: 1.5;
  }

  @media(max-width:600px) {
    .checkout-modal { padding: 24px 18px 36px; border-radius: 20px 20px 0 0; max-height: 95vh; }
    .checkout-overlay { align-items: flex-end; padding: 0; }
    .checkout-row { grid-template-columns: 1fr; }
    .checkout-delivery-opts { grid-template-columns: 1fr 1fr; }
  }

  /* PIX MODAL */
  .pix-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,.95); backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .pix-modal {
    background: var(--dark); border: 1px solid #2a1f00;
    border-radius: 20px; width: 100%; max-width: 420px;
    padding: 32px 28px 36px;
    box-shadow: 0 0 60px rgba(220,180,60,.12);
    text-align: center;
  }
  .pix-logo {
    width: 56px; height: 56px; border-radius: 50%;
    background: #0d1a0f; border: 2px solid var(--pix);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 26px;
  }
  .pix-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; color: var(--white); margin-bottom: 6px;
  }
  .pix-amount {
    font-size: 32px; font-weight: 900; color: var(--pix);
    margin-bottom: 4px;
  }
  .pix-amount-note { font-size: 12px; color: var(--muted); margin-bottom: 24px; }

  /* Timer */
  .pix-timer-wrap {
    margin-bottom: 24px;
  }
  .pix-timer-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
  .pix-timer {
    font-size: 42px; font-weight: 900; letter-spacing: 4px;
    transition: color .3s;
  }
  .pix-timer.green  { color: var(--pix); }
  .pix-timer.yellow { color: #f0c850; }
  .pix-timer.red    { color: #e53e3e; }
  .pix-timer-bar-wrap {
    height: 4px; background: #1e1e1e; border-radius: 999px;
    margin-top: 10px; overflow: hidden;
  }
  .pix-timer-bar {
    height: 100%; border-radius: 999px;
    transition: width 1s linear, background .3s;
  }
  .pix-expired-msg {
    font-size: 13px; color: #e53e3e; font-weight: 600; margin-bottom: 16px;
  }

  /* Chave Pix */
  .pix-key-box {
    background: #0e0b00; border: 1px solid var(--gold3);
    border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;
    position: relative;
  }
  .pix-key-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
  .pix-key-type  { font-size: 11px; color: var(--gold); margin-bottom: 4px; font-weight: 600; }
  .pix-key-value {
    font-size: 15px; font-weight: 700; color: var(--white);
    letter-spacing: .5px; word-break: break-all;
  }
  .pix-copy-btn {
    position: absolute; top: 12px; right: 12px;
    background: var(--gold); color: #000; border: none;
    border-radius: 6px; padding: 5px 10px;
    font-size: 11px; font-weight: 800; cursor: pointer;
    transition: background .2s;
  }
  .pix-copy-btn:hover { background: var(--gold2); }
  .pix-copy-btn.copied { background: var(--pix); color: #fff; }

  .pix-instructions {
    font-size: 12px; color: var(--muted); line-height: 1.7;
    margin-bottom: 24px; text-align: left;
    background: #111; border-radius: 10px; padding: 12px 14px;
  }
  .pix-instructions li { margin-bottom: 4px; list-style: none; padding-left: 0; }
  .pix-instructions li::before { content: ""; margin-right: 6px; color: var(--gold); }

  .pix-confirm-btn {
    width: 100%; padding: 14px; background: var(--pix);
    border: none; border-radius: 12px; color: #fff;
    font-size: 15px; font-weight: 800; cursor: pointer;
    transition: opacity .2s; margin-bottom: 10px;
  }
  .pix-confirm-btn:hover { opacity: .88; }
  .pix-confirm-btn:disabled { background: #2a2a2a; color: var(--muted); cursor: not-allowed; }
  .pix-cancel-btn {
    width: 100%; padding: 10px; background: transparent;
    border: 1px solid var(--border); border-radius: 12px;
    color: var(--muted); font-size: 13px; cursor: pointer;
    transition: all .2s;
  }
  .pix-cancel-btn:hover { border-color: #e53e3e; color: #e53e3e; }

  @media(max-width:600px) {
    .pix-modal { padding: 24px 18px 30px; }
    .pix-amount { font-size: 28px; }
    .pix-timer { font-size: 36px; }
  }
  /* ── TABLET ── */
  @media(max-width:900px) {
    .grid { grid-template-columns:repeat(3,1fr); }
    .nav-search { max-width:260px; }
  }

  /* ── MOBILE ── */
  @media(max-width:600px) {
    /* navbar */
    .nav-top { padding:0 14px; height:56px; gap:10px; }
    .nav-logo { font-size:14px; }
    .nav-logo img { width:30px; height:30px; }
    .nav-search { display:none; }
    .nav-wpp { display:none; }
    .nav-cart-btn { padding:7px 12px; font-size:12px; }
    .nav-pix-strip { font-size:10px; padding:4px 14px; text-align:center; }

    /* hero */
    .hero { padding:40px 16px 36px; }
    .hero-logo-img { width:160px; height:160px; border-radius:50%; }
    .hero-tagline { font-size:10px; letter-spacing:3px; }
    .hero-info { gap:10px; flex-direction:column; align-items:center; }
    .hero-info span { font-size:12px; }
    .hero-cta { gap:10px; }
    .btn-primary, .btn-outline { padding:11px 22px; font-size:13px; }

    /* categorias */
    .cat-pills { padding:0 14px 20px; gap:6px; }
    .cat-pill { padding:8px 14px; font-size:12px; }

    /* section headers */
    .section-header { padding:24px 14px 12px; }
    .section-title { font-size:18px; }

    /* grid de produtos */
    .grid { grid-template-columns:repeat(2,1fr); gap:10px; padding:0 12px 36px; }
    .card-name { font-size:13px; }
    .card-price { font-size:16px; }
    .card-old-price { font-size:11px; }
    .card-pix { font-size:11px; }
    .card-install { font-size:10px; }
    .card-btn { font-size:12px; padding:9px; }
    .card-body { padding:10px; }

    /* modal de produto */
    .modal { padding:20px 16px 40px; border-radius:20px 20px 0 0; }
    .modal-name { font-size:20px; }
    .modal-price { font-size:24px; }

    /* mini popup */
    .mini-popup { width:calc(100vw - 32px); right:16px; }

    /* carrinho */
    .cart-drawer { padding:20px 16px; }
    .cart-payment-grid { grid-template-columns:1fr 1fr; gap:6px; }
    .cart-pay-name { font-size:12px; }
    .cart-pay-desc { font-size:10px; }

    /* footer */
    .footer-top { grid-template-columns:1fr 1fr; gap:20px; padding:32px 16px 24px; }
    .footer-col h4 { font-size:10px; }
    .footer-col a, .footer-col p { font-size:12px; }
    .footer-bottom { padding:16px; }
    .pay-badge { font-size:10px; padding:3px 8px; }
  }

  /* ── DESKTOP LARGE ── */
  @media(min-width:1200px) {
    .nav-top { padding:0 48px; }
    .hero { padding:80px 48px 72px; }
    .section-header { padding:48px 48px 20px; }
    .cat-pills { padding:0 48px 32px; }
    .grid { padding:0 48px 56px; grid-template-columns:repeat(4,1fr); gap:20px; }
    .brands-strip { padding:0 48px 36px; }
    .footer-top { padding:56px 48px 36px; }
    .footer-bottom { padding:24px 48px; }
  }
`;

function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ann-bar">
      {ANNOUNCEMENTS.map((a,i) => (
        <div key={i} className={"ann-item" + (i===idx?" visible":"")}>{a}</div>
      ))}
    </div>
  );
}

function ProductCard({ product, onOpen }) {
  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card-img-wrap">
        <img className="card-img" src={product.image} alt={product.name} loading="lazy" />
        {product.stock <= 2 && product.stock > 0 && <span className="card-stock-low">Ultimas unidades</span>}
      </div>
      <div className="card-body">
        <div className="card-brand">{product.brand}</div>
        <div className="card-name">{product.name}</div>
        {product.oldPrice > 0 && <div className="card-old-price">{fmt(product.oldPrice)}</div>}
        <div className="card-price">{fmt(product.price)}</div>
        <div className="card-pix">Pix: {fmt(pixP(product.price))}</div>
        <div className="card-install">ou 2x de {fmt(product.price/2)} sem juros</div>
        <div className="sizes-preview">
          {product.sizes.map(s => (
            <span key={s.size} className={"size-pill" + (s.stock>0?" avail":" out")}>{s.size}</span>
          ))}
        </div>
        <button className="card-btn">COMPRAR</button>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onAddCart }) {
  const [selSize, setSelSize] = useState(null);
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    if (!selSize) return;
    for (let i = 0; i < qty; i++) onAddCart({ ...product, selectedSize: selSize });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        <img className="modal-img" src={product.image} alt={product.name} />
        <div className="modal-brand">{product.brand}</div>
        <div className="modal-name">{product.name}</div>
        {product.oldPrice > 0 && <div className="modal-old">{fmt(product.oldPrice)}</div>}
        <div className="modal-price">{fmt(product.price)}</div>
        <div className="modal-pix">No Pix: {fmt(pixP(product.price))} — 5% OFF</div>
        <div className="modal-install">ou 2x de {fmt(product.price/2)} sem juros</div>
        {product.stock <= 3 && <div className="modal-stock-warn">Apenas {product.stock} em estoque</div>}
        <div className="modal-desc">{product.description}</div>
        <div className="modal-label">Tamanho / Variacao</div>
        <div className="sizes-grid">
          {product.sizes.map(s => (
            <button key={s.size}
              className={"size-btn" + (s.stock===0?" out":"") + (selSize===s.size?" selected":"")}
              disabled={s.stock===0}
              onClick={() => setSelSize(s.size)}>
              {s.size}{s.stock===0?" (esgotado)":""}
            </button>
          ))}
        </div>
        <div className="qty-row">
          <span className="qty-label">Quantidade</span>
          <div className="qty-ctrl">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))}>-</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => q+1)}>+</button>
          </div>
        </div>
        <button className="modal-add" disabled={!selSize} onClick={handleAdd}>
          {selSize ? "COMPRAR — " + fmt(product.price * qty) : "Selecione uma opcao"}
        </button>
      </div>
    </div>
  );
}

function MiniPopup({ item, onViewCart, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="mini-popup">
      <div className="mini-popup-added">Adicionado ao carrinho</div>
      <div className="mini-popup-row">
        <img src={item.image} alt={item.name} />
        <div>
          <div className="mini-popup-name">{item.name}</div>
          <div className="mini-popup-detail">{item.selectedSize}</div>
          <div className="mini-popup-price">{fmt(item.price)}</div>
        </div>
      </div>
      <button className="mini-popup-btn" onClick={onViewCart}>Ver carrinho</button>
    </div>
  );
}

const PAYMENT_METHODS = [
  { id:"pix",     label:"Pix",               desc:"5% de desconto",     discount:true  },
  { id:"credito", label:"Cartao de Credito",  desc:"Ate 12x",            discount:false },
  { id:"debito",  label:"Cartao de Debito",   desc:"A vista",            discount:false },
  { id:"dinheiro",label:"Dinheiro",           desc:"Troco se precisar",  discount:false },
];

// Juros por parcela (tabela Price)
const JUROS = { 1:0, 2:0, 3:0.0701, 4:0.0791, 5:0.088, 6:0.0967, 7:0.1259, 8:0.1342, 9:0.1425, 10:0.1506, 11:0.1587, 12:0.1666 };

function CreditoParcelamento({ total, onSelect }) {
  const [parcelas, setParcelas] = useState(1);
  useEffect(()=>{ onSelect && onSelect(1); }, []);
  const calcValor = (n) => {
    const taxa = JUROS[n] || 0;
    return total * (1 + taxa) / n;
  };
  return (
    <div style={{marginTop:10}}>
      <div style={{fontSize:12,color:"var(--white)",fontWeight:700,marginBottom:8}}>Escolha o parcelamento:</div>
      <select
        value={parcelas}
        onChange={e=>{ setParcelas(+e.target.value); onSelect && onSelect(+e.target.value); }}
        style={{width:"100%",background:"#1a1a1a",border:"1px solid var(--gold3)",borderRadius:8,
          color:"var(--cream)",padding:"8px 12px",fontSize:13,cursor:"pointer",outline:"none"}}
      >
        {Object.keys(JUROS).map(n=>(
          <option key={n} value={n}>
            {n}x de {fmt(calcValor(+n))}{+n <= 2 ? " — sem juros" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function CartDrawer({ items, onClose, onCheckout }) {
  const [payment, setPayment] = useState(null);
  const [removingIdx, setRemovingIdx] = useState(null);
  const [localItems, setLocalItems] = useState(items);

  const sub   = localItems.reduce((s,i) => s+i.price, 0);
  const total = payment === "pix" ? pixP(sub) : sub;
  const isPix = payment === "pix";

  const removeItem = (idx) => {
    setRemovingIdx(idx);
    setTimeout(() => {
      setLocalItems(c => c.filter((_,i)=>i!==idx));
      setRemovingIdx(null);
    }, 200);
  };

  const [parcelas, setParcelas_cart] = useState(1);

  const handleCheckout = () => {
    if (!payment) { alert("Selecione a forma de pagamento para continuar."); return; }
    onCheckout(localItems, payment, total, payment === "credito" ? parcelas : null);
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="cart-title" style={{margin:0}}>Carrinho ({localItems.length})</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20}}>x</button>
        </div>

        {localItems.length === 0 ? (
          <div className="cart-empty">Seu carrinho esta vazio.</div>
        ) : (
          localItems.map((item,idx) => (
            <div className="cart-item" key={idx} style={{opacity:removingIdx===idx?0.3:1,transition:"opacity .2s"}}>
              <img className="cart-item-img" src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-size">{item.selectedSize}</div>
                <div className="cart-item-price">{fmt(item.price)}</div>
              </div>
              <button className="cart-item-remove" onClick={() => removeItem(idx)}>x</button>
            </div>
          ))
        )}

        {localItems.length > 0 && (
          <div className="cart-summary">
            <div className="cart-row" style={{marginBottom:16}}>
              <span className="cart-row-label">Subtotal</span>
              <span className="cart-row-val">{fmt(sub)}</span>
            </div>

            <div className="cart-payment-label">Forma de Pagamento</div>
            <div className="cart-payment-grid">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  className={"cart-pay-btn" + (payment===m.id?" selected":"")}
                  onClick={() => setPayment(m.id)}
                >
                  <span className="cart-pay-name">{m.label}</span>
                  <span className={"cart-pay-desc" + (m.discount?" gold":"")}>{m.desc}</span>
                </button>
              ))}
            </div>

            {payment && (
              <div className={"cart-total-box" + (isPix?" pix":"")}>
                <span className="cart-total-label">{isPix ? "Total no Pix" : "Total"}</span>
                <span className="cart-total-val">{fmt(total)}</span>
                {isPix && <span className="cart-total-saving">Voce economiza {fmt(sub - total)}</span>}
                {payment === "credito" && (
                  <CreditoParcelamento total={total} onSelect={setParcelas_cart} />
                )}
              </div>
            )}

            <button className="cart-checkout" onClick={handleCheckout} disabled={!payment}>
              {payment ? "FINALIZAR PEDIDO" : "SELECIONE O PAGAMENTO"}
            </button>
            <button className="cart-continue" onClick={onClose}>Continuar comprando</button>
          </div>
        )}
      </div>
    </>
  );
}


function BannerCarousel({ banners: propBanners }) {
  const list = propBanners && propBanners.length > 0 ? propBanners : BANNERS;
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const total = list.length;

  useEffect(() => { setCurrent(0); }, [list]);
  useEffect(() => {
    if (paused || total === 0) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % total), 4500);
    return () => clearInterval(t);
  }, [paused, total]);

  if (total === 0) return null;
  const prev = () => { setPaused(true); setCurrent(i => (i - 1 + total) % total); };
  const next = () => { setPaused(true); setCurrent(i => (i + 1) % total); };

  const b = list[current];
  if (!b) return null;

  return (
    <div className="banner-wrap" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      <div className="banner-slide" style={{background: b.bg}}>
        {/* Imagem */}
        <div className="banner-img-col">
          <img src={b.image} alt={b.title} className="banner-img" />
          <div className="banner-img-fade" />
        </div>

        {/* Conteudo */}
        <div className="banner-content">
          {b.tag && <span className="banner-tag" style={{borderColor: b.accent||"var(--gold)", color: b.accent||"var(--gold)"}}>{b.tag}</span>}
          <h2 className="banner-title">{b.title}</h2>
          {b.subtitle && <p className="banner-subtitle">{b.subtitle}</p>}
          <div className="banner-prices">
            {b.old_price && <span className="banner-old">{b.old_price}</span>}
            {b.price && <span className="banner-price">{b.price}</span>}
          </div>
          {b.highlight && <div className="banner-highlight" style={{background: b.accent||"var(--gold)"}}>{b.highlight}</div>}
        </div>
      </div>

      {/* Controles */}
      <button className="banner-arrow banner-prev" onClick={prev}>&#8249;</button>
      <button className="banner-arrow banner-next" onClick={next}>&#8250;</button>

      {/* Dots */}
      <div className="banner-dots">
        {list.map((_, i) => (
          <button
            key={i}
            className={"banner-dot" + (i === current ? " active" : "")}
            style={i === current ? {background: b.accent||"var(--gold)"} : {}}
            onClick={() => { setPaused(true); setCurrent(i); }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="banner-progress">
        <div
          className="banner-progress-bar"
          key={current + "-" + paused}
          style={{
            background: b.accent||"var(--gold)",
            animation: paused ? "none" : "progressBar 4.5s linear forwards"
          }}
        />
      </div>
    </div>
  );
}


function CheckoutModal({ items, payment, total, onClose, onConfirm }) {
  const [delivery, setDelivery] = useState("retirada");
  const [form, setForm]         = useState({ name:"", phone:"", cep:"", address:"", neighborhood:"", city:"", state:"", number:"", complement:"", troco:"" });
  const [errors, setErrors]     = useState({});
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError,   setCepError]   = useState("");

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:false})); };

  // Busca CEP automático via ViaCEP
  const fetchCep = async (raw) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    setCepError("");
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP nao encontrado.");
        setForm(f=>({...f, address:"", neighborhood:"", city:"", state:""}));
      } else {
        setForm(f=>({
          ...f,
          address:      data.logradouro  || "",
          neighborhood: data.bairro      || "",
          city:         data.localidade  || "",
          state:        data.uf          || "",
        }));
        setErrors(e=>({...e, address:false, cep:false}));
        // focar no campo numero
        setTimeout(()=>{ document.getElementById("checkout-number")?.focus(); }, 100);
      }
    } catch {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (v) => {
    // Formatar CEP: 00000-000
    const digits = v.replace(/\D/g,"").slice(0,8);
    const fmt_cep = digits.length > 5 ? digits.slice(0,5) + "-" + digits.slice(5) : digits;
    set("cep", fmt_cep);
    if (digits.length === 8) fetchCep(digits);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = true;
    if (!form.phone.trim()) e.phone = true;
    if (delivery === "entrega") {
      if (!form.cep.trim())     e.cep     = true;
      if (!form.address.trim()) e.address = true;
      if (!form.number.trim())  e.number  = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({ form, delivery });
  };

  const isPix    = payment === "pix";
  const payLabels = { pix:"Pix (5% OFF)", credito:"Cartao de Credito (2x sem juros)", debito:"Cartao de Debito", dinheiro:"Dinheiro" };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e=>e.stopPropagation()}>

        <div className="checkout-header">
          <div className="checkout-title">Finalizar Pedido</div>
          <button className="checkout-close" onClick={onClose}>&#x2715;</button>
        </div>
        <p className="checkout-subtitle">
          Preencha seus dados. Voce sera redirecionado para o WhatsApp para confirmar o pedido.
        </p>

        {/* Resumo */}
        <div className="checkout-summary">
          <div className="checkout-summary-title">Resumo do Pedido</div>
          {items.map((item, i) => (
            <div className="checkout-summary-item" key={i}>
              <div>
                <div className="checkout-summary-name">{item.name}</div>
                <div className="checkout-summary-size">Tam. {item.selectedSize}</div>
              </div>
              <div className="checkout-summary-price">{fmt(item.price)}</div>
            </div>
          ))}
          <div className="checkout-summary-total">
            <div>
              <div className="checkout-summary-total-label">{isPix ? "Total no Pix" : "Total"}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{payLabels[payment]}</div>
            </div>
            <div className="checkout-summary-total-val">{fmt(total)}</div>
          </div>
        </div>

        {/* Dados pessoais */}
        <div className="checkout-section-label">Seus Dados</div>
        <div className="checkout-field">
          <label>Nome completo *</label>
          <input className={"checkout-input"+(errors.name?" err":"")} placeholder="Ex: Joao Silva"
            value={form.name} onChange={e=>set("name",e.target.value)} />
        </div>
        <div className="checkout-field">
          <label>WhatsApp *</label>
          <input
            className={"checkout-input"+(errors.phone?" err":"")}
            placeholder="(48) 9 9999-9999"
            value={form.phone}
            inputMode="numeric"
            onChange={e => {
              const digits = e.target.value.replace(/\D/g,"").slice(0,11);
              const fmt = digits.length > 10
                ? `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7)}`
                : digits.length > 6
                ? `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
                : digits;
              set("phone", fmt);
            }}
          />
        </div>

        {/* Troco se dinheiro */}
        {payment === "dinheiro" && (
          <div className="checkout-field">
            <label>Troco para quanto? (opcional)</label>
            <input
              className="checkout-input"
              placeholder="Ex: R$ 100,00"
              value={form.troco}
              onChange={e=>set("troco",e.target.value)}
            />
          </div>
        )}

        {/* Entrega */}
        <div className="checkout-section-label">Forma de Entrega</div>
        <div className="checkout-delivery-opts">
          <button className={"checkout-delivery-btn"+(delivery==="retirada"?" active":"")} onClick={()=>setDelivery("retirada")}>
            <span className="checkout-delivery-icon">&#127978;</span>
            Retirar na loja
          </button>
          <button className={"checkout-delivery-btn"+(delivery==="entrega"?" active":"")} onClick={()=>setDelivery("entrega")}>
            <span className="checkout-delivery-icon">&#128666;</span>
            Entrega
          </button>
        </div>

        {delivery === "retirada" && (
          <div style={{background:"#111",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginTop:10,fontSize:12,color:"var(--muted)",lineHeight:1.7}}>
            📍 Av. das Tipuanas, 710 — Palhoca, SC<br/>
            🕐 Seg–Sex 09h–19h · Sab 09h–15h
          </div>
        )}
        {delivery === "entrega" && (
          <div style={{background:"#0e0b00",border:"1px solid var(--gold3)",borderRadius:10,padding:"10px 14px",marginTop:10,fontSize:12,color:"var(--muted)",lineHeight:1.7}}>
            <div style={{color:"var(--gold)",fontWeight:700,marginBottom:4}}>Informacoes sobre entrega</div>
            Entrega realizada via <strong style={{color:"var(--white)"}}>99 ou Uber</strong> — o valor do frete sera negociado diretamente com voce pelo WhatsApp.<br/>
            <span style={{color:"var(--gold3)"}}>Atendemos Grande Florianopolis, Palhoca e Sao Jose.</span>
          </div>
        )}

        {delivery === "entrega" && (
          <>
            {/* CEP com busca automática */}
            <div style={{marginTop:12}} className="checkout-field">
              <label style={{display:"flex",justifyContent:"space-between"}}>
                <span>CEP *</span>
                <a href="https://buscacepinter.correios.com.br" target="_blank" rel="noreferrer"
                  style={{fontSize:11,color:"var(--gold)",textDecoration:"none"}}>
                  Nao sei meu CEP
                </a>
              </label>
              <div style={{position:"relative"}}>
                <input
                  className={"checkout-input"+(errors.cep?" err":"")}
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={e=>handleCepChange(e.target.value)}
                  maxLength={9}
                />
                {cepLoading && (
                  <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--gold)"}}>
                    Buscando...
                  </div>
                )}
              </div>
              {cepError && <div style={{fontSize:11,color:"#c0392b",marginTop:4}}>{cepError}</div>}
            </div>

            {/* Endereço preenchido automaticamente */}
            <div className="checkout-field">
              <label>Endereco *</label>
              <input
                className={"checkout-input"+(errors.address?" err":"")}
                placeholder="Preenchido automaticamente pelo CEP"
                value={form.address}
                onChange={e=>set("address",e.target.value)}
                style={form.address ? {borderColor:"var(--gold)",background:"#0e0b00"} : {}}
              />
            </div>

            {form.neighborhood || form.city ? (
              <div style={{
                background:"#0e0b00", border:"1px solid var(--gold3)",
                borderRadius:8, padding:"8px 12px", marginBottom:12,
                fontSize:12, color:"var(--muted)", lineHeight:1.6
              }}>
                {[form.neighborhood, form.city, form.state].filter(Boolean).join(", ")}
              </div>
            ) : null}

            <div className="checkout-row">
              <div className="checkout-field">
                <label>Numero *</label>
                <input
                  id="checkout-number"
                  className={"checkout-input"+(errors.number?" err":"")}
                  placeholder="123"
                  value={form.number}
                  onChange={e=>set("number",e.target.value)}
                />
              </div>
              <div className="checkout-field">
                <label>Complemento</label>
                <input className="checkout-input" placeholder="Apto, Bloco..."
                  value={form.complement} onChange={e=>set("complement",e.target.value)} />
              </div>
            </div>
          </>
        )}

        <button className="checkout-submit" onClick={handleConfirm}>
          Confirmar e ir para o WhatsApp
        </button>
        <p className="checkout-wpp-note">
          Voce sera redirecionado para o WhatsApp para confirmar o pedido com a nossa equipe.
        </p>
      </div>
    </div>
  );
}


const PIX_KEY      = "66723668000175";
const PIX_KEY_TYPE = "CNPJ";
const PIX_TIMEOUT  = 5 * 60; // 5 minutos em segundos

function PixModal({ total, orderInfo, onConfirm, onCancel }) {
  const [seconds,  setSeconds]  = useState(PIX_TIMEOUT);
  const [copied,   setCopied]   = useState(false);
  const [expired,  setExpired]  = useState(false);

  // Countdown
  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const mm  = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss  = String(seconds % 60).padStart(2, "0");
  const pct = (seconds / PIX_TIMEOUT) * 100;

  const timerColor = seconds > 120 ? "green" : seconds > 30 ? "yellow" : "red";
  const barColor   = seconds > 120 ? "#25D366" : seconds > 30 ? "#f0c850" : "#e53e3e";

  const copyKey = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleConfirm = () => {
    const msg = [
      "Ola! Acabei de pagar o pedido via Pix.",
      "",
      ...orderInfo.items.map((i,n)=>`${n+1}. ${i.name} (Tam. ${i.selectedSize}) — ${fmt(i.price)}`),
      "",
      `*Nome:* ${orderInfo.form.name}`,
      `*WhatsApp:* ${orderInfo.form.phone}`,
      orderInfo.delivery === "entrega"
        ? `*Entrega:* ${orderInfo.form.address}, ${orderInfo.form.number}${orderInfo.form.complement?" "+orderInfo.form.complement:""}, ${orderInfo.form.neighborhood?orderInfo.form.neighborhood+", ":""}${orderInfo.form.city}${orderInfo.form.state?"/"+orderInfo.form.state:""}, CEP ${orderInfo.form.cep}`
        : `*Entrega:* Retirada na loja`,
      `*Total pago (Pix):* ${fmt(total)}`,
      "",
      "Segue o comprovante em anexo.",
    ].join("%0A");
    // Salvar pedido Pix no banco
    supa.from("pedidos").insert({
      customer_name:  orderInfo.form.name,
      customer_phone: orderInfo.form.phone,
      items:          orderInfo.items,
      total:          total,
      payment:        "pix",
      delivery_type:  orderInfo.delivery,
      cep:            orderInfo.form.cep        || null,
      address:        orderInfo.form.address    || null,
      number:         orderInfo.form.number     || null,
      complement:     orderInfo.form.complement || null,
      neighborhood:   orderInfo.form.neighborhood || null,
      city:           orderInfo.form.city       || null,
      state:          orderInfo.form.state      || null,
      comprovante:    false,
    }).catch(e => console.error("Erro ao salvar pedido Pix:", e));

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    onConfirm();
  };

  return (
    <div className="pix-overlay">
      <div className="pix-modal">

        {/* Logo Pix */}
        <div className="pix-logo">
          <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
            <path d="M392.6 125.5c-18.1 0-35.1 7.1-47.9 19.9l-80.8 80.9c-4.7 4.7-12.3 4.7-17 0l-80.8-80.9c-12.8-12.8-29.8-19.9-47.9-19.9H97.4l116.3 116.3c23.4 23.4 61.5 23.4 84.9 0l116.3-116.3h-22.3z" fill="#32BCAD"/>
            <path d="M118.2 386.5c18.1 0 35.1-7.1 47.9-19.9l80.8-80.9c4.7-4.7 12.3-4.7 17 0l80.8 80.9c12.8 12.8 29.8 19.9 47.9 19.9h18.6L295 270.2c-23.4-23.4-61.5-23.4-84.9 0L93.8 386.5h24.4z" fill="#32BCAD"/>
            <path d="M468.1 198.8l-54.1-54.1h-21.4c-13.3 0-26 5.3-35.4 14.7l-82.5 82.5c-10.4 10.4-27.3 10.4-37.7 0l-82.5-82.5c-9.4-9.4-22.1-14.7-35.4-14.7H97.7l-54.1 54.1c-23.4 23.4-23.4 61.5 0 84.9l54.1 54.1h21.9c13.3 0 26-5.3 35.4-14.7l82.5-82.5c10.4-10.4 27.3-10.4 37.7 0l82.5 82.5c9.4 9.4 22.1 14.7 35.4 14.7h21.9l54.1-54.1c23.4-23.4 23.4-61.5 0-84.9z" fill="#32BCAD"/>
          </svg>
        </div>

        <div className="pix-title">Pague com Pix</div>
        <div className="pix-amount">{fmt(total)}</div>
        <div className="pix-amount-note">5% de desconto ja aplicado</div>

        {/* Timer */}
        <div className="pix-timer-wrap">
          <div className="pix-timer-label">Tempo para pagamento</div>
          {expired ? (
            <div className="pix-expired-msg">Tempo expirado. Cancele e tente novamente.</div>
          ) : (
            <>
              <div className={"pix-timer " + timerColor}>{mm}:{ss}</div>
              <div className="pix-timer-bar-wrap">
                <div className="pix-timer-bar" style={{width: pct + "%", background: barColor}} />
              </div>
            </>
          )}
        </div>

        {/* Chave Pix */}
        <div className="pix-key-box">
          <div className="pix-key-label">Chave Pix</div>
          <div className="pix-key-type">{PIX_KEY_TYPE}</div>
          <div className="pix-key-value">{PIX_KEY}</div>
          <button className={"pix-copy-btn" + (copied?" copied":"")} onClick={copyKey}>
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        {/* Instruções */}
        <ul className="pix-instructions">
          <li>1. Abra o app do seu banco</li>
          <li>2. Acesse a area de Pix e escolha "Pagar"</li>
          <li>3. Cole ou copie a chave CNPJ acima</li>
          <li>4. Confirme o valor de {fmt(total)}</li>
          <li>5. Clique em "Ja paguei" e envie o comprovante</li>
        </ul>

        <button className="pix-confirm-btn" disabled={expired} onClick={handleConfirm}>
          Ja paguei — Enviar comprovante pelo WhatsApp
        </button>
        <button className="pix-cancel-btn" onClick={onCancel}>
          Cancelar
        </button>

      </div>
    </div>
  );
}

function AdminLogin({ onLogin, onClose }) {
  const [pw, setPw] = useState("");
  const handle = () => { if(pw==="imperio2024") onLogin(); else alert("Senha incorreta"); };
  return (
    <div className="admin-modal">
      <div className="admin-box">
        <div className="admin-title">Acesso Admin</div>
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input type="password" className="form-input" value={pw}
            onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
            placeholder="..." autoFocus />
        </div>
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-gold" onClick={handle}>Entrar</button>
      </div>
    </div>
  );
}

function AdminPanel({ onClose, categories = CATEGORIES_DEFAULT }) {
  const [tab,         setTab]        = useState("produtos"); // produtos | banners | pedidos
  const [products,    setProducts]   = useState([]);
  const [pedidos,     setPedidos]    = useState([]);
  const [bannerList,  setBannerList] = useState([]);
  const [catList,     setCatList]     = useState([]);
  const [newCatId,    setNewCatId]    = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [editing,     setEditing]    = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [sizes,       setSizes]      = useState([{ size:"", stock:"" }]);
  const [form,        setForm]       = useState({});
  const [bannerForm,  setBannerForm] = useState({});
  const [saving,      setSaving]     = useState(false);
  const [loading,     setLoading]    = useState(true);
  const [msg,         setMsg]        = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  const showMsg = (t) => { setMsg(t); setTimeout(()=>setMsg(""), 3000); };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    if (tab === "pedidos")    loadPedidos();
    if (tab === "banners")    loadBanners();
    if (tab === "categorias") loadCategorias();
  }, [tab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("produtos?select=*");
      setProducts(Array.isArray(data) ? data : []);
    } catch(e) { showMsg("Erro ao carregar produtos"); }
    setLoading(false);
  };

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("pedidos?select=id,customer_name,customer_phone,items,total,payment,delivery_type,address,number,city,state,status,comprovante");
      setPedidos(Array.isArray(data) ? data : []);
    } catch(e) { showMsg("Erro ao carregar pedidos"); }
    setLoading(false);
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("banners?select=*&order=ordem.asc");
      setBannerList(Array.isArray(data) ? data : []);
    } catch(e) { showMsg("Erro ao carregar banners"); }
    setLoading(false);
  };

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("categorias?select=*&order=ordem.asc");
      setCatList(Array.isArray(data) ? data : []);
    } catch(e) { showMsg("Erro ao carregar categorias"); }
    setLoading(false);
  };

  const addCategoria = async () => {
    if (!newCatId.trim() || !newCatLabel.trim()) { showMsg("Preencha ID e nome"); return; }
    await fetch(`${SUPA_URL}/rest/v1/categorias`, {
      method: "POST",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ id: newCatId.trim(), label: newCatLabel.trim(), ordem: catList.length + 1 }),
    });
    setNewCatId(""); setNewCatLabel("");
    showMsg("Categoria criada!");
    await loadCategorias();
  };

  const deleteCategoria = async (id) => {
    if (!window.confirm(`Remover categoria "${id}"? Os produtos desta categoria ficarao sem categoria.`)) return;
    await fetch(`${SUPA_URL}/rest/v1/categorias?id=eq.${id}`, {
      method: "DELETE",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` },
    });
    showMsg("Categoria removida!");
    await loadCategorias();
  };

  const openNewBanner = () => {
    setEditingBanner("new");
    setBannerForm({ tag:"", title:"", subtitle:"", price:"", old_price:"", highlight:"", image:"", ordem:0, ativo:true });
  };

  const saveBanner = async () => {
    if (!bannerForm.title) { showMsg("Preencha o titulo do banner"); return; }
    setSaving(true);
    try {
      const payload = {
        tag:       bannerForm.tag      || "",
        title:     bannerForm.title,
        subtitle:  bannerForm.subtitle || "",
        price:     bannerForm.price    || "",
        old_price: bannerForm.old_price|| "",
        highlight: bannerForm.highlight|| "",
        image:     bannerForm.image    || "",
        ordem:     +bannerForm.ordem   || 0,
        ativo:     bannerForm.ativo !== false,
      };
      if (editingBanner === "new") {
        await supa.from("banners").insert(payload);
        showMsg("Banner criado!");
      } else {
        await fetch(`${SUPA_URL}/rest/v1/banners?id=eq.${editingBanner}`, {
          method: "PATCH",
          headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showMsg("Banner atualizado!");
      }
      setEditingBanner(null);
      await loadBanners();
    } catch(e) { showMsg("Erro ao salvar banner"); }
    setSaving(false);
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Remover banner?")) return;
    await fetch(`${SUPA_URL}/rest/v1/banners?id=eq.${id}`, {
      method: "DELETE",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` },
    });
    showMsg("Banner removido");
    await loadBanners();
  };

  const toggleBanner = async (id, ativo) => {
    await fetch(`${SUPA_URL}/rest/v1/banners?id=eq.${id}`, {
      method: "PATCH",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });
    setBannerList(b => b.map(x => x.id===id ? {...x, ativo} : x));
  };

  // Upload de imagem para o Supabase Storage
  const uploadImage = async (file, bucket = "produtos") => {
    const ext      = file.name.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const res = await fetch(`${SUPA_URL}/storage/v1/object/${bucket}/${filename}`, {
      method: "POST",
      headers: {
        "apikey":        SUPA_STORAGE,
        "Authorization": `Bearer ${SUPA_STORAGE}`,
        "Content-Type":  file.type,
        "x-upsert":      "true",
      },
      body: file,
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Upload error:", res.status, err);
      throw new Error("Erro no upload: " + res.status);
    }
    return `${SUPA_URL}/storage/v1/object/public/${bucket}/${filename}`;
  };

  const handleImageUpload = async (e, bucket = "produtos") => {
    const file = e.target.files[0];
    if (!file) return;
    showMsg("Enviando imagem...");
    try {
      const url = await uploadImage(file, bucket);
      setForm(f => ({ ...f, image: url }));
      showMsg("Imagem enviada!");
    } catch { showMsg("Erro ao enviar imagem. Crie o bucket no Supabase Storage."); }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showMsg("Enviando imagem...");
    try {
      const url = await uploadImage(file, "banners");
      setBannerForm(f => ({ ...f, image: url }));
      showMsg("Imagem enviada!");
    } catch { showMsg("Erro ao enviar imagem."); }
  };

  const openNew = () => {
    setEditing("new");
    setForm({ name:"", brand:"", cat:"Tenis", description:"", price:"", old_price:"", stock:"", image:"", ativo:true });
    setSizes([{ size:"", stock:"" }]);
  };

  const openEdit = async (p) => {
    setEditing(p.id);
    setForm({ ...p, old_price: p.old_price||"" });
    // Carregar tamanhos
    try {
      const data = await supaFetch(`produto_tamanhos?select=size,stock&produto_id=eq.${p.id}`);
      setSizes(Array.isArray(data) && data.length > 0 ? data : [{ size:"", stock:"" }]);
    } catch { setSizes([{ size:"", stock:"" }]); }
  };

  const save = async () => {
    if (!form.name || !form.price || !form.cat) { showMsg("Preencha nome, preco e categoria"); return; }
    setSaving(true);
    try {
      const payload = {
        cat: form.cat, name: form.name, brand: form.brand||"",
        description: form.description||"", price: +form.price,
        old_price: form.old_price ? +form.old_price : null,
        stock: +form.stock||0, image: form.image||"", ativo: true,
      };

      if (editing === "new") {
        const res = await supaFetch("produtos", {
          method: "POST",
          headers: { "Prefer": "return=representation" },
          body: JSON.stringify(payload),
        });
        const novo = Array.isArray(res) ? res[0] : (res && res.id ? res : null);
        console.log("Produto criado:", novo);
        if (novo && novo.id) {
          const validSizes = sizes.filter(s => s.size && s.size.trim());
          for (const s of validSizes) {
            await fetch(`${SUPA_URL}/rest/v1/produto_tamanhos`, {
              method: "POST",
              headers: {
                "apikey": SUPA_KEY,
                "Authorization": `Bearer ${SUPA_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
              },
              body: JSON.stringify({ produto_id: novo.id, size: s.size.trim(), stock: +s.stock||0 }),
            });
          }
        }
        showMsg("Produto criado!");
      } else {
        await fetch(`${SUPA_URL}/rest/v1/produtos?id=eq.${editing}`, {
          method: "PATCH",
          headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Deletar tamanhos antigos e reinserir
        await fetch(`${SUPA_URL}/rest/v1/produto_tamanhos?produto_id=eq.${editing}`, {
          method: "DELETE",
          headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` },
        });
        const validSizes = sizes.filter(s => s.size && s.size.trim());
        for (const s of validSizes) {
          await fetch(`${SUPA_URL}/rest/v1/produto_tamanhos`, {
            method: "POST",
            headers: {
              "apikey": SUPA_KEY,
              "Authorization": `Bearer ${SUPA_KEY}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({ produto_id: editing, size: s.size.trim(), stock: +s.stock||0 }),
          });
        }
        showMsg("Produto atualizado!");
      }
      setEditing(null);
      await loadProducts();
    } catch(e) { showMsg("Erro ao salvar: " + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm("Remover produto?")) return;
    await fetch(`${SUPA_URL}/rest/v1/produtos?id=eq.${id}`, {
      method: "DELETE",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` },
    });
    showMsg("Produto removido");
    await loadProducts();
  };

  const STATUS_COLORS = { pendente:"#f0c850", confirmado:"#25D366", enviado:"#4a9eff", entregue:"#888", cancelado:"#e55" };
  const STATUS_OPTS   = ["pendente","confirmado","enviado","entregue","cancelado"];

  const updateStatus = async (id, status) => {
    await fetch(`${SUPA_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: "PATCH",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPedidos(p => p.map(x => x.id===id ? {...x, status} : x));
  };

  return (
    <div className="admin-modal">
      <div className="admin-box" style={{maxWidth:600}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="admin-title" style={{margin:0}}>Painel Admin</div>
          <button className="btn-ghost" onClick={onClose}>Fechar</button>
        </div>

        {/* Msg de feedback */}
        {msg && <div style={{background:"#1a1200",border:"1px solid var(--gold)",borderRadius:8,padding:"8px 14px",fontSize:13,color:"var(--gold)",marginBottom:12,textAlign:"center"}}>{msg}</div>}

        {/* Tabs */}
        {!editing && !editingBanner && (
          <div style={{display:"flex",gap:6,marginBottom:20}}>
            {[
              {id:"produtos", label:`Produtos (${products.length})`},
              {id:"banners",     label:`Banners (${bannerList.length})`},
              {id:"categorias",  label:`Categorias`},
              {id:"pedidos",     label:`Pedidos (${pedidos.length})`},
            ].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{flex:1,padding:"8px 4px",borderRadius:8,border:"1px solid",
                  borderColor:tab===t.id?"var(--gold)":"var(--border)",
                  background:tab===t.id?"#1a1200":"transparent",
                  color:tab===t.id?"var(--gold)":"var(--muted)",
                  fontWeight:700,fontSize:12,cursor:"pointer"}}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── FORM PRODUTO ── */}
        {editing && !editingBanner && (
          <>
            <div style={{fontSize:15,color:"var(--gold)",fontFamily:"Playfair Display,serif",marginBottom:16}}>
              {editing==="new" ? "Novo Produto" : "Editar Produto"}
            </div>

{/* Imagem com upload */}
            <div className="form-group">
              <label className="form-label">Foto do Produto</label>
              <label style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:10, background:"#111", border:"2px dashed var(--border)",
                borderRadius:10, padding:"14px", cursor:"pointer",
                transition:"border-color .2s", marginBottom:0,
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
              >
                <input type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload} />
                {form.image
                  ? <img src={form.image} alt="" style={{width:60,height:60,borderRadius:8,objectFit:"cover"}} />
                  : <div style={{fontSize:28,color:"var(--muted)"}}>+</div>
                }
                <div>
                  <div style={{fontSize:13,color:"var(--white)",fontWeight:600}}>
                    {form.image ? "Trocar foto" : "Clique para escolher foto"}
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>JPG, PNG ou WEBP</div>
                </div>
              </label>
            </div>

            {[
              {k:"name",        l:"Nome *"},
              {k:"brand",       l:"Marca"},
              {k:"description", l:"Descricao"},
            ].map(({k,l})=>(
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                {k==="description"
                  ? <textarea className="form-input" rows={2} style={{resize:"vertical"}} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} />
                  : <input className="form-input" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} />
                }
              </div>
            ))}

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{k:"price",l:"Preco *"},{k:"old_price",l:"Preco antigo"},{k:"stock",l:"Estoque"}].map(({k,l})=>(
                <div className="form-group" key={k}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" type="number" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-input" value={form.cat||"Tenis"} onChange={e=>setForm({...form,cat:e.target.value})}>
                {categories.filter(c=>c.id!=="Todos").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {/* Tamanhos */}
            <div style={{marginBottom:14}}>
              <label className="form-label" style={{marginBottom:8,display:"block"}}>Tamanhos / Variacoes</label>
              {sizes.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                  <input className="form-input" placeholder="Ex: 40 ou P ou 100ml"
                    value={s.size} style={{flex:2}}
                    onChange={e=>setSizes(sz=>sz.map((x,j)=>j===i?{...x,size:e.target.value}:x))} />
                  <input className="form-input" placeholder="Qtd" type="number"
                    value={s.stock} style={{flex:1}}
                    onChange={e=>setSizes(sz=>sz.map((x,j)=>j===i?{...x,stock:e.target.value}:x))} />
                  {sizes.length > 1 &&
                    <button onClick={()=>setSizes(sz=>sz.filter((_,j)=>j!==i))}
                      style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:18,flexShrink:0}}>x</button>
                  }
                </div>
              ))}
              <button onClick={()=>setSizes(s=>[...s,{size:"",stock:""}])}
                style={{background:"none",border:"1px dashed var(--border)",borderRadius:8,color:"var(--muted)",padding:"6px 14px",cursor:"pointer",fontSize:12,width:"100%"}}>
                + Adicionar tamanho
              </button>
            </div>

            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setEditing(null)}>Cancelar</button>
              <button className="btn-gold" style={{flex:2}} disabled={saving} onClick={save}>
                {saving ? "Salvando..." : "Salvar Produto"}
              </button>
            </div>
          </>
        )}

        {/* ── LISTA PRODUTOS ── */}
        {!editing && !editingBanner && tab==="produtos" && (
          <>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button className="btn-gold" style={{flex:1}} onClick={openNew}>+ Novo Produto</button>
              <button className="btn-ghost" style={{padding:"10px"}} onClick={loadProducts}>↻</button>
            </div>
            <input
              className="form-input"
              placeholder="Buscar produto..."
              style={{marginBottom:12}}
              value={adminSearch||""}
              onChange={e=>setAdminSearch(e.target.value)}
            />
            {loading ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>Carregando...</div>
            ) : products.length === 0 ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>
                Nenhum produto cadastrado.<br/>Clique em "+ Novo Produto" para comecar.
              </div>
            ) : products.filter(p => !adminSearch || p.name.toLowerCase().includes(adminSearch.toLowerCase()) || (p.brand||"").toLowerCase().includes(adminSearch.toLowerCase())).map(p=>(
              <div key={p.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <img src={p.image||"https://via.placeholder.com/42"} alt={p.name}
                  style={{width:46,height:46,borderRadius:8,objectFit:"cover",flexShrink:0}} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"var(--white)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:11,color:"var(--gold)"}}>{fmt(p.price)} · {p.cat}</div>
                </div>
                <button className="btn-ghost" style={{padding:"5px 10px",fontSize:11,flexShrink:0}} onClick={()=>openEdit(p)}>Editar</button>
                <button style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:16,flexShrink:0}} onClick={()=>del(p.id)}>x</button>
              </div>
            ))}
          </>
        )}

        {/* ── FORM BANNER ── */}
        {editingBanner && (
          <>
            <div style={{fontSize:15,color:"var(--gold)",fontFamily:"Playfair Display,serif",marginBottom:16}}>
              {editingBanner==="new" ? "Novo Banner" : "Editar Banner"}
            </div>

{[
              {k:"title",    l:"Titulo *",        ph:"Ex: Nike Air Force 1"},
              {k:"tag",      l:"Tag (topo)",      ph:"Ex: Oferta Especial"},
              {k:"subtitle", l:"Subtitulo",       ph:"Ex: O classico que nunca sai de moda"},
              {k:"__upload__", l:"", ph:""},
              {k:"price",    l:"Preco",           ph:"Ex: R$ 599,90"},
              {k:"old_price",l:"Preco antigo",    ph:"Ex: R$ 749,90"},
              {k:"highlight",l:"Destaque (badge)",ph:"Ex: 20% OFF"},
            ].map(({k,l,ph})=>(
              k === "__upload__" ? (
                <div className="form-group" key={k}>
                  <label className="form-label">Imagem do Banner</label>
                  <label style={{
                    display:"flex", alignItems:"center", justifyContent:"center",
                    gap:10, background:"#111", border:"2px dashed var(--border)",
                    borderRadius:10, padding:"14px", cursor:"pointer",
                  }}>
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={handleBannerImageUpload} />
                    {bannerForm.image
                      ? <img src={bannerForm.image} alt="" style={{width:60,height:60,borderRadius:8,objectFit:"cover"}} />
                      : <div style={{fontSize:28,color:"var(--muted)"}}>+</div>
                    }
                    <div>
                      <div style={{fontSize:13,color:"var(--white)",fontWeight:600}}>
                        {bannerForm.image ? "Trocar imagem" : "Clique para escolher imagem"}
                      </div>
                      <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>JPG, PNG ou WEBP</div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="form-group" key={k}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" placeholder={ph} value={bannerForm[k]||""}
                    onChange={e=>setBannerForm(f=>({...f,[k]:e.target.value}))} />
                </div>
              )
            ))}

            <div className="form-group">
              <label className="form-label">Ordem de exibicao</label>
              <input className="form-input" type="number" value={bannerForm.ordem||0}
                onChange={e=>setBannerForm(f=>({...f,ordem:e.target.value}))} />
            </div>

            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setEditingBanner(null)}>Cancelar</button>
              <button className="btn-gold" style={{flex:2}} disabled={saving} onClick={saveBanner}>
                {saving ? "Salvando..." : "Salvar Banner"}
              </button>
            </div>
          </>
        )}

        {/* ── LISTA BANNERS ── */}
        {!editing && !editingBanner && tab==="banners" && (
          <>
            <button className="btn-gold" style={{width:"100%",marginBottom:16}} onClick={openNewBanner}>+ Novo Banner</button>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
              Os banners aparecem no carrossel da pagina inicial. Use "Ordem" para definir a sequencia.
            </div>
            {loading ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>Carregando...</div>
            ) : bannerList.length === 0 ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>
                Nenhum banner cadastrado.
              </div>
            ) : bannerList.map(b=>(
              <div key={b.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                {b.image
                  ? <img src={b.image} alt={b.title} style={{width:60,height:40,borderRadius:6,objectFit:"cover",flexShrink:0}} />
                  : <div style={{width:60,height:40,borderRadius:6,background:"#222",flexShrink:0}} />
                }
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"var(--white)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.title}</div>
                  <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                    {b.highlight && <span style={{fontSize:10,background:"var(--red)",color:"#fff",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{b.highlight}</span>}
                    {b.price    && <span style={{fontSize:10,color:"var(--gold)",fontWeight:600}}>{b.price}</span>}
                    <span style={{fontSize:10,color:b.ativo?"var(--pix)":"#e55",fontWeight:600}}>{b.ativo?"Ativo":"Inativo"}</span>
                  </div>
                </div>
                <button onClick={()=>toggleBanner(b.id,!b.ativo)}
                  style={{background:"none",border:`1px solid ${b.ativo?"#e55":"var(--pix)"}`,borderRadius:6,
                    color:b.ativo?"#e55":"var(--pix)",padding:"3px 8px",fontSize:10,cursor:"pointer",fontWeight:700,flexShrink:0}}>
                  {b.ativo?"Desativar":"Ativar"}
                </button>
                <button className="btn-ghost" style={{padding:"3px 8px",fontSize:11,flexShrink:0}} onClick={()=>{setEditingBanner(b.id);setBannerForm(b);}}>Editar</button>
                <button style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:16,flexShrink:0}} onClick={()=>deleteBanner(b.id)}>x</button>
              </div>
            ))}
          </>
        )}

        {/* ── CATEGORIAS ── */}
        {!editing && !editingBanner && tab==="categorias" && (
          <>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
              Gerencie as categorias da loja. Remover uma categoria nao apaga os produtos dela.
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <input className="form-input" placeholder="ID (ex: Tenis)" value={newCatId} onChange={e=>setNewCatId(e.target.value)} style={{flex:1}} />
              <input className="form-input" placeholder="Nome exibido" value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} style={{flex:1}} />
              <button className="btn-gold" style={{padding:"10px 14px",flexShrink:0}} onClick={addCategoria}>+</button>
            </div>
            {loading ? (
              <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>Carregando...</div>
            ) : catList.length === 0 ? (
              <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>Nenhuma categoria.</div>
            ) : catList.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontSize:13,color:"var(--white)",fontWeight:600}}>{c.label}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>ID: {c.id} · ordem: {c.ordem}</div>
                </div>
                <button style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:16}} onClick={()=>deleteCategoria(c.id)}>x</button>
              </div>
            ))}
          </>
        )}

        {/* ── LISTA PEDIDOS ── */}
        {!editing && !editingBanner && tab==="pedidos" && (
          <>
            <button className="btn-ghost" style={{width:"100%",marginBottom:12,fontSize:12}} onClick={loadPedidos}>Atualizar</button>
            {loading ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>Carregando...</div>
            ) : pedidos.length === 0 ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--muted)",fontSize:13}}>Nenhum pedido ainda.</div>
            ) : pedidos.map(p=>(
              <div key={p.id} style={{background:"#111",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--white)"}}>{p.customer_name||"—"}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{p.customer_phone||"—"}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:900,color:"var(--gold)"}}>{fmt(p.total)}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{p.payment}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>
                  {p.delivery_type==="retirada" ? "Retirada na loja" : `${p.address||""}, ${p.number||""} — ${p.city||""}/${p.state||""}`}
                </div>
                {Array.isArray(p.items) && p.items.map((item,i)=>(
                  <div key={i} style={{fontSize:11,color:"#666",marginBottom:2}}>• {item.name} (Tam. {item.selectedSize||item.size}) — {fmt(item.price)}</div>
                ))}
                <div style={{marginTop:10}}>
                  <select
                    value={p.status||"pendente"}
                    onChange={e=>updateStatus(p.id,e.target.value)}
                    style={{background:"#1a1a1a",border:`1px solid ${STATUS_COLORS[p.status]||"#444"}`,borderRadius:6,
                      color:STATUS_COLORS[p.status]||"var(--muted)",padding:"4px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                    {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}

export default function App() {
  const [category,  setCategory]  = useState("Todos");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [cart,      setCart]      = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [adminMode,     setAdminMode]     = useState(null);
  const [checkoutData,  setCheckoutData]  = useState(null);
  const [pixData,       setPixData]       = useState(null);

  // Dados do Supabase
  const [products,   setProducts]   = useState(PRODUCTS_DEFAULT);
  const [categories, setCategories] = useState(CATEGORIES_DEFAULT);
  const [banners,    setBanners]    = useState(BANNERS);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const prods = await supaFetch("produtos?select=id,cat,name,brand,description,price,old_price,stock,image&ativo=eq.true");
        const sizes = await supaFetch("produto_tamanhos?select=produto_id,size,stock");
        const bans  = await supaFetch("banners?select=*&order=ordem.asc");
        const cats  = await supaFetch("categorias?select=id,label,ordem&order=ordem.asc");

        const prodsFull = (Array.isArray(prods) ? prods : []).map(p => ({
          ...p,
          price:    Number(p.price)     || 0,
          oldPrice: Number(p.old_price) || 0,
          stock:    Number(p.stock)     || 0,
          isNew: false,
          sizes: (Array.isArray(sizes) ? sizes : [])
            .filter(s => s.produto_id === p.id)
            .map(s => ({ size: s.size, stock: Number(s.stock) || 0 })),
        }));

        if (prodsFull.length > 0) setProducts(prodsFull);
        if (Array.isArray(bans) && bans.length > 0) setBanners(bans);
        if (Array.isArray(cats) && cats.length > 0)
          setCategories([{ id:"Todos", label:"Todos" }, ...cats]);
      } catch(e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const LOGO_SRC = "data:image/png;base64,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";

  const filtered = products.filter(p => {
    const matchCat = category === "Todos" || p.cat === category;
    const q = search.toLowerCase();
    return matchCat && (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  });

  const addToCart = useCallback((item) => {
    setCart(c => [...c, item]);
    setLastAdded(item);
  }, []);

  const checkout = (items, payment, total, parcelas) => {
    setCheckoutData({ items, payment, total, parcelas });
    setCartOpen(false);
  };

  const confirmOrder = ({ form, delivery, parcelas }) => {
    const { items, payment, total } = checkoutData;

    if (payment === "pix") {
      setPixData({ items, total, form, delivery });
      setCheckoutData(null);
      return;
    }

    const lines    = items.map((i,n)=>`${n+1}. ${i.name} (Tam. ${i.selectedSize}) — ${fmt(i.price)}`).join("%0A");
    const taxa = JUROS[checkoutData.parcelas||1]||0;
    const totalCredito = total * (1 + taxa);
    const valorParcela = totalCredito / (checkoutData.parcelas||1);
    const parcelasLabel = checkoutData.parcelas > 1
      ? `${checkoutData.parcelas}x de ${fmt(valorParcela)}${checkoutData.parcelas<=2?" (sem juros)":" com juros"} — total ${fmt(totalCredito)}`
      : `1x de ${fmt(total)} (a vista)`;
    const payLabel = payment === "credito"
      ? `Cartao de Credito — ${parcelasLabel}`
      : { debito:"Cartao de Debito", dinheiro:"Dinheiro" }[payment] || payment;
    const entrega  = delivery === "retirada"
      ? "Retirada na loja"
      : `Entrega — ${form.address}, ${form.number}${form.complement ? " " + form.complement : ""}, ${form.neighborhood ? form.neighborhood + ", " : ""}${form.city}${form.state ? "/" + form.state : ""}, CEP ${form.cep}`;
    const msg = [
      "Ola! Gostaria de finalizar meu pedido:",
      "",
      lines,
      "",
      `*Nome:* ${form.name}`,
      `*WhatsApp:* ${form.phone}`,
      `*Entrega:* ${entrega}`,
      `*Pagamento:* ${payLabel}${form.troco ? " — Troco para " + form.troco : ""}`,
      `*Total: ${fmt(total)}*`,
    ].join("%0A");
    // Salvar pedido no banco
    supa.from("pedidos").insert({
      customer_name:  form.name,
      customer_phone: form.phone,
      items:          items,
      total:          total,
      payment:        payment,
      delivery_type:  delivery,
      cep:            form.cep        || null,
      address:        form.address    || null,
      number:         form.number     || null,
      complement:     form.complement || null,
      neighborhood:   form.neighborhood || null,
      city:           form.city       || null,
      state:          form.state      || null,
    }).catch(e => console.error("Erro ao salvar pedido:", e));

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setCart([]);
    setCheckoutData(null);
  };

  const closePixAndReset = () => { setPixData(null); setCart([]); };

  return (
    <>
      <style>{css}</style>

      <AnnouncementBar />

      <nav className="nav">
        <div className="nav-top">
          <div className="nav-logo" onClick={()=>{setCategory("Todos");setSearch("");}}>
            <img src={LOGO_SRC} alt="Logo" />
            Imperio do Tenis
          </div>
          <div className="nav-search">
            <input placeholder="🔍 Buscar produto, marca..." value={search} onChange={e=>setSearch(e.target.value)} />
            <button className="nav-search-btn">Buscar</button>
          </div>
          <div className="nav-actions">
            <a className="nav-wpp" href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noreferrer">
              💬 WhatsApp
            </a>
            <button className="nav-cart-btn" onClick={()=>setCartOpen(true)}>
              Carrinho {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </div>
        </div>
        <div className="nav-pix-strip">PIX 5% DE DESCONTO — PAGUE NO PIX E ECONOMIZE</div>
      </nav>

      <section className="hero">
        <div className="hero-logo-circle">
          <img src={LOGO_SRC} className="hero-logo-img" alt="Imperio do Tenis" />
        </div>
        <p className="hero-tagline">A MELHOR LOJA DE PALHOCA</p>
        <div className="hero-info">
          <span>🕐 Seg–Sex 09h–19h · Sab 09h–15h</span>
          <span>📍 Av. das Tipuanas, 710 — Palhoca</span>
          <span>Enviamos para todo o Brasil</span>
        </div>
        <div className="hero-cta">
          <button className="btn-primary" onClick={()=>document.getElementById("produtos")?.scrollIntoView({behavior:"smooth"})}>
            Ver Produtos
          </button>
          <a className="btn-outline" href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noreferrer">
            💬 Falar no WhatsApp
          </a>
        </div>
      </section>

      {/* BANNERS DE PROMOCAO */}
      <BannerCarousel banners={banners} />

      <div className="section-header">
        <h2 className="section-title">Nossas <span>Categorias</span></h2>
      </div>
      <div className="cat-pills">
        {categories.map(c => (
          <button key={c.id} className={"cat-pill" + (category===c.id?" active":"")} onClick={()=>{setCategory(c.id);setSearch("");}}>
            {c.label}
          </button>
        ))}
      </div>

      <div id="produtos">
        <div className="section-header">
          <h2 className="section-title">
            {category==="Todos" ? <span>Todos os <span style={{color:"var(--gold)"}}>Produtos</span></span> : <span style={{color:"var(--gold)"}}>{categories.find(c=>c.id===category)?.label || category}</span>}
            <span style={{fontSize:13,color:"var(--muted)",fontFamily:"Inter,sans-serif",fontWeight:400,marginLeft:10}}>
              ({filtered.length} {filtered.length===1?"produto":"produtos"})
            </span>
          </h2>
          {category!=="Todos" && <span className="section-link" onClick={()=>setCategory("Todos")}>Ver todos</span>}
        </div>
        <div className="grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} onOpen={setSelected} />)}
          {loading && (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"var(--muted)"}}>
              <div style={{fontSize:14,letterSpacing:2}}>Carregando produtos...</div>
            </div>
          )}
          {!loading && filtered.length===0 && (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"var(--muted)"}}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>

      {selected && <ProductModal product={selected} onClose={()=>setSelected(null)} onAddCart={addToCart} />}
      {checkoutData && <CheckoutModal items={checkoutData.items} payment={checkoutData.payment} total={checkoutData.total} onClose={()=>setCheckoutData(null)} onConfirm={confirmOrder} />}
      {pixData && <PixModal total={pixData.total} orderInfo={pixData} onConfirm={closePixAndReset} onCancel={()=>setPixData(null)} />}
      {lastAdded && !cartOpen && <MiniPopup item={lastAdded} onViewCart={()=>{setCartOpen(true);setLastAdded(null);}} onClose={()=>setLastAdded(null)} />}
      {cartOpen && <CartDrawer items={cart} onClose={()=>setCartOpen(false)} onCheckout={checkout} />}

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Categorias</h4>
            {categories.filter(c=>c.id!=="Todos").map(c=>(
              <a key={c.id} onClick={()=>{setCategory(c.id);window.scrollTo({top:0,behavior:"smooth"});}}>{c.label}</a>
            ))}
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <a href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noreferrer">💬 WhatsApp</a>
            <p>📍 Av. das Tipuanas, 710 — Palhoca, SC</p>
            <p>🕐 Seg–Sex 09h–19h · Sab 09h–15h</p>
            <p>contato@imperiotenis.com.br</p>
          </div>
          <div className="footer-col">
            <h4>Entregas</h4>
            <p>Enviamos para todo o Brasil</p>
            <p>Correios PAC e SEDEX</p>
            <p>Retirada na loja</p>
            <p style={{marginTop:12,fontSize:11,color:"#3a3a3a"}}>Site 100% Seguro</p>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-payments">
            {["Pix","Cartao Credito","Debito","Dinheiro"].map(p=>(
              <span key={p} className="pay-badge">{p}</span>
            ))}
          </div>
          <span className="footer-admin-link" onClick={()=>setAdminMode("login")}>Area administrativa</span>
          <div className="footer-copy">2024 Imperio do Tenis — Todos os direitos reservados — Palhoca, SC</div>
        </div>
      </footer>

      {adminMode==="login" && <AdminLogin onLogin={()=>setAdminMode("panel")} onClose={()=>setAdminMode(null)} />}
      {adminMode==="panel" && <AdminPanel onClose={()=>setAdminMode(null)} categories={categories} />}
    </>
  );
}
