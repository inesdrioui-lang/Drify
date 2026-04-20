'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

const LISTINGS = [
  { id:1, title:"T3 briques roses — Capitole", type:"apartment", city:"Capitole", lat:43.604, lng:1.444, price:850, charges:60, surface:65, rooms:3, bedrooms:2, furnished:false, dpe:"C", badge:"Location", img:"#EDE5DA" },
  { id:2, title:"Studio meublé — Saint-Cyprien", type:"studio", city:"Saint-Cyprien", lat:43.599, lng:1.432, price:520, charges:40, surface:26, rooms:1, bedrooms:0, furnished:true, dpe:"D", badge:"Location", img:"#E8DDD0" },
  { id:3, title:"T3 lumineux — Carmes", type:"apartment", city:"Carmes", lat:43.599, lng:1.445, price:780, charges:55, surface:62, rooms:3, bedrooms:2, furnished:false, dpe:"B", badge:"Location", img:"#F0E8DE" },
  { id:4, title:"Loft rénové — Saint-Étienne", type:"loft", city:"Saint-Étienne", lat:43.601, lng:1.449, price:1100, charges:80, surface:85, rooms:4, bedrooms:2, furnished:true, dpe:"C", badge:"Location", img:"#E5DCD2" },
  { id:5, title:"Studio calme — Rangueil", type:"studio", city:"Rangueil", lat:43.570, lng:1.459, price:430, charges:35, surface:22, rooms:1, bedrooms:0, furnished:true, dpe:"E", badge:"Location", img:"#EDE2D4" },
  { id:6, title:"Maison avec jardin — Lardenne", type:"house", city:"Lardenne", lat:43.603, lng:1.388, price:1350, charges:0, surface:110, rooms:5, bedrooms:4, furnished:false, dpe:"C", badge:"Location", img:"#E9E0D5" },
  { id:7, title:"T2 rénové — Jean Jaurès", type:"apartment", city:"Jean Jaurès", lat:43.606, lng:1.452, price:620, charges:45, surface:42, rooms:2, bedrooms:1, furnished:false, dpe:"D", badge:"Location", img:"#F2EAE0" },
  { id:8, title:"Chambre meublée — Arnaud Bernard", type:"room", city:"Arnaud Bernard", lat:43.609, lng:1.443, price:380, charges:30, surface:14, rooms:1, bedrooms:1, furnished:true, dpe:"F", badge:"Location", img:"#E8DDD0" },
  { id:9, title:"T4 familial — Côte Pavée", type:"apartment", city:"Côte Pavée", lat:43.591, lng:1.470, price:1050, charges:90, surface:88, rooms:4, bedrooms:3, furnished:false, dpe:"B", badge:"Location", img:"#EDE5DA" },
  { id:10, title:"T3 terrasse — Compans", type:"apartment", city:"Compans-Caffarelli", lat:43.611, lng:1.437, price:890, charges:70, surface:70, rooms:3, bedrooms:2, furnished:true, dpe:"A", badge:"Location", img:"#E5DDD5" },
  { id:11, title:"Studio étudiant — Mirail", type:"studio", city:"Mirail", lat:43.579, lng:1.399, price:390, charges:30, surface:20, rooms:1, bedrooms:0, furnished:true, dpe:"C", badge:"Location", img:"#F0E8DE" },
  { id:12, title:"T3 calme — Minimes", type:"apartment", city:"Minimes", lat:43.614, lng:1.455, price:730, charges:50, surface:58, rooms:3, bedrooms:2, furnished:false, dpe:"D", badge:"Location", img:"#EAE0D5" },
  { id:16, title:"Parking couvert — Capitole", type:"parking", city:"Capitole", lat:43.603, lng:1.443, price:80, charges:0, surface:12, rooms:0, bedrooms:0, furnished:false, dpe:"C", badge:"Location", img:"#E8E2DA" },
  { id:17, title:"Garage fermé — Saint-Cyprien", type:"garage", city:"Saint-Cyprien", lat:43.598, lng:1.430, price:120, charges:0, surface:18, rooms:0, bedrooms:0, furnished:false, dpe:"D", badge:"Location", img:"#E5DDD5" },
  { id:18, title:"Colocation T4 — Jean Jaurès", type:"apartment", city:"Jean Jaurès", lat:43.607, lng:1.453, price:450, charges:40, surface:88, rooms:4, bedrooms:3, furnished:true, colocation:true, dpe:"C", badge:"Location", img:"#EDE5DA" },
  { id:19, title:"Colocation meublée — Compans", type:"apartment", city:"Compans-Caffarelli", lat:43.612, lng:1.436, price:380, charges:30, surface:72, rooms:3, bedrooms:2, furnished:true, colocation:true, dpe:"B", badge:"Location", img:"#F0E8DE" },
  { id:13, title:"Appartement T4 — Côte Pavée", type:"apartment", city:"Côte Pavée", lat:43.590, lng:1.468, price:295000, charges:0, surface:92, rooms:4, bedrooms:3, furnished:false, dpe:"C", badge:"Vente", img:"#EDE5DA" },
  { id:14, title:"Maison 5 pièces — Lardenne", type:"house", city:"Lardenne", lat:43.604, lng:1.390, price:420000, charges:0, surface:130, rooms:5, bedrooms:4, furnished:false, dpe:"B", badge:"Vente", img:"#E9E0D5" },
  { id:15, title:"Studio investissement — Jean Jaurès", type:"studio", city:"Jean Jaurès", lat:43.607, lng:1.451, price:98000, charges:0, surface:24, rooms:1, bedrooms:0, furnished:true, dpe:"D", badge:"Vente", img:"#F2EAE0" },
] as const

type Listing = typeof LISTINGS[number] & { colocation?: boolean }

const DPE_LETTERS = ['A','B','C','D','E','F','G']
const DPE_CLASSES: Record<string,string> = { A:'dpe-a', B:'dpe-b', C:'dpe-c', D:'dpe-d', E:'dpe-e', F:'dpe-f', G:'dpe-g' }

function formatPrice(p: number) { return p.toLocaleString('fr-FR') + ' €' }

function getFavs(): number[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('drify_favorites') || '[]')
}
function setFavs(favs: number[]) {
  localStorage.setItem('drify_favorites', JSON.stringify(favs))
}

import { Suspense } from 'react'

function RechercheContent() {
  const searchParams = useSearchParams()

  const [transactionType, setTransactionType] = useState(searchParams.get('type') || 'rent')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || 'Toulouse')
  const [filterType, setFilterType] = useState('all')
  const [maxPrice, setMaxPrice] = useState(2500)
  const [minSurface, setMinSurface] = useState(0)
  const [minRooms, setMinRooms] = useState(0)
  const [furnished, setFurnished] = useState(false)
  const [colocation, setColocation] = useState(false)
  const [dpeMax, setDpeMax] = useState(5)
  const [sort, setSort] = useState('recent')
  const [view, setView] = useState<'list'|'map'>('list')
  const [filtered, setFiltered] = useState<Listing[]>([])
  const [favs, setFavsState] = useState<number[]>([])
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)

  const isSale = transactionType === 'sale'
  const priceMax = isSale ? 2000000 : 5000
  const priceUnit = isSale ? '€' : '€/mois'
  const defaultPrice = isSale ? 500000 : 2500

  const applyFilters = useCallback((opts?: { transType?: string, fType?: string, mPrice?: number, mSurf?: number, mRooms?: number, furn?: boolean, colo?: boolean, dpe?: number, s?: string }) => {
    const tt = opts?.transType ?? transactionType
    const ft = opts?.fType ?? filterType
    const mp = opts?.mPrice ?? maxPrice
    const ms = opts?.mSurf ?? minSurface
    const mr = opts?.mRooms ?? minRooms
    const fn = opts?.furn ?? furnished
    const co = opts?.colo ?? colocation
    const de = opts?.dpe ?? dpeMax
    const so = opts?.s ?? sort

    let result = (LISTINGS as unknown as Listing[]).filter(l => {
      if (tt === 'rent' && l.badge !== 'Location') return false
      if (tt === 'sale' && l.badge !== 'Vente') return false
      if (ft !== 'all' && l.type !== ft) return false
      if (tt === 'rent' && l.price > mp) return false
      if (l.surface < ms) return false
      if (mr > 0 && l.rooms < mr) return false
      if (fn && !l.furnished) return false
      if (co && !l.colocation) return false
      if (DPE_LETTERS.indexOf(l.dpe) > de) return false
      return true
    })

    result = [...result].sort((a, b) => {
      if (so === 'price_asc') return a.price - b.price
      if (so === 'price_desc') return b.price - a.price
      if (so === 'surface') return b.surface - a.surface
      return b.id - a.id
    })

    setFiltered(result)
  }, [transactionType, filterType, maxPrice, minSurface, minRooms, furnished, colocation, dpeMax, sort])

  useEffect(() => {
    setFavsState(getFavs())
    applyFilters()
  }, [])

  useEffect(() => {
    if (view === 'map' && !leafletMapRef.current) {
      // Load Leaflet dynamically
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setMapReady(true)
      document.head.appendChild(script)
    }
  }, [view])

  useEffect(() => {
    if (view === 'map' && mapReady && mapRef.current && !leafletMapRef.current) {
      const L = (window as any).L
      const m = L.map(mapRef.current, { zoomControl: true }).setView([43.600, 1.444], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(m)
      leafletMapRef.current = m
    }
    if (view === 'map' && leafletMapRef.current) {
      setTimeout(() => leafletMapRef.current.invalidateSize(), 100)
    }
  }, [view, mapReady])

  function toggleFav(id: number, e: React.MouseEvent) {
    e.preventDefault()
    const current = getFavs()
    const idx = current.indexOf(id)
    const next = idx === -1 ? [...current, id] : current.filter(x => x !== id)
    setFavs(next)
    setFavsState(next)
  }

  function handleTransactionChange(val: string) {
    setTransactionType(val)
    setDropdownOpen(false)
    const newPrice = val === 'sale' ? 500000 : 2500
    const newDpe = val === 'sale' ? 6 : 5
    setMaxPrice(newPrice)
    setDpeMax(newDpe)
    setFilterType('all')
    applyFilters({ transType: val, mPrice: newPrice, dpe: newDpe, fType: 'all' })
  }

  function resetFilters() {
    const newPrice = isSale ? 500000 : 2500
    const newDpe = isSale ? 6 : 5
    setFilterType('all')
    setMaxPrice(newPrice)
    setMinSurface(0)
    setMinRooms(0)
    setFurnished(false)
    setColocation(false)
    setDpeMax(newDpe)
    applyFilters({ fType: 'all', mPrice: newPrice, mSurf: 0, mRooms: 0, furn: false, colo: false, dpe: newDpe })
  }

  const pricePct = ((maxPrice - 0) / (priceMax - 0)) * 100
  const surfacePct = (minSurface / 500) * 100
  const dpePct = ((dpeMax - 0) / ((isSale ? 6 : 5) - 0)) * 100

  return (
    <>
      <style>{`
        nav { position:sticky; top:0; z-index:200; height:60px; display:flex; align-items:center; padding:0 32px; background:rgba(253,252,250,0.9); backdrop-filter:blur(20px); border-bottom:1px solid var(--border-soft); }
        .logo { display:flex; align-items:center; gap:9px; text-decoration:none; margin-right:40px; }
        .nav-links { display:flex; align-items:center; gap:2px; flex:1; }
        .nav-links a { text-decoration:none; color:var(--text-muted); font-size:14px; font-weight:500; padding:6px 14px; border-radius:8px; transition:color .15s,background .15s; }
        .nav-links a:hover { color:var(--brown); background:var(--bg-soft); }
        .nav-links a.active { color:var(--brown); font-weight:600; }
        .nav-end { display:flex; gap:8px; flex-shrink:0; }
        .btn-ghost { padding:7px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; color:var(--brown-mid); border:1px solid var(--border); background:transparent; transition:background .15s; font-family:inherit; white-space:nowrap; }
        .btn-ghost:hover { background:var(--bg-soft); }
        .btn-primary { padding:7px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; color:#fff; background:var(--brown); border:none; transition:opacity .15s; font-family:inherit; white-space:nowrap; }
        .btn-primary:hover { opacity:.85; }

        .topbar { padding:16px 32px; border-bottom:1px solid var(--border-soft); display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .search-inline { display:flex; align-items:center; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; flex:1; max-width:560px; box-shadow:0 1px 6px rgba(61,46,34,0.06); position:relative; }
        .type-dropdown { position:relative; min-width:110px; border-right:1px solid var(--border-soft); flex-shrink:0; }
        .type-dropdown-btn { display:flex; align-items:center; justify-content:space-between; padding:0 10px 0 14px; height:40px; width:100%; border:none; background:transparent; font-size:13px; font-weight:600; color:var(--brown); cursor:pointer; outline:none; font-family:inherit; gap:8px; }
        .type-dropdown-menu { display:none; position:absolute; top:calc(100% + 4px); left:0; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:0 4px 16px rgba(61,46,34,0.12); list-style:none; padding:4px; margin:0; min-width:130px; z-index:200; }
        .type-dropdown-menu.open { display:block; }
        .type-dropdown-menu li { padding:8px 14px; font-size:13px; font-weight:600; color:var(--brown); border-radius:6px; cursor:pointer; transition:background .12s; }
        .type-dropdown-menu li:hover { background:var(--bg-soft); }
        .type-dropdown-menu li.active { background:var(--brown); color:#fff; }
        .search-inline input { flex:1; padding:0 14px; height:40px; border:none; outline:none; font-size:13px; color:var(--text); background:transparent; font-family:inherit; }
        .search-inline input::placeholder { color:var(--text-light); }
        .search-inline > button { height:40px; padding:0 18px; background:var(--brown); color:#fff; border:none; font-size:13px; font-weight:600; cursor:pointer; transition:opacity .15s; font-family:inherit; border-radius:0 10px 10px 0; }
        .search-inline > button:hover { opacity:.85; }
        .topbar-right { display:flex; align-items:center; gap:8px; margin-left:auto; }
        .result-count { font-size:13px; color:var(--text-muted); font-weight:500; }
        .sort-select { padding:7px 28px 7px 12px; border:1px solid var(--border); border-radius:8px; font-size:13px; color:var(--text); background:var(--bg-card); appearance:none; cursor:pointer; outline:none; font-family:inherit; }
        .view-toggle { display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
        .view-btn { width:36px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:var(--bg-card); border:none; color:var(--text-muted); transition:background .15s,color .15s; }
        .view-btn.active { background:var(--brown); color:#fff; }
        .view-btn:not(:last-child) { border-right:1px solid var(--border); }

        .page-body { display:flex; height:calc(100vh - 117px); overflow:hidden; }
        .filters-panel { width:272px; flex-shrink:0; border-right:1px solid var(--border-soft); overflow-y:auto; padding:20px; background:var(--bg-card); }
        .filters-panel::-webkit-scrollbar { width:4px; }
        .filters-panel::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

        .filter-group { margin-bottom:24px; }
        .filter-label { font-size:11px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; display:block; }
        .type-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .type-btn { padding:8px 10px; border:1.5px solid var(--border); border-radius:8px; font-size:12px; font-weight:600; color:var(--text-muted); background:var(--bg-card); cursor:pointer; text-align:center; transition:all .15s; font-family:inherit; }
        .type-btn:hover { border-color:var(--brown-light); color:var(--brown); }
        .type-btn.active { border-color:var(--brown); background:var(--brown); color:#fff; }

        .slider-wrap { position:relative; padding:4px 0 20px; }
        .slider-track { position:relative; height:4px; background:var(--border); border-radius:2px; margin:0 4px; }
        .slider-fill { position:absolute; height:100%; background:var(--brown); border-radius:2px; pointer-events:none; }
        input[type=range] { position:absolute; width:calc(100% + 8px); left:-4px; top:-6px; appearance:none; background:transparent; pointer-events:none; height:16px; }
        input[type=range]::-webkit-slider-thumb { appearance:none; width:16px; height:16px; border-radius:50%; background:var(--bg-card); border:2.5px solid var(--brown); pointer-events:all; cursor:pointer; box-shadow:0 1px 4px rgba(61,46,34,0.2); }

        .dpe-a { background:#1a9e3f; color:#333; } .dpe-b { background:#4cb847; color:#333; } .dpe-c { background:#c3d52a; color:#333; }
        .dpe-d { background:#f5e600; color:#333; } .dpe-e { background:#f0a500; color:#333; } .dpe-f { background:#e06b00; color:#333; } .dpe-g { background:#cc0000; color:#333; }
        .dpe-badge { display:inline-flex; align-items:center; justify-content:center; width:28px; height:22px; border-radius:5px; font-size:13px; font-weight:800; margin-bottom:10px; }
        .dpe-ticks { display:flex; justify-content:space-between; margin:8px 4px 0; }
        .dpe-tick { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; font-size:12px; font-weight:800; }

        .price-input-row { display:flex; align-items:baseline; gap:4px; margin-bottom:10px; }
        .price-number-input { width:88px; border:none; border-bottom:1.5px solid var(--border); background:transparent; font-size:13px; font-weight:700; color:var(--brown); font-family:inherit; outline:none; padding:0 2px 1px; }
        .price-number-input:focus { border-bottom-color:var(--brown); }
        .price-unit { font-size:13px; font-weight:700; color:var(--brown); }
        .surface-number-input { width:52px; border:none; border-bottom:1.5px solid var(--border); background:transparent; font-size:13px; font-weight:700; color:var(--brown); font-family:inherit; outline:none; padding:0 2px 1px; -moz-appearance:textfield; }
        .surface-number-input:focus { border-bottom-color:var(--brown); }
        .surface-number-input::-webkit-outer-spin-button, .surface-number-input::-webkit-inner-spin-button { -webkit-appearance:none; }

        .rooms-btns { display:flex; gap:6px; flex-wrap:wrap; }
        .room-btn { padding:6px 12px; border:1.5px solid var(--border); border-radius:20px; font-size:12px; font-weight:600; color:var(--text-muted); background:var(--bg-card); cursor:pointer; transition:all .15s; font-family:inherit; }
        .room-btn:hover { border-color:var(--brown-light); color:var(--brown); }
        .room-btn.active { border-color:var(--brown); background:var(--brown); color:#fff; }

        .toggle-row { display:flex; align-items:center; justify-content:space-between; }
        .toggle-row span { font-size:13px; font-weight:500; color:var(--text); }
        .toggle { width:40px; height:22px; background:var(--border); border-radius:11px; position:relative; cursor:pointer; transition:background .2s; flex-shrink:0; border:none; }
        .toggle.on { background:var(--brown); }
        .toggle::after { content:''; position:absolute; width:16px; height:16px; background:#fff; border-radius:50%; top:3px; left:3px; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
        .toggle.on::after { transform:translateX(18px); }
        .filter-divider { height:1px; background:var(--border-soft); margin:4px 0 24px; }
        .reset-btn { width:100%; padding:9px; border:1px solid var(--border); border-radius:8px; font-size:12px; font-weight:600; color:var(--text-muted); background:transparent; cursor:pointer; transition:all .15s; font-family:inherit; margin-top:4px; }
        .reset-btn:hover { border-color:var(--brown-light); color:var(--brown); background:var(--bg-soft); }

        .results-area { flex:1; overflow-y:auto; padding:20px 24px; }
        .results-area::-webkit-scrollbar { width:4px; }
        .results-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .listings-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

        .card { background:var(--bg-card); border:1px solid var(--border); border-radius:14px; overflow:hidden; text-decoration:none; color:inherit; display:block; transition:transform .2s,box-shadow .2s; }
        .card:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(61,46,34,0.10); }
        .card-img { height:170px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .card-badge { position:absolute; top:10px; left:10px; font-size:10px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; background:var(--brown); color:#fff; padding:3px 8px; border-radius:20px; }
        .card-fav { position:absolute; top:10px; right:10px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.88); border:1px solid rgba(0,0,0,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .card-body { padding:14px 16px; }
        .card-title { font-size:13px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
        .card-loc { display:flex; align-items:center; gap:3px; font-size:12px; color:var(--text-muted); margin-bottom:10px; }
        .card-meta { display:flex; align-items:center; gap:10px; font-size:11px; color:var(--text-muted); padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid var(--border-soft); }
        .card-meta span { display:flex; align-items:center; gap:3px; }
        .card-price strong { font-size:17px; font-weight:800; color:var(--brown); }
        .card-price span { font-size:11px; color:var(--text-muted); margin-left:2px; }

        .map-area { flex:1; position:relative; }
        #map { width:100%; height:100%; }
        .no-results { grid-column:1/-1; text-align:center; padding:64px 24px; color:var(--text-muted); }
        .no-results h3 { font-size:18px; font-weight:700; color:var(--text); margin-bottom:6px; }
        .no-results p { font-size:14px; }

        @media (max-width:1100px) { .listings-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:900px) { .filters-panel { width:240px; } .listings-grid { grid-template-columns:1fr; } }
        @media (max-width:700px) { nav { padding:0 16px; } .nav-links { display:none; } .filters-panel { display:none; } }
      `}</style>

      <nav>
        <Link href="/" className="logo">
          <Image src="/logo.svg" height={32} width={80} style={{width:'auto'}} alt="Drify" />
        </Link>
        <div className="nav-links">
          <Link href="/">Accueil</Link>
          <Link href="/recherche" className="active">Rechercher</Link>
          <Link href="/publier">Publier</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/favoris">Favoris</Link>
        </div>
        <div className="nav-end">
          <Link href="/connexion" className="btn-ghost">Se connecter</Link>
          <Link href="/inscription" className="btn-primary">S&apos;inscrire</Link>
        </div>
      </nav>

      <div className="topbar">
        <div className="search-inline">
          <div className="type-dropdown">
            <button className="type-dropdown-btn" onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}>
              <span>{transactionType === 'sale' ? 'Vente' : 'Location'}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path fill="#5C4433" d="M0 0l5 6 5-6z"/></svg>
            </button>
            <ul className={`type-dropdown-menu${dropdownOpen ? ' open' : ''}`}>
              <li className={transactionType === 'rent' ? 'active' : ''} onClick={() => handleTransactionChange('rent')}>Location</li>
              <li className={transactionType === 'sale' ? 'active' : ''} onClick={() => handleTransactionChange('sale')}>Vente</li>
            </ul>
          </div>
          <input type="text" placeholder="Ville, quartier, code postal…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <button onClick={() => applyFilters()}>Rechercher</button>
        </div>
        <div className="topbar-right">
          <span className="result-count">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          <select className="sort-select" value={sort} onChange={e => { setSort(e.target.value); applyFilters({ s: e.target.value }) }}>
            <option value="recent">Plus récent</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="surface">Surface</option>
          </select>
          <div className="view-toggle">
            <button className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} title="Liste">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button className={`view-btn${view === 'map' ? ' active' : ''}`} onClick={() => setView('map')} title="Carte">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
                <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="page-body" onClick={() => setDropdownOpen(false)}>
        <aside className="filters-panel">
          <div className="filter-group">
            <span className="filter-label">Type de bien</span>
            <div className="type-grid">
              {(['all','apartment','house','studio','loft','room','parking','garage'] as const).map(t => (
                <button key={t} className={`type-btn${filterType === t ? ' active' : ''}`}
                  style={isSale && (t === 'studio' || t === 'room') ? {display:'none'} : {}}
                  onClick={() => { setFilterType(t); applyFilters({ fType: t }) }}>
                  {t === 'all' ? 'Tous' : t === 'apartment' ? 'Appartement' : t === 'house' ? 'Maison' : t === 'studio' ? 'Studio' : t === 'loft' ? 'Loft' : t === 'room' ? 'Chambre' : t === 'parking' ? 'Parking' : 'Garage / Box'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <span className="filter-label">Budget maximum</span>
            <div className="slider-wrap">
              <div className="price-input-row">
                <input type="text" className="price-number-input" value={maxPrice.toLocaleString('fr-FR')}
                  onChange={e => {
                    const raw = parseInt(e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '')) || 0
                    const step = isSale ? 10000 : 50
                    const clamped = Math.min(priceMax, Math.max(0, Math.round(raw / step) * step))
                    setMaxPrice(clamped)
                    applyFilters({ mPrice: clamped })
                  }} />
                <span className="price-unit">{priceUnit}</span>
              </div>
              <div className="slider-track">
                <div className="slider-fill" style={{left:0, right:`${100-pricePct}%`}}></div>
                <input type="range" min={0} max={priceMax} step={isSale ? 10000 : 50} value={maxPrice}
                  onChange={e => { const v = parseInt(e.target.value); setMaxPrice(v); applyFilters({ mPrice: v }) }} />
              </div>
            </div>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <span className="filter-label">Surface minimum</span>
            <div className="slider-wrap">
              <div className="price-input-row">
                <input type="number" className="surface-number-input" min={0} max={500} value={minSurface}
                  onChange={e => { const v = Math.min(500, Math.max(0, parseInt(e.target.value)||0)); setMinSurface(v); applyFilters({ mSurf: v }) }} />
                <span className="price-unit">m²</span>
              </div>
              <div className="slider-track">
                <div className="slider-fill" style={{left:0, right:`${100-surfacePct}%`}}></div>
                <input type="range" min={0} max={500} step={5} value={minSurface}
                  onChange={e => { const v = parseInt(e.target.value); setMinSurface(v); applyFilters({ mSurf: v }) }} />
              </div>
            </div>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <span className="filter-label">Pièces minimum</span>
            <div className="rooms-btns">
              {[0,1,2,3,4,5].map(r => (
                <button key={r} className={`room-btn${minRooms === r ? ' active' : ''}`}
                  onClick={() => { setMinRooms(r); applyFilters({ mRooms: r }) }}>
                  {r === 0 ? 'Tous' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <div className="toggle-row">
              <span>Meublé</span>
              <button className={`toggle${furnished ? ' on' : ''}`} onClick={() => { setFurnished(!furnished); applyFilters({ furn: !furnished }) }}></button>
            </div>
            <div className="toggle-row" style={{marginTop:12}}>
              <span>Colocation</span>
              <button className={`toggle${colocation ? ' on' : ''}`} onClick={() => { setColocation(!colocation); applyFilters({ colo: !colocation }) }}></button>
            </div>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <span className="filter-label">DPE maximum</span>
            <div className="slider-wrap" style={{paddingBottom:4}}>
              <span className={`dpe-badge ${DPE_CLASSES[DPE_LETTERS[dpeMax]]}`}>{DPE_LETTERS[dpeMax]}</span>
              <div className="slider-track">
                <div className="slider-fill" style={{left:0, right:`${100-dpePct}%`}}></div>
                <input type="range" min={0} max={isSale ? 6 : 5} step={1} value={dpeMax}
                  onChange={e => { const v = parseInt(e.target.value); setDpeMax(v); applyFilters({ dpe: v }) }} />
              </div>
              <div className="dpe-ticks">
                {DPE_LETTERS.slice(0, isSale ? 7 : 6).map((l, i) => (
                  <span key={l} className={`dpe-tick ${DPE_CLASSES[l]}`}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-divider"></div>

          <button className="reset-btn" onClick={resetFilters}>Réinitialiser les filtres</button>
        </aside>

        {view === 'list' ? (
          <main className="results-area">
            <div className="listings-grid">
              {filtered.length === 0 ? (
                <div className="no-results">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="1.5" style={{margin:'0 auto 16px',display:'block',opacity:.3}}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <h3>Aucune annonce ne correspond à votre recherche</h3>
                  <p>Modifiez vos filtres pour voir plus d&apos;annonces.</p>
                </div>
              ) : filtered.map(l => (
                <Link key={l.id} href={`/annonce?id=${l.id}`} className="card">
                  <div className="card-img" style={{background:`linear-gradient(135deg, ${l.img} 0%, ${l.img}cc 100%)`}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="0.8" style={{opacity:.6}}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    <span className="card-badge">{l.badge}</span>
                    <div className="card-fav" onClick={(e) => toggleFav(l.id, e)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={favs.includes(l.id) ? '#3D2E22' : 'none'} stroke="#3D2E22" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{l.title}</div>
                    <div className="card-loc">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {l.city}
                    </div>
                    <div className="card-meta">
                      <span>{l.surface} m²</span>
                      <span>{l.rooms} p.</span>
                      {l.furnished && <span>Meublé</span>}
                      <span style={{marginLeft:'auto',padding:'1px 6px',borderRadius:4,fontWeight:700}} className={`dpe-${l.dpe.toLowerCase()}`}>{l.dpe}</span>
                    </div>
                    <div className="card-price">
                      <strong>{formatPrice(l.price)}</strong>
                      {l.badge === 'Location' && <span>/ mois CC</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        ) : (
          <div className="map-area">
            <div id="map" ref={mapRef}></div>
          </div>
        )}
      </div>
    </>
  )
}

export default function RecherchePage() {
  return (
    <Suspense>
      <RechercheContent />
    </Suspense>
  )
}
