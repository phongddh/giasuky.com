/* =====================================================================
   Gia Sử Ký — Frontend (vanilla JS, không build step)
   Mỗi trang là một view mount vào #view-<key>. API: /api/v1/*
   ===================================================================== */
'use strict'

const API = '/api/v1'
const S = { user: null, clan: null, elder: false }

/* ------------------------------- helpers --------------------------- */
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin'
  })
  let data = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const err = new Error((data && (data.detail || data.title)) || `Lỗi ${res.status}`)
    err.status = res.status
    err.problem = data
    throw err
  }
  return data
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

function initials(name) {
  const p = String(name || '?').trim().split(/\s+/)
  return ((p[0] || '')[0] + (p.length > 1 ? (p[p.length - 1] || '')[0] : '')).toUpperCase()
}

function avatar(p, cls = '') {
  const dead = p && (p.is_alive === 0 || p.isAlive === false)
  const url = p && (p.photo_url || p.photoUrl)
  const nm = (p && (p.full_name || p.name)) || '?'
  return url
    ? `<span class="avatar ${cls} ${dead ? 'deceased' : 'living'}"><img src="${esc(url)}" alt="${esc(nm)}"></span>`
    : `<span class="avatar ${cls} ${dead ? 'deceased' : 'living'}">${esc(initials(nm))}</span>`
}

const yr = (d) => (d ? String(d).slice(0, 4) : '?')
function lifespan(p) {
  const b = p.birth_date || p.birthDate
  const d = p.death_date || p.deathDate
  const alive = p.is_alive === 1 || p.isAlive === true
  if (!b && !d) return alive ? 'còn sống' : ''
  return alive ? `${yr(b)} –` : `${yr(b)} – ${yr(d)}`
}

function fmtDate(s) {
  if (!s) return '—'
  const d = new Date(String(s).includes('T') ? s : String(s).replace(' ', 'T') + 'Z')
  if (isNaN(d)) return esc(String(s))
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtDay(s) {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d)) return esc(String(s))
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function toast(msg, kind = 'ok') {
  let host = $('#toast-host')
  if (!host) {
    host = document.createElement('div')
    host.id = 'toast-host'
    host.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none'
    document.body.appendChild(host)
  }
  const t = document.createElement('div')
  const bg = kind === 'err' ? 'var(--danger)' : kind === 'warn' ? 'var(--warn)' : 'var(--sacred)'
  t.style.cssText = `background:${bg};color:#fff;padding:10px 20px;border-radius:999px;font-size:14px;box-shadow:var(--sh-3);border:1px solid rgba(212,175,55,.5);animation:rise .3s var(--ease-ritual)`
  t.textContent = msg
  host.appendChild(t)
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 400) }, 3600)
}

function closeOverlay() { $('#overlay-root').innerHTML = '' }

function modal(html, opts = {}) {
  const root = $('#overlay-root')
  root.innerHTML = `<div class="overlay" data-ov><div class="modal ${opts.wide ? 'wide' : ''}">${html}</div></div>`
  const ov = $('[data-ov]', root)
  ov.addEventListener('click', (e) => { if (e.target === ov) closeOverlay() })
  $$('[data-close]', root).forEach((b) => b.addEventListener('click', closeOverlay))
  return root
}

function drawer(html) {
  const root = $('#overlay-root')
  root.innerHTML = `<div class="overlay" data-ov></div><aside class="drawer">${html}</aside>`
  const ov = $('[data-ov]', root)
  ov.addEventListener('click', closeOverlay)
  $$('[data-close]', root).forEach((b) => b.addEventListener('click', closeOverlay))
  return root
}

function loading(txt = 'Đang tải…') {
  return `<div class="loading-wrap"><span class="spinner"></span> ${esc(txt)}</div>`
}
function empty(icon, txt, extra = '') {
  return `<div class="empty"><div class="ico"><i class="fa-solid ${icon}"></i></div>${esc(txt)}${extra ? `<div class="mt-3">${extra}</div>` : ''}</div>`
}
function errBox(e) {
  return `<div class="alert danger"><b>Không tải được dữ liệu.</b><br>${esc(e.message || e)}</div>`
}

function requireLogin(action = 'thực hiện việc này') {
  if (S.user) return true
  toast(`Cần đăng nhập để ${action}.`, 'warn')
  authModal()
  return false
}

/* --------------------------- auth / elder mode --------------------- */
async function loadMe() {
  try {
    const r = await api('/auth/me')
    S.user = r.user
    S.plan = r.subscription
  } catch { S.user = null }
  renderAuthLabel()
  applyElder(S.user ? !!S.user.elder_mode : localStorage.getItem('gsk_elder') === '1')
}

function renderAuthLabel() {
  const lb = $('#auth-label')
  if (lb) lb.textContent = S.user ? S.user.full_name.split(' ').slice(-1)[0] : 'Đăng nhập'
}

function applyElder(on) {
  S.elder = !!on
  document.body.classList.toggle('elder-mode', S.elder)
  localStorage.setItem('gsk_elder', S.elder ? '1' : '0')
}

async function toggleElder() {
  applyElder(!S.elder)
  toast(S.elder ? 'Đã bật chế độ Ông bà: chữ lớn, ít chuyển động.' : 'Đã tắt chế độ Ông bà.')
  if (S.user) { try { await api('/auth/elder-mode', { method: 'POST', body: { enabled: S.elder } }) } catch {} }
}

function authModal() {
  if (S.user) {
    modal(`
      <div class="card-head"><h2 style="margin:0">Tài khoản</h2><button class="x-btn" data-close>✕</button></div>
      <div class="row"><span class="avatar lg">${esc(initials(S.user.full_name))}</span>
        <div><div style="font-weight:700;font-size:var(--fs-h3)">${esc(S.user.full_name)}</div>
        <small>${esc(S.user.email || '')}</small>
        <div class="mt-2"><span class="badge gold">${esc((S.plan && S.plan.plan) || 'free')}</span>
        ${S.user.clan_role ? `<span class="badge">${esc(S.user.clan_role)}</span>` : ''}</div></div></div>
      <div class="divider"></div>
      <div class="btn-group">
        <a class="btn ghost" href="${API}/auth/export" target="_blank"><i class="fa-solid fa-download"></i> Tải toàn bộ dữ liệu (P6)</a>
        <button class="btn quiet" id="m-elder"><i class="fa-solid fa-glasses"></i> ${S.elder ? 'Tắt' : 'Bật'} chế độ Ông bà</button>
        <button class="btn danger" id="m-logout"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
      </div>
      <div class="help mt-3">Theo nguyên tắc P6 (Chủ quyền dữ liệu), bạn có thể tải về toàn bộ dữ liệu dòng họ dưới dạng JSON bất cứ lúc nào.</div>`)
    $('#m-logout').onclick = async () => { await api('/auth/logout', { method: 'POST' }); location.reload() }
    $('#m-elder').onclick = () => { toggleElder(); closeOverlay() }
    return
  }
  modal(`
    <div class="card-head"><h2 style="margin:0">Vào Gia Sử Ký</h2><button class="x-btn" data-close>✕</button></div>
    <div class="alert"><b>Xem thử nhanh:</b> dùng tài khoản demo của họ Nguyễn (Đông Ngạc) đã có 5 đời, ký ức, gia huấn và bàn thờ.</div>
    <button class="btn gold block" id="m-demo"><i class="fa-solid fa-door-open"></i> Vào bằng tài khoản demo</button>
    <div class="divider"></div>
    <div class="tabs"><button class="tab active" data-t="login">Đăng nhập</button><button class="tab" data-t="reg">Tạo tài khoản</button></div>
    <form id="f-login">
      <div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label>Mật khẩu</label><input name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn block" type="submit">Đăng nhập</button>
    </form>
    <form id="f-reg" class="hide">
      <div class="field"><label>Họ và tên</label><input name="full_name" required></div>
      <div class="field"><label>Email</label><input name="email" type="email" required></div>
      <div class="field"><label>Mật khẩu (tối thiểu 6 ký tự)</label><input name="password" type="password" required></div>
      <button class="btn block" type="submit">Tạo tài khoản</button>
    </form>
    <div id="auth-err" class="mt-3"></div>`)

  $$('[data-t]').forEach((b) => b.onclick = () => {
    $$('[data-t]').forEach((x) => x.classList.toggle('active', x === b))
    $('#f-login').classList.toggle('hide', b.dataset.t !== 'login')
    $('#f-reg').classList.toggle('hide', b.dataset.t !== 'reg')
  })
  $('#m-demo').onclick = async () => {
    try { await api('/auth/demo', { method: 'POST' }); location.reload() }
    catch (e) { $('#auth-err').innerHTML = errBox(e) }
  }
  const submit = (form, path) => {
    form.onsubmit = async (ev) => {
      ev.preventDefault()
      const b = Object.fromEntries(new FormData(form).entries())
      try { await api(path, { method: 'POST', body: b }); location.reload() }
      catch (e) { $('#auth-err').innerHTML = errBox(e) }
    }
  }
  submit($('#f-login'), '/auth/login')
  submit($('#f-reg'), '/auth/register')
}

/* ============================ DASHBOARD ============================ */
async function viewDashboard(host) {
  host.innerHTML = loading('Đang mở gia đường…')
  let d
  try { d = await api('/dashboard') } catch (e) { host.innerHTML = errBox(e); return }

  if (!d.clan) {
    host.innerHTML = empty('fa-torii-gate', 'Bạn chưa thuộc dòng họ nào trong hệ thống.',
      '<button class="btn gold" onclick="window.__auth()">Vào bằng tài khoản demo</button>')
    return
  }
  S.clan = d.clan
  const st = d.stats || {}
  const lt = d.lunarToday || {}

  host.innerHTML = `
    <div class="grid sidebar">
      <div class="col">
        <div class="card">
          <div class="row between">
            <div>
              <h2 style="margin-bottom:2px">${esc(d.clan.name)}</h2>
              <small>Quê gốc: ${esc(d.clan.origin_place || '—')}${d.clan.founded_year ? ` · Khởi lập ${d.clan.founded_year}` : ''}</small>
            </div>
            <a class="btn ghost sm" href="/tree"><i class="fa-solid fa-sitemap"></i> Xem cây</a>
          </div>
          <div class="divider"></div>
          <div class="grid c4">
            ${statBox('Thành viên', st.persons, `${st.living || 0} người còn sống`)}
            ${statBox('Ký ức đã lưu', st.memories, st.pending ? `${st.pending} chờ duyệt` : 'đã duyệt hết')}
            ${statBox('Câu gia huấn', st.advices, 'trong Cuộn Gia Đạo')}
            ${statBox('Đời', st.generations, `${st.events || 0} sự kiện`)}
          </div>
          ${st.contradictions ? `<div class="alert warn mt-4"><b>${st.contradictions} điểm khác nhau giữa các lời kể</b> đang chờ con cháu hỏi thêm — hệ thống không tự phán xét đúng sai. <a href="/memories">Xem đối chiếu →</a></div>` : ''}
        </div>

        <div class="card">
          <div class="card-head"><h3 style="margin:0"><i class="fa-solid fa-moon gold-t"></i> Lịch giỗ sắp tới (âm lịch)</h3></div>
          ${(d.upcomingAnniversaries || []).length ? `<div class="list">${d.upcomingAnniversaries.map((a) => `
            <div class="list-item clickable" data-person="${esc(a.personId)}">
              ${avatar({ full_name: a.name, photo_url: a.photoUrl, is_alive: 0 }, 'sm')}
              <div class="f1">
                <div class="t">${esc(a.name)}</div>
                <div class="d">Giỗ ${esc(a.lunarLabel)} · dương lịch ${fmtDay(a.solarDate)}</div>
              </div>
              <span class="badge ${a.daysUntil <= 7 ? 'red' : 'gold'}">${a.daysUntil === 0 ? 'HÔM NAY' : `còn ${a.daysUntil} ngày`}</span>
            </div>`).join('')}</div>` : empty('fa-moon', 'Chưa có ngày giỗ nào được ghi theo lịch âm.')}
        </div>

        <div class="card">
          <div class="card-head"><h3 style="margin:0"><i class="fa-solid fa-book-open red-t"></i> Ký ức mới được lưu</h3>
            <a class="btn ghost sm" style="margin-left:auto" href="/memories">Tất cả ký ức</a></div>
          ${(d.recentMemories || []).length ? `<div class="list">${d.recentMemories.map((m) => `
            <div class="list-item">
              <span class="badge ${m.type === 'AUDIO' ? 'gold' : ''}">${esc(m.type)}</span>
              <div class="f1">
                <div class="t clamp3" style="font-weight:400">${esc(m.content)}</div>
                <div class="d">${m.subject_name ? esc(m.subject_name) + ' · ' : ''}${esc(m.perspective || '')} · ${fmtDate(m.created_at)}</div>
              </div>
            </div>`).join('')}</div>` : empty('fa-book-open', 'Chưa có ký ức nào. Hãy mở buổi phỏng vấn AI đầu tiên.')}
        </div>
      </div>

      <div class="col">
        <div class="card dark">
          <div class="fkey">HÔM NAY</div>
          <div style="font-family:var(--f-display);font-size:26px;color:var(--secondary);line-height:1.3">
            ${esc(lt.label || `${lt.day}/${lt.month}`)}
          </div>
          <small>Ngày ${lt.day} tháng ${lt.month}${lt.leap ? ' (nhuận)' : ''} âm lịch · năm ${esc(lt.canChi || '')}</small>
          <div class="divider" style="background:#40312d"></div>
          <a class="btn on-dark block" href="/rituals"><i class="fa-solid fa-calendar-day"></i> Lịch nghi lễ của họ</a>
        </div>

        <div class="card">
          <div class="card-head"><h3 style="margin:0"><i class="fa-solid fa-fire gold-t"></i> Bàn thờ</h3></div>
          ${(d.altars || []).length ? (d.altars || []).map((a) => `
            <a class="btn ghost block mb-2" href="/altar?altar=${esc(a.id)}">${esc(a.name)}</a>`).join('')
            : empty('fa-fire', 'Chưa lập bàn thờ số.')}
        </div>

        <div class="card">
          <div class="card-head"><h3 style="margin:0"><i class="fa-solid fa-people-group red-t"></i> Buổi lễ sắp tới</h3></div>
          ${(d.rituals || []).length ? `<div class="list">${d.rituals.map((r) => `
            <div class="list-item"><div class="f1"><div class="t">${esc(r.title)}</div>
            <div class="d">${fmtDate(r.scheduled_at)}${r.lunar_day ? ` · ${r.lunar_day}/${r.lunar_month} ÂL` : ''}</div></div>
            <a class="btn sm ghost" href="/rituals?ritual=${esc(r.id)}">Vào</a></div>`).join('')}</div>`
            : empty('fa-people-group', 'Chưa có buổi lễ nào được hẹn.')}
        </div>

        <div class="card paper">
          <div class="fkey">NGUYÊN TẮC P1</div>
          <div style="font-family:var(--f-display);font-size:var(--fs-h3);color:#6d1010">Tôn kính trước tiện lợi</div>
          <small>Không có huy hiệu, chuỗi ngày, hay điểm thưởng gắn vào việc thắp nhang. Nghi lễ không phải trò chơi.</small>
        </div>
      </div>
    </div>`

  $$('[data-person]', host).forEach((el) => el.onclick = () => openPerson(el.dataset.person))
}

function statBox(k, v, n) {
  return `<div class="stat"><div class="k">${esc(k)}</div><div class="v">${v ?? 0}</div><div class="n">${esc(n || '')}</div></div>`
}

/* ======================= F3 — LIVING TREE ========================== */
const TREE = { nodes: [], edges: [], scale: 1, tx: 0, ty: 0, pos: {}, w: 0, h: 0 }

async function viewTree(host) {
  host.innerHTML = loading('Đang dựng cây gia phả…')
  let clanId = new URLSearchParams(location.search).get('clan')
  try {
    if (!clanId) {
      const cl = await api('/clans')
      const list = cl.clans || []
      if (!list.length) { host.innerHTML = empty('fa-sitemap', 'Chưa có dòng họ nào trong hệ thống.'); return }
      clanId = (S.user && S.user.clan_id) || list[0].id
    }
    const t = await api(`/clans/${clanId}/tree?depth=12`)
    TREE.nodes = t.nodes || []
    TREE.edges = t.edges || []
  } catch (e) { host.innerHTML = errBox(e); return }

  if (!TREE.nodes.length) { host.innerHTML = empty('fa-sitemap', 'Dòng họ này chưa có thành viên nào.'); return }

  host.innerHTML = `
    <div class="tree-wrap" id="tree-wrap">
      <div class="tree-toolbar">
        <div class="tree-search">
          <input id="tree-q" type="search" placeholder="Tìm tên, tên hiệu, quê…" autocomplete="off">
          <div id="tree-res" class="tree-results hide"></div>
        </div>
        <span class="badge dark">${TREE.nodes.length} người · ${Math.max(...TREE.nodes.map((n) => n.generation || 0)) + 1} đời</span>
        <div class="zoom-ctl">
          <button id="z-out" title="Thu nhỏ">−</button>
          <button id="z-in" title="Phóng to">+</button>
          <button id="z-fit" class="wide" title="Vừa khung">Vừa khung</button>
        </div>
      </div>
      <svg id="tree-svg"></svg>
      <div class="tree-legend">
        <div class="legend-row"><span class="legend-dot living"></span> Lá xanh — người còn sống</div>
        <div class="legend-row"><span class="legend-dot deceased"></span> Lá vàng — người đã mất</div>
        <div class="legend-row"><span class="legend-line"></span> Nét đứt — nhánh chưa xác minh</div>
        <div class="legend-row" style="color:#a2907c">Bấm vào lá để mở hồ sơ người đó</div>
      </div>
      <div id="tip" class="node-tip"></div>
    </div>
    <div class="grid c3 mt-4">
      <div class="card tight"><div class="fkey">LOD 4.3.3</div><small>Ở mức thu nhỏ chỉ hiện lá và tên; phóng to mới hiện năm sinh–mất, số ký ức và biểu tượng persona.</small></div>
      <div class="card tight"><div class="fkey">KHÔNG SUY DIỄN</div><small>Quan hệ chưa được xác minh luôn vẽ nét đứt. Hệ thống không bao giờ tự nối hai người vì “trùng tên”.</small></div>
      <div class="card tight"><div class="fkey">GHI CHÚ KỸ THUẬT</div><small>Truy vấn phả hệ dùng recursive CTE trên D1 thay cho <code>CHILD_OF*1..n</code> của Neo4j trong đặc tả.</small></div>
    </div>`

  layoutTree()
  drawTree()
  bindTreeEvents()
}

function layoutTree() {
  const byGen = {}
  const gens = {}
  TREE.nodes.forEach((n) => { gens[n.generation || 0] = true })
  const genList = Object.keys(gens).map(Number).sort((a, b) => a - b)

  // sắp xếp trong mỗi đời: cha mẹ gần nhau, vợ chồng cạnh nhau
  const childOf = {}
  TREE.edges.filter((e) => e.type === 'CHILD_OF' || e.type === 'ADOPTED_BY')
    .forEach((e) => { (childOf[e.to] ||= []).push(e.from) })
  const spouseOf = {}
  TREE.edges.filter((e) => e.type === 'SPOUSE_OF').forEach((e) => {
    ;(spouseOf[e.from] ||= []).push(e.to)
    ;(spouseOf[e.to] ||= []).push(e.from)
  })
  const nodeById = {}
  TREE.nodes.forEach((n) => (nodeById[n.id] = n))

  genList.forEach((g) => (byGen[g] = TREE.nodes.filter((n) => (n.generation || 0) === g)))

  // ordering: DFS từ đời nhỏ nhất
  const ordered = {}
  genList.forEach((g) => (ordered[g] = []))
  const placed = new Set()
  const roots = byGen[genList[0]] || []
  const walk = (n) => {
    if (!n || placed.has(n.id)) return
    placed.add(n.id)
    const g = n.generation || 0
    ordered[g] = ordered[g] || []
    ordered[g].push(n)
    ;(spouseOf[n.id] || []).forEach((sid) => {
      const sp = nodeById[sid]
      if (sp && !placed.has(sid)) { placed.add(sid); (ordered[sp.generation || 0] ||= []).push(sp) }
    })
    const kids = (childOf[n.id] || []).map((id) => nodeById[id]).filter(Boolean)
    kids.sort((a, b) => String(a.birthYear).localeCompare(String(b.birthYear)))
    kids.forEach(walk)
  }
  roots.forEach(walk)
  TREE.nodes.forEach((n) => { if (!placed.has(n.id)) (ordered[n.generation || 0] ||= []).push(n) })

  const COL = 168, ROW = 132, PADX = 90, PADY = 80
  const maxCols = Math.max(...genList.map((g) => (ordered[g] || []).length), 1)
  TREE.pos = {}
  genList.forEach((g, gi) => {
    const arr = ordered[g] || []
    const offset = (maxCols - arr.length) / 2
    arr.forEach((n, i) => {
      TREE.pos[n.id] = { x: PADX + (offset + i) * COL, y: PADY + gi * ROW, gen: g }
    })
  })
  TREE.w = PADX * 2 + maxCols * COL
  TREE.h = PADY * 2 + genList.length * ROW
  TREE.genList = genList
  TREE.ordered = ordered
}

function drawTree() {
  const svg = $('#tree-svg')
  if (!svg) return
  const P = TREE.pos
  let links = ''
  TREE.edges.forEach((e) => {
    const a = P[e.from], b = P[e.to]
    if (!a || !b) return
    const cls = ['tlink']
    if (e.type === 'SPOUSE_OF') cls.push('spouse')
    if (e.type === 'ADOPTED_BY' || e.adopted) cls.push('adopted')
    if (!e.verified) cls.push('unverified')
    if (e.type === 'SPOUSE_OF') {
      links += `<path class="${cls.join(' ')}" d="M${a.x} ${a.y} L${b.x} ${b.y}"/>`
    } else {
      // con (from) -> cha mẹ (to): đường bậc thang
      const my = (a.y + b.y) / 2
      links += `<path class="${cls.join(' ')}" d="M${a.x} ${a.y - 22} L${a.x} ${my} L${b.x} ${my} L${b.x} ${b.y + 22}"/>`
    }
  })

  let nodes = ''
  TREE.nodes.forEach((n) => {
    const p = P[n.id]
    if (!p) return
    const alive = n.isAlive
    const fill = alive ? 'url(#gLeafG)' : 'url(#gLeafY)'
    const stroke = alive ? '#2f6b45' : '#8a6d22'
    nodes += `<g class="tn" data-id="${esc(n.id)}" data-name="${esc(n.name)}" transform="translate(${p.x},${p.y})">
      <path class="leaf" d="M0,-20 C16,-20 24,-8 22,4 C20,16 8,22 -1,20 C-14,17 -22,6 -20,-4 C-18,-14 -10,-20 0,-20 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>
      <path d="M-2,18 L0,30" stroke="${stroke}" stroke-width="1.6" fill="none"/>
      ${n.memoryCount ? `<circle cx="17" cy="-15" r="8.5" fill="#8b0000" stroke="#d4af37" stroke-width="1"/>
        <text x="17" y="-11.5" text-anchor="middle" font-size="9" fill="#f5efdd">${n.memoryCount > 9 ? '9+' : n.memoryCount}</text>` : ''}
      ${(n.consentScopes || []).includes('chatbot_persona') ? `<text x="-20" y="-16" font-size="11" fill="#d4af37">✻</text>` : ''}
      <text class="nm" x="0" y="46" text-anchor="middle">${esc(shortName(n.name))}</text>
      <text class="yr" x="0" y="59" text-anchor="middle">${esc(lifespanNode(n))}</text>
    </g>`
  })

  let genLabels = ''
  ;(TREE.genList || []).forEach((g) => {
    const any = (TREE.ordered[g] || [])[0]
    if (!any) return
    const p = TREE.pos[any.id]
    genLabels += `<text class="gen-label" x="16" y="${p.y + 4}">ĐỜI ${g + 1}</text>`
  })

  svg.innerHTML = `
    <defs>
      <radialGradient id="gLeafG" cx="35%" cy="30%"><stop offset="0%" stop-color="#7fd39a"/><stop offset="60%" stop-color="#4f9d69"/><stop offset="100%" stop-color="#2c6b43"/></radialGradient>
      <radialGradient id="gLeafY" cx="35%" cy="30%"><stop offset="0%" stop-color="#f4dd93"/><stop offset="60%" stop-color="#d4af37"/><stop offset="100%" stop-color="#8a6d22"/></radialGradient>
    </defs>
    <g id="tree-g">${genLabels}${links}${nodes}</g>`
  applyTreeTransform()
  fitTree()
  $$('.tn', svg).forEach((g) => {
    g.addEventListener('click', (e) => { e.stopPropagation(); openPerson(g.dataset.id) })
    g.addEventListener('mouseenter', (ev) => showTip(g, ev))
    g.addEventListener('mouseleave', () => $('#tip').classList.remove('show'))
  })
}

const shortName = (n) => (String(n).length > 18 ? String(n).slice(0, 17) + '…' : String(n))
const lifespanNode = (n) => (n.isAlive ? `${n.birthYear || '?'} –` : `${n.birthYear || '?'} – ${n.deathYear || '?'}`)

function showTip(g, ev) {
  const n = TREE.nodes.find((x) => x.id === g.dataset.id)
  if (!n) return
  const tip = $('#tip')
  const wrap = $('#tree-wrap').getBoundingClientRect()
  tip.innerHTML = `<b>${esc(n.name)}</b>${esc(lifespanNode(n))}${n.age ? ` · ${n.age} tuổi` : ''}
    ${n.birthPlace ? `<br>Quê: ${esc(n.birthPlace)}` : ''}
    ${(n.occupation || []).length ? `<br>Nghề: ${esc(n.occupation.join(', '))}` : ''}
    <br>${n.memoryCount || 0} ký ức đã lưu${n.isVerified ? ' · đã xác minh' : ' · chưa xác minh'}`
  tip.style.left = Math.min(ev.clientX - wrap.left + 14, wrap.width - 270) + 'px'
  tip.style.top = ev.clientY - wrap.top + 14 + 'px'
  tip.classList.add('show')
}

function applyTreeTransform() {
  const g = $('#tree-g')
  if (g) g.setAttribute('transform', `translate(${TREE.tx},${TREE.ty}) scale(${TREE.scale})`)
  // LOD: ẩn chi tiết khi thu nhỏ
  const svg = $('#tree-svg')
  if (svg) svg.classList.toggle('lod-far', TREE.scale < 0.6)
  $$('.tn .yr').forEach((t) => (t.style.display = TREE.scale < 0.55 ? 'none' : ''))
}

function fitTree() {
  const wrap = $('#tree-wrap')
  if (!wrap) return
  const W = wrap.clientWidth, H = wrap.clientHeight
  TREE.scale = Math.min(W / TREE.w, H / TREE.h, 1.1) * 0.94
  TREE.tx = (W - TREE.w * TREE.scale) / 2
  TREE.ty = (H - TREE.h * TREE.scale) / 2
  applyTreeTransform()
}

function bindTreeEvents() {
  const svg = $('#tree-svg')
  let drag = null
  svg.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, tx: TREE.tx, ty: TREE.ty }
    svg.classList.add('dragging')
  })
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return
    TREE.tx = drag.tx + (e.clientX - drag.x)
    TREE.ty = drag.ty + (e.clientY - drag.y)
    applyTreeTransform()
  })
  const stop = () => { drag = null; svg.classList.remove('dragging') }
  svg.addEventListener('pointerup', stop)
  svg.addEventListener('pointerleave', stop)
  svg.addEventListener('wheel', (e) => {
    e.preventDefault()
    const r = svg.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    const k = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const ns = Math.max(0.25, Math.min(2.6, TREE.scale * k))
    TREE.tx = mx - ((mx - TREE.tx) * ns) / TREE.scale
    TREE.ty = my - ((my - TREE.ty) * ns) / TREE.scale
    TREE.scale = ns
    applyTreeTransform()
  }, { passive: false })

  const zoom = (k) => { TREE.scale = Math.max(0.25, Math.min(2.6, TREE.scale * k)); applyTreeTransform() }
  $('#z-in').onclick = () => zoom(1.2)
  $('#z-out').onclick = () => zoom(1 / 1.2)
  $('#z-fit').onclick = fitTree
  window.addEventListener('resize', () => fitTree())

  const q = $('#tree-q'), res = $('#tree-res')
  q.oninput = () => {
    const v = q.value.trim().toLowerCase()
    if (!v) {
      res.classList.add('hide')
      $$('.tn').forEach((g) => g.classList.remove('dim', 'hit'))
      return
    }
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()
    const nv = norm(v)
    const hits = TREE.nodes.filter((n) => norm(n.name).includes(nv) || norm((n.aliases || []).join(' ')).includes(nv) || norm(n.birthPlace).includes(nv))
    const ids = new Set(hits.map((h) => h.id))
    $$('.tn').forEach((g) => {
      g.classList.toggle('hit', ids.has(g.dataset.id))
      g.classList.toggle('dim', !ids.has(g.dataset.id))
    })
    res.innerHTML = hits.slice(0, 12).map((h) => `<div data-go="${esc(h.id)}"><b>${esc(h.name)}</b> <small>${esc(lifespanNode(h))}</small></div>`).join('') || '<div>Không tìm thấy</div>'
    res.classList.remove('hide')
    $$('[data-go]', res).forEach((d) => d.onclick = () => { centerOn(d.dataset.go); openPerson(d.dataset.go) })
  }
}

function centerOn(id) {
  const p = TREE.pos[id]
  const wrap = $('#tree-wrap')
  if (!p || !wrap) return
  TREE.scale = Math.max(TREE.scale, 1)
  TREE.tx = wrap.clientWidth / 2 - p.x * TREE.scale
  TREE.ty = wrap.clientHeight / 2 - p.y * TREE.scale
  applyTreeTransform()
}

/* --------------------- Person drawer (dùng chung) ------------------ */
async function openPerson(id) {
  drawer(loading('Đang mở hồ sơ…'))
  let d
  try { d = await api(`/persons/${id}`) } catch (e) { drawer(errBox(e)); return }
  const p = d.person
  const rel = d.relations
  const relBlock = (title, arr, icon) => !arr.length ? '' : `
    <div class="mt-3"><div class="fkey"><i class="fa-solid ${icon}"></i> ${esc(title.toUpperCase())}</div>
    <div class="list">${arr.map((r) => `<div class="list-item clickable" data-p="${esc(r.id)}">
      ${avatar(r, 'sm')}<div class="f1"><div class="t">${esc(r.full_name)}</div>
      <div class="d">${esc(lifespan(r))}${r.adopted ? ' · nhận nuôi' : ''}${r.married_at ? ` · cưới ${yr(r.married_at)}` : ''}</div></div>
    </div>`).join('')}</div></div>`

  const canChat = (d.activeScopes || []).includes('chatbot_persona')

  drawer(`
    <div class="drawer-head">
      ${avatar(p, 'xl')}
      <div class="f1">
        <h2 style="margin:0 0 2px">${esc(p.full_name)}</h2>
        <small>${esc(lifespan(p))}${p.age ? ` · ${p.age} tuổi` : ''}</small>
        <div class="mt-2">
          <span class="badge ${p.is_alive ? 'green' : 'gold'}">${p.is_alive ? 'Còn sống' : 'Đã mất'}</span>
          ${p.generation != null ? `<span class="badge">Đời ${p.generation + 1}</span>` : ''}
          ${p.is_verified ? '<span class="badge blue"><i class="fa-solid fa-check"></i> Đã xác minh</span>' : '<span class="badge warn">Chưa xác minh</span>'}
        </div>
      </div>
      <button class="x-btn" data-close>✕</button>
    </div>

    ${p.bio ? `<p style="font-size:var(--fs-sm)">${esc(p.bio)}</p>` : ''}

    <dl class="kv">
      ${p.birth_place ? `<dt>Nơi sinh</dt><dd>${esc(p.birth_place)}</dd>` : ''}
      ${p.death_place ? `<dt>Nơi mất</dt><dd>${esc(p.death_place)}</dd>` : ''}
      ${p.lunarDeath ? `<dt>Ngày giỗ</dt><dd>${esc(p.lunarDeath)}</dd>` : ''}
      ${d.nextAnniversary ? `<dt>Giỗ tới</dt><dd>${fmtDay(d.nextAnniversary.solarDate)} (còn ${d.nextAnniversary.daysUntil} ngày)</dd>` : ''}
      ${(p.occupation || []).length ? `<dt>Nghề</dt><dd>${esc(p.occupation.join(', '))}</dd>` : ''}
      ${p.religion ? `<dt>Tín ngưỡng</dt><dd>${esc(p.religion)}</dd>` : ''}
      ${(p.aliases || []).length ? `<dt>Tên khác</dt><dd>${esc(p.aliases.join(', '))}</dd>` : ''}
      <dt>Ký ức đã lưu</dt><dd>${d.memoryCount}</dd>
    </dl>

    <div class="btn-group mt-4">
      <button class="btn sm" id="pd-mem"><i class="fa-solid fa-book-open"></i> Ký ức (${d.memoryCount})</button>
      ${!p.is_alive ? `<button class="btn sm ${canChat ? 'gold' : 'quiet'}" id="pd-chat">
        <i class="fa-solid fa-comments"></i> ${canChat ? 'Trò chuyện' : 'Chưa có đồng thuận'}</button>` : ''}
      ${p.is_alive ? `<button class="btn sm ghost" id="pd-interview"><i class="fa-solid fa-microphone-lines"></i> Phỏng vấn AI</button>` : ''}
      <button class="btn sm ghost" id="pd-consent"><i class="fa-solid fa-file-signature"></i> Đồng thuận</button>
    </div>

    ${(d.advices || []).length ? `<div class="card paper mt-4" style="padding:var(--sp-4)">
      <div class="fkey">LỜI DẶN CỦA NGƯỜI NÀY</div>
      ${d.advices.slice(0, 3).map((a) => `<div class="advice-quote" style="margin-bottom:10px"><div class="q" style="font-size:var(--fs-sm)">${esc(a.original_text)}</div></div>`).join('')}
    </div>` : ''}

    ${relBlock('Cha mẹ', rel.parents, 'fa-arrow-up')}
    ${relBlock('Vợ / chồng', rel.spouses, 'fa-heart')}
    ${relBlock('Anh chị em', rel.siblings, 'fa-users')}
    ${relBlock('Con', rel.children, 'fa-arrow-down')}

    <div id="pd-extra" class="mt-4"></div>`)

  $$('[data-p]').forEach((el) => el.onclick = () => openPerson(el.dataset.p))
  const extra = $('#pd-extra')
  $('#pd-mem').onclick = async () => {
    extra.innerHTML = loading()
    try {
      const r = await api(`/persons/${id}/memories`)
      extra.innerHTML = (r.memories || []).length
        ? `<div class="fkey mb-2">KÝ ỨC</div>` + r.memories.map((m) => `
          <div class="card tight mb-2"><small class="muted">${esc(m.perspective || m.type)} · ${fmtDate(m.created_at)}</small>
          <div style="font-size:var(--fs-sm);margin-top:6px">${esc(m.content)}</div>
          ${m.event_title ? `<div class="mt-2"><span class="badge">${esc(m.event_title)}</span></div>` : ''}</div>`).join('')
        : empty('fa-book-open', 'Chưa có ký ức nào về người này.')
    } catch (e) { extra.innerHTML = errBox(e) }
  }
  if ($('#pd-chat')) $('#pd-chat').onclick = () => personaChat(id, p.full_name)
  if ($('#pd-interview')) $('#pd-interview').onclick = () => { closeOverlay(); newInterviewModal(id, p.full_name) }
  $('#pd-consent').onclick = () => consentModal(id, p.full_name)
}

/* ==================== F1 — DIGITAL ALTAR =========================== */
const ALTAR = { id: null, cursor: '1970-01-01 00:00:00', timer: null, sticks: 0, candles: true }

async function viewAltar(host) {
  host.innerHTML = loading('Đang mở bàn thờ…')
  let data
  const want = new URLSearchParams(location.search).get('altar')
  try {
    const list = await api('/altars')
    const altars = list.altars || []
    if (!altars.length) {
      host.innerHTML = empty('fa-fire', 'Dòng họ chưa lập bàn thờ số nào.',
        S.user ? '<button class="btn gold" id="mk-altar">Lập bàn thờ</button>' : '<button class="btn gold" onclick="window.__auth()">Đăng nhập để lập bàn thờ</button>')
      if ($('#mk-altar')) $('#mk-altar').onclick = () => createAltarModal()
      return
    }
    ALTAR.id = want || altars[0].id
    ALTAR.list = altars
    data = await api(`/altars/${ALTAR.id}`)
  } catch (e) { host.innerHTML = errBox(e); return }

  renderAltar(host, data)
}

function renderAltar(host, data) {
  const a = data.altar
  const subs = data.subjects || []
  const themeLabel = (data.themes || []).find((t) => t.id === a.religion_theme)
  const soonest = subs.map((s) => s.nextAnniversary).filter(Boolean).sort((x, y) => x.daysUntil - y.daysUntil)[0]

  host.innerHTML = `
    ${(ALTAR.list || []).length > 1 ? `<div class="tabs">${ALTAR.list.map((x) => `<button class="tab ${x.id === a.id ? 'active' : ''}" data-alt="${esc(x.id)}">${esc(x.name)}</button>`).join('')}</div>` : ''}

    ${soonest && soonest.daysUntil <= 7 ? `<div class="alert warn"><b>Sắp tới ngày giỗ.</b> ${esc(subs.find((s) => s.nextAnniversary === soonest).full_name)} — ${fmtDay(soonest.solarDate)} (còn ${soonest.daysUntil} ngày). Đặc tả yêu cầu nhắc trước 7 ngày, 1 ngày và 1 giờ theo lịch âm.</div>` : ''}

    <div class="grid sidebar">
      <div>
        <div class="altar-stage theme-${esc(a.religion_theme)}" id="stage">
          <div class="presence-bar" id="presence"></div>
          <div class="hoanh-phi">${esc(a.horizontal_scroll_text || 'ĐỨC LƯU QUANG')}</div>
          <div class="altar-portraits">
            ${subs.map((s) => `<div class="portrait-frame" data-p="${esc(s.id)}">
              ${s.photo_url ? `<img src="${esc(s.photo_url)}" alt="${esc(s.full_name)}">` : `<div class="ph"><i class="fa-solid fa-user"></i></div>`}
              <div class="portrait-name">${esc(s.full_name)}</div>
              <div class="portrait-years">${esc(lifespan(s))}</div>
              ${s.lunarLabel ? `<div class="portrait-anniv">Giỗ ${esc(s.lunarLabel)}</div>` : ''}
            </div>`).join('')}
          </div>
          <div class="altar-table">
            <div class="candle" id="candle-l"><div class="flame"></div><div class="candle-body"></div></div>
            <div class="censer">
              <div class="incense-sticks" id="sticks"></div>
              <div class="smoke-layer" id="smoke"></div>
              <div class="censer-bowl"></div>
            </div>
            <div class="candle" id="candle-r"><div class="flame"></div><div class="candle-body"></div></div>
            <div id="offerings" style="display:flex;gap:14px;align-items:flex-end"></div>
          </div>
          <div class="altar-actions">
            <button class="btn gold" id="act-incense"><i class="fa-solid fa-fire"></i> Thắp nhang</button>
            <button class="btn on-dark" id="act-prayer"><i class="fa-solid fa-hands-praying"></i> Khấn nguyện</button>
            <button class="btn on-dark" id="act-flower"><i class="fa-solid fa-seedling"></i> Dâng hoa</button>
            <button class="btn on-dark" id="act-offering"><i class="fa-solid fa-bowl-rice"></i> Dâng cỗ</button>
            <button class="btn on-dark" id="act-candle"><i class="fa-solid fa-candle-holder"></i> Nến</button>
          </div>
          <div class="altar-2d-note">
            Bản dựng 2.5D theo tiêu chí dự phòng AC-F1.2 của đặc tả (thiết bị yếu vẫn phải xem được bàn thờ ở chế độ 2D).
            Hiệu ứng nhang khói đồng bộ giữa các thành viên qua poll-sync.
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card dark">
          <div class="fkey">HÔM NAY (ÂM LỊCH)</div>
          <div style="font-family:var(--f-display);font-size:22px;color:var(--secondary)">${esc((data.lunarToday && data.lunarToday.label) || '')}</div>
          <div class="divider" style="background:#40312d"></div>
          <div class="fkey">KHÔNG GIAN</div>
          <small>${esc(a.name)} · ${esc((themeLabel && themeLabel.label) || a.religion_theme)}<br>Âm thanh: ${esc(a.ambient_sound || '—')}</small>
          ${S.user ? `<button class="btn on-dark block mt-3" id="alt-theme"><i class="fa-solid fa-palette"></i> Đổi không gian thờ</button>` : ''}
        </div>

        <div class="card">
          <div class="card-head"><h3 style="margin:0"><i class="fa-solid fa-clock-rotate-left red-t"></i> Nhật ký nghi lễ</h3></div>
          <div class="timeline" id="ritual-log">
            ${(data.ritualLog || []).length ? data.ritualLog.map(logItem).join('') : '<small class="muted">Chưa có ai thắp nhang hôm nay.</small>'}
          </div>
        </div>

        <div class="card paper">
          <div class="fkey">4.1.6 GHI CHÚ ĐẠO ĐỨC</div>
          <small>Ảnh thờ mờ chỉ được phục dựng nét, <b>không tự tô màu</b> để tránh bịa nét mặt tổ tiên. Nếu ảnh quá kém, hệ thống báo cảnh và giữ nguyên bản gốc.</small>
        </div>
      </div>
    </div>`

  $$('[data-alt]', host).forEach((b) => b.onclick = () => { location.search = `?altar=${b.dataset.alt}` })
  $$('[data-p]', host).forEach((b) => b.onclick = () => openPerson(b.dataset.p))

  // nhang có sẵn từ log
  const already = (data.ritualLog || []).filter((r) => r.type === 'INCENSE').length
  ALTAR.sticks = 0
  for (let i = 0; i < Math.min(already, 9); i++) addStick(true)
  startSmoke()

  $('#act-incense').onclick = () => ritualAct('INCENSE')
  $('#act-flower').onclick = () => ritualAct('FLOWER', { item: 'hoa cúc vàng' })
  $('#act-offering').onclick = () => offeringModal()
  $('#act-prayer').onclick = () => prayerModal()
  $('#act-candle').onclick = () => {
    ALTAR.candles = !ALTAR.candles
    $$('.candle').forEach((c) => c.classList.toggle('off', !ALTAR.candles))
    ritualAct('CANDLE', { on: ALTAR.candles }, false)
  }
  if ($('#alt-theme')) $('#alt-theme').onclick = () => themeModal(a, data.themes || [])

  ALTAR.cursor = new Date().toISOString().replace('T', ' ').slice(0, 19)
  if (ALTAR.timer) clearInterval(ALTAR.timer)
  ALTAR.timer = setInterval(pollAltar, 2500)
}

function logItem(r) {
  const label = { INCENSE: 'thắp nhang', FLOWER: 'dâng hoa', OFFERING: 'dâng cỗ', PRAYER: 'khấn nguyện', CANDLE: 'thắp nến', JOIN: 'vào lễ', LEAVE: 'rời lễ' }[r.type] || r.type
  const p = r.payload || {}
  return `<div class="timeline-item"><div class="ts">${fmtDate(r.created_at || r.at)}</div>
    <div class="ttl">${esc(r.user_name || r.actor || r.actor_name || 'Khách viếng')} ${esc(label)}</div>
    ${p.text ? `<small class="muted">“${esc(String(p.text).slice(0, 120))}”</small>` : ''}
    ${p.item ? `<small class="muted">${esc(p.item)}</small>` : ''}</div>`
}

function addStick(silent) {
  const host = $('#sticks')
  if (!host || ALTAR.sticks >= 12) return
  ALTAR.sticks++
  const s = document.createElement('div')
  s.className = 'stick'
  s.style.height = 44 + Math.random() * 18 + 'px'
  host.appendChild(s)
  if (!silent) puffSmoke(6)
}

function puffSmoke(n = 3) {
  const layer = $('#smoke')
  if (!layer) return
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const p = document.createElement('div')
      p.className = 'smoke'
      p.style.left = 44 + (Math.random() * 30 - 15) + 'px'
      p.style.setProperty('--dx', (Math.random() * 44 - 22) + 'px')
      layer.appendChild(p)
      setTimeout(() => p.remove(), 4400)
    }, i * 260)
  }
}
function startSmoke() {
  if (ALTAR.smokeTimer) clearInterval(ALTAR.smokeTimer)
  ALTAR.smokeTimer = setInterval(() => { if (ALTAR.sticks > 0 && $('#smoke')) puffSmoke(1) }, 1200)
}

async function ritualAct(type, payload = {}, visual = true) {
  const clientEventId = 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  if (visual) {
    if (type === 'INCENSE') addStick()
    if (type === 'FLOWER' || type === 'OFFERING') {
      const o = document.createElement('div')
      o.className = 'offering'
      o.innerHTML = `<span class="ico">${type === 'FLOWER' ? '🌼' : '🍚'}</span><span>${esc(payload.item || '')}</span>`
      const host = $('#offerings'); if (host) host.appendChild(o)
    }
    stageToast(type === 'INCENSE' ? 'Đã thắp nhang' : type === 'PRAYER' ? 'Lời khấn đã được ghi' : 'Đã dâng lễ')
  }
  try {
    await api('/ritual-events', { method: 'POST', body: { altarId: ALTAR.id, type, payload, clientEventId } })
  } catch (e) {
    // offline queue idempotent theo AC-F1.4
    const q = JSON.parse(localStorage.getItem('gsk_queue') || '[]')
    q.push({ altarId: ALTAR.id, type, payload, clientEventId })
    localStorage.setItem('gsk_queue', JSON.stringify(q))
    toast('Mất mạng — nghi lễ đã lưu tạm và sẽ tự gửi lại.', 'warn')
  }
}

async function flushQueue() {
  const q = JSON.parse(localStorage.getItem('gsk_queue') || '[]')
  if (!q.length) return
  const left = []
  for (const it of q) {
    try { await api('/ritual-events', { method: 'POST', body: it }) } catch { left.push(it) }
  }
  localStorage.setItem('gsk_queue', JSON.stringify(left))
  if (q.length !== left.length) toast(`Đã gửi lại ${q.length - left.length} nghi lễ lưu offline.`)
}

function stageToast(msg) {
  const stage = $('#stage')
  if (!stage) return
  const t = document.createElement('div')
  t.className = 'altar-toast'
  t.textContent = msg
  stage.appendChild(t)
  setTimeout(() => t.remove(), 3600)
}

async function pollAltar() {
  if (!$('#stage')) { clearInterval(ALTAR.timer); return }
  try {
    const r = await api(`/ritual-events/stream?altarId=${ALTAR.id}&since=${encodeURIComponent(ALTAR.cursor)}`)
    ALTAR.cursor = r.cursor || ALTAR.cursor
    const log = $('#ritual-log')
    const who = new Set()
    ;(r.events || []).forEach((e) => {
      who.add(e.actor)
      if (log) log.insertAdjacentHTML('afterbegin', logItem(e))
      if (e.type === 'INCENSE') { addStick(); stageToast(`${e.actor} vừa thắp nhang`) }
      if (e.type === 'PRAYER') stageToast(`${e.actor} vừa khấn nguyện`)
    })
    if (who.size) {
      const pr = $('#presence')
      if (pr) pr.innerHTML = [...who].slice(0, 5).map((w) => `<span class="presence-chip"><i class="fa-solid fa-circle" style="font-size:6px;color:#4f9d69"></i> ${esc(w)}</span>`).join('')
    }
  } catch {}
}

function prayerModal() {
  if (!requireLogin('khấn nguyện')) return
  modal(`<div class="card-head"><h2 style="margin:0">Lời khấn</h2><button class="x-btn" data-close>✕</button></div>
    <div class="alert">Lời khấn được lưu vào nhật ký nghi lễ của dòng họ. Bạn có thể để chế độ riêng tư nếu muốn.</div>
    <form id="f-prayer"><div class="field"><textarea name="text" rows="5" placeholder="Con kính xin ông bà…" required></textarea></div>
    <label class="check"><input type="checkbox" name="private"> Chỉ mình con đọc được</label>
    <button class="btn gold block mt-3" type="submit"><i class="fa-solid fa-hands-praying"></i> Kính khấn</button></form>`)
  $('#f-prayer').onsubmit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    closeOverlay()
    await ritualAct('PRAYER', { text: f.get('text'), private: !!f.get('private') })
  }
}

function offeringModal() {
  if (!requireLogin('dâng cỗ')) return
  const items = ['Mâm cơm cúng', 'Xôi gấc', 'Gà luộc', 'Bánh chưng', 'Trầu cau', 'Trà', 'Rượu nếp', 'Hoa quả']
  modal(`<div class="card-head"><h2 style="margin:0">Dâng cỗ</h2><button class="x-btn" data-close>✕</button></div>
    <div class="scope-grid">${items.map((i) => `<div class="scope-item" data-item="${esc(i)}"><div class="t">${esc(i)}</div></div>`).join('')}</div>`)
  $$('[data-item]').forEach((el) => el.onclick = async () => { closeOverlay(); await ritualAct('OFFERING', { item: el.dataset.item }) })
}

function themeModal(a, themes) {
  modal(`<div class="card-head"><h2 style="margin:0">Không gian thờ</h2><button class="x-btn" data-close>✕</button></div>
    <div class="help mb-3">Đặc tả yêu cầu hỗ trợ 6 tín ngưỡng, mặc định không giả định tôn giáo nào.</div>
    <div class="scope-grid">${themes.map((t) => `<div class="scope-item ${t.id === a.religion_theme ? 'on' : ''}" data-th="${esc(t.id)}">
      <div class="t"><span style="width:12px;height:12px;border-radius:50%;background:${esc(t.accent)};display:inline-block"></span> ${esc(t.label)}</div></div>`).join('')}</div>
    <div class="field mt-4"><label>Hoành phi</label><input id="th-hp" value="${esc(a.horizontal_scroll_text || '')}" maxlength="24"></div>
    <button class="btn block" id="th-save">Lưu</button>`)
  let pick = a.religion_theme
  $$('[data-th]').forEach((el) => el.onclick = () => { pick = el.dataset.th; $$('[data-th]').forEach((x) => x.classList.toggle('on', x === el)) })
  $('#th-save').onclick = async () => {
    try {
      await api(`/altars/${a.id}`, { method: 'PATCH', body: { religionTheme: pick, horizontalScrollText: $('#th-hp').value } })
      closeOverlay(); toast('Đã lưu không gian thờ.'); location.reload()
    } catch (e) { toast(e.message, 'err') }
  }
}

async function createAltarModal() {
  if (!requireLogin('lập bàn thờ')) return
  const r = await api('/persons')
  const dead = (r.persons || []).filter((p) => !p.is_alive)
  modal(`<div class="card-head"><h2 style="margin:0">Lập bàn thờ số</h2><button class="x-btn" data-close>✕</button></div>
    <form id="f-altar"><div class="field"><label>Tên bàn thờ</label><input name="name" value="Bàn thờ tổ" required></div>
    <div class="field"><label>Người được thờ</label>
      <div style="max-height:220px;overflow:auto;border:1px solid var(--n-200);border-radius:8px;padding:10px">
        ${dead.map((p) => `<label class="check mb-2"><input type="checkbox" name="s" value="${esc(p.id)}"> ${esc(p.full_name)} <small>(${esc(lifespan(p))})</small></label>`).join('') || '<small>Chưa có người đã mất trong cây.</small>'}
      </div></div>
    <div class="field"><label>Hoành phi</label><input name="hp" value="ĐỨC LƯU QUANG"></div>
    <button class="btn gold block" type="submit">Lập bàn thờ</button></form>`)
  $('#f-altar').onsubmit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const ids = f.getAll('s')
    if (!ids.length) return toast('Chọn ít nhất một người.', 'warn')
    try {
      await api('/altars', { method: 'POST', body: { name: f.get('name'), subjectPersonIds: ids, horizontalScrollText: f.get('hp') } })
      closeOverlay(); location.reload()
    } catch (err) { toast(err.message, 'err') }
  }
}

/* =====================================================================
   F4 — Cross-Referential Memory Graph  (Rashomon mode)
   4.4.3: nhiều góc nhìn song song, mâu thuẫn được ĐÁNH DẤU, không tự xử.
   ===================================================================== */
const MEM = { events: [], activeEvent: null }

async function viewMemories(host) {
  host.innerHTML = loading('Đang mở kho ký ức…')
  try {
    const [ev, ct] = await Promise.all([api('/events'), api('/contradictions')])
    MEM.events = ev.events || []
    const cts = ct.contradictions || []
    const open = cts.filter((x) => x.status === 'OPEN')

    host.innerHTML = `
      <div class="grid sidebar">
        <div class="col">
          <div class="card tight mb-4">
            <div class="row between">
              <div class="field f1" style="margin:0">
                <input id="mem-q" placeholder="Tìm ký ức, người, sự kiện, gia huấn… (không cần dấu)">
              </div>
              <button class="btn ghost" id="mem-go"><i class="fa-solid fa-magnifying-glass"></i> Tìm</button>
              ${S.user ? '<button class="btn gold" id="mem-new"><i class="fa-solid fa-plus"></i> Ghi ký ức</button>' : ''}
            </div>
            <div id="mem-search-out"></div>
          </div>

          ${open.length ? `<div class="alert warn mb-4">
            <b><i class="fa-solid fa-triangle-exclamation"></i> ${open.length} mâu thuẫn đang mở.</b><br>
            Hệ thống <b>không tự phán xử</b> lời kể nào đúng. Mâu thuẫn được giữ lại để con cháu hỏi thêm — đó cũng là một phần của ký ức.
          </div>` : ''}

          <div class="card-head"><h2 class="card-title">Sự kiện của dòng họ</h2>
            <span class="badge">${MEM.events.length}</span></div>
          <div id="mem-events">
            ${MEM.events.length
              ? MEM.events.map(eventRow).join('')
              : empty('fa-book-open', 'Chưa có sự kiện nào được ghi lại.',
                  S.user ? '<button class="btn gold" id="mem-new-ev">Tạo sự kiện đầu tiên</button>' : '')}
          </div>
        </div>

        <div class="col">
          <div class="card dark mb-4">
            <div class="card-title gold-t">Rashomon là gì?</div>
            <p class="mt-2" style="opacity:.85;font-size:14px">
              Cùng một đám cưới, ông kể mưa, bà kể nắng. Chúng tôi <b>không xoá lời nào</b>.
              Mỗi lời kể là một cột riêng, đặt cạnh nhau. Nơi chúng lệch nhau, ta vẽ một đường gạch —
              không phải để chỉ ra ai sai, mà để nhắc rằng ký ức là của con người.
            </p>
          </div>
          <div class="card">
            <div class="card-head"><h3 class="card-title">Mâu thuẫn đã ghi nhận</h3></div>
            <div class="list">
              ${cts.length ? cts.slice(0, 12).map(ctRow).join('')
                : '<div class="muted" style="font-size:14px">Chưa phát hiện mâu thuẫn nào.</div>'}
            </div>
          </div>
          <div class="card paper mt-4">
            <div class="card-title">Nguyên tắc P6</div>
            <p class="mt-2" style="font-size:14px">
              “Sự thật của mỗi người đều được tôn trọng.” AI chỉ <i>phát hiện</i> điểm lệch;
              việc làm rõ luôn do người thật trong họ thực hiện và ký tên.
            </p>
          </div>
        </div>
      </div>`

    $('#mem-go') && $('#mem-go').addEventListener('click', doMemSearch)
    $('#mem-q') && $('#mem-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') doMemSearch() })
    $('#mem-new') && $('#mem-new').addEventListener('click', () => newMemoryModal())
    $('#mem-new-ev') && $('#mem-new-ev').addEventListener('click', () => newEventModal())
    $$('[data-ev]', host).forEach((el) =>
      el.addEventListener('click', () => openRashomon(el.getAttribute('data-ev'))))
    $$('[data-ct]', host).forEach((el) =>
      el.addEventListener('click', (e) => { e.stopPropagation(); openContradiction(el.getAttribute('data-ct'), cts) }))

    const wantEv = new URLSearchParams(location.search).get('event')
    if (wantEv) openRashomon(wantEv)
  } catch (e) { host.innerHTML = errBox(e) }
}

const EVT_ICON = { WEDDING: 'fa-ring', FUNERAL: 'fa-place-of-worship', BIRTH: 'fa-baby', DEATH: 'fa-cross', WAR: 'fa-shield-halved', MIGRATION: 'fa-route', OTHER: 'fa-calendar-day' }
const EVT_LABEL = { WEDDING: 'Cưới hỏi', FUNERAL: 'Tang lễ', BIRTH: 'Sinh', DEATH: 'Mất', WAR: 'Chiến tranh', MIGRATION: 'Di cư', OTHER: 'Khác' }

function eventRow(e) {
  return `<div class="card hoverable tight mb-3" data-ev="${esc(e.id)}" style="cursor:pointer">
    <div class="row between top">
      <div class="f1">
        <div class="row" style="gap:8px">
          <span class="badge dark"><i class="fa-solid ${EVT_ICON[e.event_type] || 'fa-calendar-day'}"></i> ${esc(EVT_LABEL[e.event_type] || e.event_type)}</span>
          ${e.significance === 'HISTORICAL' ? '<span class="badge gold">Gắn sử</span>' : ''}
          ${Number(e.contradiction_count) > 0 ? `<span class="badge warn"><i class="fa-solid fa-triangle-exclamation"></i> ${e.contradiction_count} mâu thuẫn</span>` : ''}
        </div>
        <div class="card-title mt-2">${esc(e.title)}</div>
        <div class="muted" style="font-size:13px">
          ${e.event_date ? fmtDay(e.event_date) : 'chưa rõ ngày'}${e.location ? ' · ' + esc(e.location) : ''}
        </div>
      </div>
      <div class="tc">
        <div class="stat"><div class="v" style="font-size:24px">${e.memory_count || 0}</div><div class="n">lời kể</div></div>
      </div>
    </div>
  </div>`
}

function ctRow(c) {
  const sevB = c.severity === 'HIGH' ? 'red' : c.severity === 'MEDIUM' ? 'warn' : ''
  return `<div class="list-item clickable" data-ct="${esc(c.id)}">
    <div class="f1">
      <div class="row" style="gap:6px">
        <span class="badge ${sevB}">${esc(c.severity)}</span>
        ${c.status !== 'OPEN' ? `<span class="badge green">${c.status === 'CLARIFIED' ? 'đã làm rõ' : 'bỏ qua'}</span>` : ''}
      </div>
      <div class="mt-1" style="font-size:14px"><b>${esc(c.aspect || 'chi tiết')}</b></div>
      <div class="muted" style="font-size:13px">${esc(c.event_title || '')}</div>
    </div>
  </div>`
}

async function openRashomon(eventId) {
  drawer(loading('Đang mở các góc nhìn…'))
  try {
    const d = await api('/events/' + eventId + '/rashomon')
    MEM.activeEvent = d
    const e = d.event
    const ps = d.perspectives || []
    const cts = d.contradictions || []
    const conflictMemIds = new Set()
    cts.filter((x) => x.status === 'OPEN').forEach((x) => { conflictMemIds.add(x.memory_a_id); conflictMemIds.add(x.memory_b_id) })

    drawer(`
      <div class="drawer-head">
        <div>
          <div class="badge dark"><i class="fa-solid ${EVT_ICON[e.event_type] || 'fa-calendar-day'}"></i> ${esc(EVT_LABEL[e.event_type] || e.event_type)}</div>
          <h2 class="mt-2">${esc(e.title)}</h2>
          <div class="muted" style="font-size:14px">${e.event_date ? fmtDay(e.event_date) : 'chưa rõ ngày'}${e.location ? ' · ' + esc(e.location) : ''}</div>
        </div>
        <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button>
      </div>

      ${d.involvedPersons && d.involvedPersons.length ? `<div class="row mt-3" style="gap:8px;flex-wrap:wrap">
        ${d.involvedPersons.map((p) => `<span class="presence-chip" data-p="${esc(p.id)}" style="cursor:pointer">${avatar(p, 'sm')} ${esc(p.full_name)}</span>`).join('')}
      </div>` : ''}

      <div class="row between mt-4">
        <h3 class="card-title">Chế độ Rashomon — ${ps.length} góc nhìn</h3>
        ${S.user ? `<div class="btn-group">
          <button class="btn quiet sm" id="rs-add"><i class="fa-solid fa-feather"></i> Thêm lời kể</button>
          <button class="btn ghost sm" id="rs-detect"><i class="fa-solid fa-wand-magic-sparkles"></i> Dò mâu thuẫn</button>
        </div>` : ''}
      </div>
      <div id="rs-detect-out"></div>

      ${ps.length === 0
        ? empty('fa-comment-dots', 'Chưa ai kể về sự kiện này.')
        : `<div class="rashomon mt-3">
            <div class="event-center">
              <i class="fa-solid fa-circle-nodes"></i> ${esc(e.title)}
            </div>
            ${ps.map((m, i) => perspectiveCard(m, i, conflictMemIds.has(m.id))).join('')}
           </div>`}

      ${cts.length ? `<div class="card mt-4">
        <div class="card-head"><h3 class="card-title"><i class="fa-solid fa-triangle-exclamation warn"></i> Điểm lệch giữa các lời kể</h3></div>
        ${cts.map((c) => `
          <div class="conflict-line">
            <div class="row between top">
              <div class="f1">
                <div class="row" style="gap:6px">
                  <span class="badge ${c.severity === 'HIGH' ? 'red' : c.severity === 'MEDIUM' ? 'warn' : ''}">${esc(c.severity)}</span>
                  <b>${esc(c.aspect || 'chi tiết')}</b>
                  ${c.status !== 'OPEN' ? `<span class="badge green">${c.status === 'CLARIFIED' ? 'đã làm rõ' : 'bỏ qua'}</span>` : ''}
                </div>
                <div class="mt-2" style="font-size:14px">
                  <div>▸ <b>${esc(c.teller_a || 'Lời kể A')}:</b> ${esc(c.claim_a || '')}</div>
                  <div class="mt-1">▸ <b>${esc(c.teller_b || 'Lời kể B')}:</b> ${esc(c.claim_b || '')}</div>
                </div>
                ${c.resolution_note ? `<div class="mt-2 muted" style="font-size:13px"><i class="fa-solid fa-quote-left"></i> ${esc(c.resolution_note)}</div>` : ''}
              </div>
              ${c.status === 'OPEN' && S.user ? `<button class="btn quiet sm" data-res="${esc(c.id)}">Ghi chú làm rõ</button>` : ''}
            </div>
          </div>`).join('')}
        <div class="muted mt-3" style="font-size:13px">
          <i class="fa-solid fa-circle-info"></i> AI chỉ đánh dấu. Không lời kể nào bị xoá hay sửa tự động.
        </div>
      </div>` : ''}
    `)

    $$('[data-p]', $('#overlay-root')).forEach((el) =>
      el.addEventListener('click', () => openPerson(el.getAttribute('data-p'))))
    $$('[data-res]', $('#overlay-root')).forEach((el) =>
      el.addEventListener('click', () => resolveModal(el.getAttribute('data-res'), eventId)))
    $('#rs-add') && $('#rs-add').addEventListener('click', () => newMemoryModal({ eventId, eventTitle: e.title }))
    $('#rs-detect') && $('#rs-detect').addEventListener('click', async () => {
      const out = $('#rs-detect-out')
      out.innerHTML = loading('AI đang so từng cặp lời kể…')
      try {
        const r = await api('/events/' + eventId + '/detect-contradictions', { method: 'POST' })
        if (r.detected === 0) {
          out.innerHTML = `<div class="alert ok mt-3">${esc(r.message || 'Không thấy điểm lệch nào giữa các lời kể.')}</div>`
        } else {
          out.innerHTML = `<div class="alert warn mt-3">Đã đánh dấu <b>${r.detected}</b> điểm lệch. Đang tải lại…</div>`
          setTimeout(() => openRashomon(eventId), 900)
        }
      } catch (err) {
        out.innerHTML = `<div class="alert danger mt-3">${esc(err.message)}${err.status === 503 ? '<br><span style="font-size:13px">Tính năng này cần LLM. Các phần khác vẫn hoạt động bình thường.</span>' : ''}</div>`
      }
    })
  } catch (e) { drawer(`<div class="drawer-head"><h2>Lỗi</h2><button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>${errBox(e)}`) }
}

function perspectiveCard(m, i, conflict) {
  const teller = { full_name: m.teller_name || 'Không rõ người kể', photo_url: m.teller_photo, is_alive: 1 }
  return `<div class="persp-col">
    <div class="persp-card ${conflict ? 'conflict' : ''}">
      <div class="persp-head">
        ${avatar(teller, 'sm')}
        <div class="f1">
          <b>${esc(m.teller_name || 'Khuyết danh')}</b>
          <div class="muted" style="font-size:12px">
            góc nhìn ${i + 1}${m.perspective ? ' · ' + esc(m.perspective) : ''}
            ${m.source === 'AI_INTERVIEW' ? ' · <i class="fa-solid fa-microphone-lines"></i> phỏng vấn AI' : ''}
          </div>
        </div>
        ${conflict ? '<span class="badge warn" title="Có điểm lệch với lời kể khác"><i class="fa-solid fa-triangle-exclamation"></i></span>' : ''}
      </div>
      <div class="persp-body">${esc(m.content)}</div>
      ${m.media_url ? `<audio controls src="${esc(m.media_url)}" style="width:100%;margin-top:8px"></audio>` : ''}
      <div class="muted mt-2" style="font-size:12px">
        ${m.event_date ? fmtDay(m.event_date) + ' · ' : ''}ghi ${fmtDate(m.created_at)}
      </div>
    </div>
  </div>`
}

function resolveModal(ctId, eventId) {
  modal(`<h3>Ghi chú làm rõ</h3>
    <p class="muted mt-2" style="font-size:14px">
      Ghi chú này do <b>bạn</b> — người thật trong họ — viết và ký tên. Hai lời kể gốc vẫn được giữ nguyên.
    </p>
    <div class="field mt-3"><label>Nội dung làm rõ</label>
      <textarea id="rs-note" rows="4" placeholder="Ví dụ: Bác Ba xác nhận đám cưới tổ chức hai ngày, nên cả hai lời kể đều đúng ở ngày khác nhau."></textarea></div>
    <div class="field"><label>Kết luận</label>
      <select id="rs-status">
        <option value="CLARIFIED">Đã làm rõ — giữ cả hai lời kể</option>
        <option value="DISMISSED">Không phải mâu thuẫn thật</option>
      </select></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="rs-save">Lưu ghi chú</button></div>`)
  $('#rs-save').addEventListener('click', async () => {
    try {
      await api('/contradictions/' + ctId + '/resolve', {
        method: 'POST', body: { note: $('#rs-note').value.trim(), status: $('#rs-status').value }
      })
      closeOverlay(); toast('Đã lưu ghi chú làm rõ.')
      openRashomon(eventId)
    } catch (e) { toast(e.message, 'err') }
  })
}

function openContradiction(ctId, list) {
  const c = (list || []).find((x) => x.id === ctId)
  if (!c) return
  modal(`<div class="row between"><h3>Điểm lệch: ${esc(c.aspect || '')}</h3>
      <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>
    <div class="muted mt-1" style="font-size:14px">${esc(c.event_title || '')}</div>
    <div class="grid c2 mt-3">
      <div class="persp-card"><div class="persp-head"><b>${esc(c.teller_a || 'Lời kể A')}</b></div>
        <div class="persp-body clamp3">${esc(c.memory_a_content || '')}</div>
        <div class="mt-2 red-t" style="font-size:13px"><b>Khẳng định:</b> ${esc(c.claim_a || '')}</div></div>
      <div class="persp-card"><div class="persp-head"><b>${esc(c.teller_b || 'Lời kể B')}</b></div>
        <div class="persp-body clamp3">${esc(c.memory_b_content || '')}</div>
        <div class="mt-2 red-t" style="font-size:13px"><b>Khẳng định:</b> ${esc(c.claim_b || '')}</div></div>
    </div>
    ${c.resolution_note ? `<div class="alert ok mt-3"><b>Ghi chú làm rõ:</b> ${esc(c.resolution_note)}</div>` : ''}
    <div class="row end mt-4">
      <button class="btn ghost" id="ct-goev">Xem toàn bộ sự kiện</button>
      ${c.status === 'OPEN' && S.user ? `<button class="btn gold" id="ct-res">Ghi chú làm rõ</button>` : ''}
    </div>`, { wide: true })
  $('#ct-goev').addEventListener('click', () => openRashomon(c.event_id))
  $('#ct-res') && $('#ct-res').addEventListener('click', () => resolveModal(c.id, c.event_id))
}

async function doMemSearch() {
  const q = $('#mem-q').value.trim()
  const out = $('#mem-search-out')
  if (!q) { out.innerHTML = ''; return }
  out.innerHTML = loading('Đang tìm…')
  try {
    const r = await api('/search?q=' + encodeURIComponent(q))
    const total = (r.memories || []).length + (r.persons || []).length + (r.advices || []).length + (r.events || []).length
    if (!total) { out.innerHTML = `<div class="alert warn mt-3">Không tìm thấy gì cho “${esc(q)}”.</div>`; return }
    out.innerHTML = `<div class="mt-3">
      <div class="muted" style="font-size:13px">${total} kết quả cho “${esc(q)}” · tìm không cần dấu: <code>${esc(r.queryNoTone || '')}</code></div>
      ${(r.persons || []).length ? `<div class="mt-3"><b style="font-size:14px">Người</b><div class="list">
        ${r.persons.map((p) => `<div class="list-item clickable" data-sp="${esc(p.id)}">${avatar(p, 'sm')}
          <div class="f1"><b>${esc(p.full_name)}</b> <span class="muted">${esc(lifespan(p))}</span></div></div>`).join('')}
      </div></div>` : ''}
      ${(r.events || []).length ? `<div class="mt-3"><b style="font-size:14px">Sự kiện</b><div class="list">
        ${r.events.map((e) => `<div class="list-item clickable" data-se="${esc(e.id)}">
          <div class="f1"><b>${esc(e.title)}</b> <span class="muted">${e.event_date ? fmtDay(e.event_date) : ''}</span></div></div>`).join('')}
      </div></div>` : ''}
      ${(r.memories || []).length ? `<div class="mt-3"><b style="font-size:14px">Ký ức</b><div class="list">
        ${r.memories.map((m) => `<div class="list-item"><div class="f1">
          <div class="clamp3" style="font-size:14px">${esc(m.content)}</div>
          <div class="muted" style="font-size:12px">${esc(m.subject_name || '')}${m.event_date ? ' · ' + fmtDay(m.event_date) : ''}</div>
        </div></div>`).join('')}
      </div></div>` : ''}
      ${(r.advices || []).length ? `<div class="mt-3"><b style="font-size:14px">Gia huấn</b><div class="list">
        ${r.advices.map((a) => `<div class="list-item"><div class="f1">
          <i class="fa-solid fa-quote-left gold-t"></i> ${esc(a.original_text)}
          <div class="muted" style="font-size:12px">${esc(a.spoken_by || '')}</div></div></div>`).join('')}
      </div></div>` : ''}
    </div>`
    $$('[data-sp]', out).forEach((el) => el.addEventListener('click', () => openPerson(el.getAttribute('data-sp'))))
    $$('[data-se]', out).forEach((el) => el.addEventListener('click', () => openRashomon(el.getAttribute('data-se'))))
  } catch (e) { out.innerHTML = errBox(e) }
}

async function newEventModal() {
  if (!requireLogin('tạo sự kiện')) return
  modal(`<h3>Sự kiện mới</h3>
    <div class="field mt-3"><label>Tiêu đề *</label><input id="ne-title" placeholder="Đám cưới ông Nguyễn Văn Bảo"></div>
    <div class="grid c2">
      <div class="field"><label>Ngày (dương lịch)</label><input id="ne-date" type="date"></div>
      <div class="field"><label>Loại</label><select id="ne-type">
        ${Object.keys(EVT_LABEL).map((k) => `<option value="${k}">${EVT_LABEL[k]}</option>`).join('')}
      </select></div>
    </div>
    <div class="grid c2">
      <div class="field"><label>Địa điểm</label><input id="ne-loc" placeholder="Làng Đông Ngạc, Hà Nội"></div>
      <div class="field"><label>Tầm quan trọng</label><select id="ne-sig">
        <option value="FAMILY">Gia đình</option><option value="CLAN">Dòng họ</option>
        <option value="HISTORICAL">Gắn với sử</option></select></div>
    </div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="ne-save">Tạo</button></div>`)
  $('#ne-save').addEventListener('click', async () => {
    const title = $('#ne-title').value.trim()
    if (!title) return toast('Cần tiêu đề.', 'warn')
    try {
      await api('/events', { method: 'POST', body: {
        title, event_date: $('#ne-date').value || null, event_type: $('#ne-type').value,
        location: $('#ne-loc').value.trim() || null, significance: $('#ne-sig').value
      }})
      closeOverlay(); toast('Đã tạo sự kiện.')
      viewMemories($('#view-memories'))
    } catch (e) { toast(e.message, 'err') }
  })
}

async function newMemoryModal(ctx = {}) {
  if (!requireLogin('ghi ký ức')) return
  let persons = [], events = MEM.events
  try {
    const [p, e] = await Promise.all([api('/persons'), events.length ? Promise.resolve({ events }) : api('/events')])
    persons = p.persons || p.results || []
    events = e.events || []
  } catch (_) {}
  const pOpts = persons.map((p) => `<option value="${esc(p.id)}">${esc(p.full_name)}${p.is_alive ? '' : ' (đã mất)'}</option>`).join('')
  modal(`<h3>Ghi một lời kể</h3>
    <p class="muted mt-1" style="font-size:14px">Lời kể của bạn được giữ nguyên văn, đứng cạnh — không thay thế — lời kể của người khác.</p>
    <div class="field mt-3"><label>Nội dung *</label>
      <textarea id="nm-content" rows="6" placeholder="Bà tôi kể rằng hôm đó trời mưa rất to…"></textarea></div>
    <div class="grid c2">
      <div class="field"><label>Người kể</label><select id="nm-teller"><option value="">— chọn —</option>${pOpts}</select></div>
      <div class="field"><label>Nói về ai</label><select id="nm-subject"><option value="">— chọn —</option>${pOpts}</select></div>
    </div>
    <div class="grid c2">
      <div class="field"><label>Thuộc sự kiện</label><select id="nm-event"><option value="">— không —</option>
        ${events.map((e) => `<option value="${esc(e.id)}" ${ctx.eventId === e.id ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}
      </select></div>
      <div class="field"><label>Ngày xảy ra</label><input id="nm-date" type="date"></div>
    </div>
    <div class="grid c2">
      <div class="field"><label>Góc nhìn</label><input id="nm-persp" placeholder="ví dụ: người con thứ hai"></div>
      <div class="field"><label>Ai được xem</label><select id="nm-vis">
        <option value="CLAN">Cả dòng họ</option><option value="FAMILY">Gia đình</option>
        <option value="PRIVATE">Chỉ tôi</option><option value="PUBLIC">Công khai</option></select></div>
    </div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="nm-save">Lưu ký ức</button></div>`, { wide: true })
  $('#nm-save').addEventListener('click', async () => {
    const content = $('#nm-content').value.trim()
    if (!content) return toast('Cần nội dung.', 'warn')
    try {
      await api('/memories', { method: 'POST', body: {
        content, told_by_person_id: $('#nm-teller').value || null,
        subject_person_id: $('#nm-subject').value || null, event_id: $('#nm-event').value || null,
        event_date: $('#nm-date').value || null, perspective: $('#nm-persp').value.trim() || null,
        visibility: $('#nm-vis').value
      }})
      const ev = $('#nm-event') && $('#nm-event').value
      closeOverlay(); toast('Đã lưu ký ức.')
      if (ev) openRashomon(ev)
      else if (window.__PAGE__ === 'memories') viewMemories($('#view-memories'))
    } catch (e) { toast(e.message, 'err') }
  })
}

/* =====================================================================
   F5 — Gia Đạo Scroll (cuộn gia huấn)
   4.5.3: mọi câu là TRÍCH NGUYÊN VĂN, luôn kèm nguồn. Không AI sáng tác.
   ===================================================================== */
const EP_MEM = '/memories'

async function viewScroll(host) {
  host.innerHTML = loading('Đang mở cuộn Gia Đạo…')
  try {
    const d = await api('/advices')
    const cats = (d.categories || []).filter((c) => (c.items || []).length)
    host.innerHTML = `
      <div class="grid sidebar">
        <div class="col">
          ${d.total === 0
            ? `<div class="scroll-page">
                 <div class="scroll-title">Gia Đạo</div>
                 <div class="scroll-sub">Cuộn còn trắng</div>
                 ${empty('fa-scroll', 'Chưa có câu gia huấn nào. Gia huấn được TRÍCH từ ký ức đã ghi — không phải AI viết ra.',
                    S.user ? '<button class="btn gold" id="sc-extract"><i class="fa-solid fa-wand-magic-sparkles"></i> Trích từ ký ức</button>' : '')}
               </div>`
            : `<div class="scroll-page">
                 <div class="scroll-title">Gia Đạo</div>
                 <div class="scroll-sub">${esc((S.clan && S.clan.name) || 'Dòng họ')} · ${d.total} lời dạy được truyền lại</div>
                 ${cats.map((c, i) => `
                   <section class="scroll-chapter">
                     <div class="chapter-head">
                       <span class="chapter-num">${['Nhất', 'Nhị', 'Tam', 'Tứ', 'Ngũ'][i] || i + 1}</span>
                       <h2>${esc(c.label)}</h2>
                     </div>
                     ${c.items.map(adviceBlock).join('')}
                   </section>`).join('')}
               </div>`}
          <div id="sc-out"></div>
        </div>

        <div class="col">
          <div class="card dark mb-4">
            <div class="card-title gold-t"><i class="fa-solid fa-shield-halved"></i> Chống bịa đặt</div>
            <p class="mt-2" style="opacity:.85;font-size:14px">
              AI ở đây chỉ làm một việc: <b>nhóm</b> các câu đã có sẵn theo chủ đề.
              Trước khi lưu, hệ thống kiểm tra câu trích có <b>thật sự tồn tại</b> trong ký ức gốc
              (so khớp sau khi bỏ dấu). Không khớp → <b>từ chối</b>, không ghi vào cuộn.
            </p>
          </div>

          ${S.user ? `<div class="card mb-4">
            <div class="card-title">Trích gia huấn</div>
            <p class="muted mt-2" style="font-size:14px">
              Quét các ký ức đã được duyệt để tìm những câu dạy con cháu.
            </p>
            <button class="btn gold block mt-3" id="sc-extract2">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Chạy trích xuất
            </button>
          </div>` : ''}

          <div class="card paper">
            <div class="card-title">Vì sao phải nguyên văn?</div>
            <p class="mt-2" style="font-size:14px">
              Một câu ông bà dạy, nếu bị AI “viết cho hay hơn”, thì đó không còn là lời của ông bà nữa.
              Cuộn Gia Đạo giữ đúng chữ, đúng giọng, đúng người — kể cả khi câu ấy thô mộc.
            </p>
          </div>
        </div>
      </div>`

    const bindExtract = (el) => el && el.addEventListener('click', runExtract)
    bindExtract($('#sc-extract')); bindExtract($('#sc-extract2'))
    $$('[data-src]', host).forEach((el) =>
      el.addEventListener('click', () => showAdviceSource(el.getAttribute('data-src'))))
    $$('[data-sp2]', host).forEach((el) =>
      el.addEventListener('click', () => openPerson(el.getAttribute('data-sp2'))))
  } catch (e) { host.innerHTML = errBox(e) }
}

function adviceBlock(a) {
  return `<figure class="advice-quote">
    <blockquote>${esc(a.original_text)}</blockquote>
    <figcaption class="advice-meta">
      ${a.spoken_by_person_id
        ? `<span class="cite-chip" data-sp2="${esc(a.spoken_by_person_id)}" style="cursor:pointer">
             <i class="fa-solid fa-user"></i> ${esc(a.spoken_by_name || 'người trong họ')}
             ${a.is_alive === 0 ? ' <span class="muted">(đã mất)</span>' : ''}
           </span>`
        : '<span class="muted">chưa rõ người dạy</span>'}
      <span class="cite-chip" data-src="${esc(a.source_memory_id)}" style="cursor:pointer">
        <i class="fa-solid fa-link"></i> nguồn: ký ức #${esc(String(a.source_memory_id).slice(0, 8))}
      </span>
      ${a.approved_at ? '<span class="badge green"><i class="fa-solid fa-check"></i> hội đồng họ đã duyệt</span>' : '<span class="badge">chờ duyệt</span>'}
      ${a.audio_url ? `<audio controls src="${esc(a.audio_url)}" style="height:28px;vertical-align:middle"></audio>` : ''}
    </figcaption>
  </figure>`
}

async function showAdviceSource(memId) {
  modal(loading('Đang mở ký ức gốc…'))
  try {
    const d = await api(EP_MEM + '/' + memId)
    const m = d.memory
    modal(`<div class="row between"><h3>Ký ức gốc</h3>
        <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>
      <div class="muted mt-1" style="font-size:13px">
        ID <code>${esc(m.id)}</code> · ${esc(m.source === 'AI_INTERVIEW' ? 'từ buổi phỏng vấn AI' : m.source === 'MANUAL' ? 'nhập tay' : m.source)}
        ${m.event_date ? ' · ' + fmtDay(m.event_date) : ''}
      </div>
      <div class="card paper mt-3"><div style="white-space:pre-wrap;line-height:1.9">${esc(m.content)}</div></div>
      ${m.media_url ? `<audio controls src="${esc(m.media_url)}" style="width:100%;margin-top:12px"></audio>` : ''}
      <div class="alert ok mt-3" style="font-size:13px">
        <i class="fa-solid fa-check-double"></i> Câu gia huấn ở cuộn Gia Đạo là một đoạn <b>nguyên văn</b> nằm trong ký ức này.
      </div>`, { wide: true })
  } catch (e) { modal(`<h3>Lỗi</h3>${errBox(e)}<div class="row end mt-3"><button class="btn quiet" data-close>Đóng</button></div>`) }
}

async function runExtract() {
  if (!requireLogin('trích gia huấn')) return
  const out = $('#sc-out') || $('#view-scroll')
  out.innerHTML = `<div class="card mt-4">${loading('AI đang quét ký ức và trích nguyên văn…')}</div>`
  try {
    const r = await api('/advices/extract', { method: 'POST' })
    if (r.extracted === 0 && r.message) {
      out.innerHTML = `<div class="alert warn mt-4">${esc(r.message)}</div>`
      return
    }
    out.innerHTML = `<div class="card mt-4">
      <div class="card-title">Kết quả trích xuất</div>
      <div class="grid c3 mt-3">
        ${statBox('Ký ức đã quét', r.scanned || 0, 'nguồn')}
        ${statBox('Câu được ghi', r.extracted || 0, 'nguyên văn, có nguồn')}
        ${statBox('Bị từ chối', r.rejectedForHallucination || 0, 'không khớp ký ức gốc')}
      </div>
      ${r.rejectedForHallucination ? `<div class="alert danger mt-3">
        <b><i class="fa-solid fa-ban"></i> Đã chặn ${r.rejectedForHallucination} câu do AI diễn giải lại thay vì trích nguyên văn.</b>
        ${(r.rejectedSamples || []).length ? `<ul class="mt-2" style="font-size:13px">
          ${r.rejectedSamples.map((s) => `<li>“${esc(s)}…”</li>`).join('')}</ul>` : ''}
        <div class="mt-2" style="font-size:13px">Đây là hàng rào chống bịa đặt hoạt động đúng như thiết kế.</div>
      </div>` : `<div class="alert ok mt-3">Mọi câu đều khớp nguyên văn với ký ức gốc.</div>`}
      <button class="btn gold mt-3" onclick="location.reload()">Xem cuộn Gia Đạo</button>
    </div>`
  } catch (e) {
    out.innerHTML = `<div class="alert danger mt-4">${esc(e.message)}${e.status === 503
      ? '<br><span style="font-size:13px">Trích gia huấn cần LLM. Cuộn Gia Đạo vẫn xem được với dữ liệu đã có.</span>' : ''}</div>`
  }
}

/* =====================================================================
   F2 — AI Interviewer (phỏng vấn ông bà)
   4.2.6: AI luôn tự giới thiệu là AI, xin phép ghi âm, dừng lễ độ khi cụ buồn.
   8.4.4: transcript phải được con cháu DUYỆT mới thành Memory.
   ===================================================================== */
const ITV = { session: null, host: null, topic: null, t0: 0, ended: false }

const EMO_LABEL = {
  neutral: { l: 'bình thường', i: 'fa-face-meh', c: '' },
  happy: { l: 'vui', i: 'fa-face-smile', c: 'green' },
  nostalgic: { l: 'bồi hồi', i: 'fa-cloud', c: 'blue' },
  proud: { l: 'tự hào', i: 'fa-medal', c: 'gold' },
  sad: { l: 'buồn', i: 'fa-face-frown', c: 'warn' },
  sad_severe: { l: 'rất buồn', i: 'fa-heart-crack', c: 'red' },
  tired: { l: 'mệt', i: 'fa-bed', c: 'warn' }
}
const ST_LABEL = {
  SCHEDULED: ['đã hẹn', ''], IN_PROGRESS: ['đang kể', 'green'],
  PENDING_REVIEW: ['chờ duyệt', 'warn'], APPROVED: ['đã duyệt', 'gold'],
  COMPLETED: ['xong', ''], FAILED: ['lỗi', 'red']
}

async function viewInterview(host) {
  host.innerHTML = loading('Đang tải các buổi phỏng vấn…')
  try {
    const [d, h] = await Promise.all([api('/interviews'), api('/ai/hosts')])
    const sessions = d.sessions || []
    ITV.hosts = h.hosts; ITV.topics = h.topics; ITV.llmReady = h.llmReady

    host.innerHTML = `
      <div class="grid sidebar">
        <div class="col">
          ${!h.llmReady ? `<div class="alert warn mb-4">
            <b>Chưa cấu hình LLM.</b> Buổi phỏng vấn vẫn chạy được với bộ câu hỏi mồi
            (${(h.topics || []).reduce((n, t) => n + (t.questions || []).length, 0)} câu soạn sẵn theo chủ đề),
            nhưng AI sẽ không hỏi tiếp theo lời cụ kể.
          </div>` : ''}

          <div class="row between mb-3">
            <h2 class="card-title">Các buổi phỏng vấn</h2>
            ${S.user
              ? '<button class="btn gold" id="itv-new"><i class="fa-solid fa-microphone-lines"></i> Hẹn buổi mới</button>'
              : '<button class="btn gold" onclick="window.__auth()">Đăng nhập để hẹn</button>'}
          </div>

          ${sessions.length
            ? `<div class="list">${sessions.map(sessionRow).join('')}</div>`
            : empty('fa-microphone-lines',
                'Chưa có buổi phỏng vấn nào. Mỗi buổi là một lần ngồi xuống nghe ông bà kể — trước khi quá muộn.',
                S.user ? '<button class="btn gold" id="itv-new2">Hẹn buổi đầu tiên</button>' : '')}
        </div>

        <div class="col">
          <div class="card dark mb-4">
            <div class="card-title gold-t">AI không giả làm người</div>
            <p class="mt-2" style="opacity:.85;font-size:14px">
              Câu đầu tiên AI nói luôn là: <i>“cháu là trợ lý AI của Gia Sử Ký”</i>, kèm xin phép ghi âm.
              Nếu cụ tỏ ra buồn hoặc mệt, AI <b>tự dừng</b> một cách lễ độ — không cố khai thác thêm.
            </p>
          </div>

          <div class="card mb-4">
            <div class="card-head"><h3 class="card-title">Người dẫn AI</h3></div>
            <div class="list">
              ${(h.hosts || []).map((x) => `<div class="list-item">
                <span class="avatar sm living">${esc(initials(x.name))}</span>
                <div class="f1"><b>${esc(x.name)}</b>
                  <div class="muted" style="font-size:12px">${esc(x.desc || '')}</div></div>
              </div>`).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3 class="card-title">Chủ đề & câu hỏi mồi</h3></div>
            ${(h.topics || []).map((t) => `<div class="mb-3">
              <b style="font-size:14px">${esc(t.label)}</b>
              ${t.sensitive ? ' <span class="badge warn">nhạy cảm</span>' : ''}
              <div class="muted" style="font-size:13px">${(t.questions || []).length} câu hỏi soạn sẵn</div>
            </div>`).join('')}
          </div>
        </div>
      </div>`

    const bindNew = (el) => el && el.addEventListener('click', () => newInterviewModal())
    bindNew($('#itv-new')); bindNew($('#itv-new2'))
    $$('[data-itv]', host).forEach((el) =>
      el.addEventListener('click', () => openInterview(el.getAttribute('data-itv'))))

    const want = new URLSearchParams(location.search).get('session')
    if (want) openInterview(want)
  } catch (e) { host.innerHTML = errBox(e) }
}

function sessionRow(s) {
  const st = ST_LABEL[s.status] || [s.status, '']
  return `<div class="list-item clickable" data-itv="${esc(s.id)}">
    ${avatar({ full_name: s.interviewee_name, photo_url: s.interviewee_photo, is_alive: 1 }, 'lg')}
    <div class="f1">
      <div class="row" style="gap:6px">
        <b>${esc(s.interviewee_name)}</b>
        <span class="badge ${st[1]}">${st[0]}</span>
        ${s.channel === 'pstn_twilio' ? '<span class="badge dark"><i class="fa-solid fa-phone"></i> gọi điện</span>' : '<span class="badge dark"><i class="fa-solid fa-mobile-screen"></i> trong app</span>'}
        ${Number(s.memory_count) > 0 ? `<span class="badge green">${s.memory_count} ký ức đã tạo</span>` : ''}
      </div>
      <div class="muted" style="font-size:13px">
        chủ đề: ${esc((ITV.topics || []).find((t) => t.id === s.topic)?.label || s.topic)}
        · ${esc((ITV.hosts || []).find((x) => x.id === s.ai_host_id)?.name || '')}
        ${s.duration_seconds ? ' · ' + Math.round(s.duration_seconds / 60) + ' phút' : ''}
        · ${fmtDate(s.created_at)}
      </div>
    </div>
    <i class="fa-solid fa-chevron-right muted"></i>
  </div>`
}

async function newInterviewModal(personId, personName) {
  if (!requireLogin('hẹn buổi phỏng vấn')) return
  let persons = [], hosts = ITV.hosts, topics = ITV.topics
  try {
    const [p, h] = await Promise.all([
      api('/persons'),
      hosts ? Promise.resolve({ hosts, topics }) : api('/ai/hosts')
    ])
    persons = (p.persons || []).filter((x) => x.is_alive === 1 || x.is_alive === true)
    hosts = h.hosts; topics = h.topics
  } catch (_) {}

  modal(`<h3>Hẹn buổi phỏng vấn</h3>
    <p class="muted mt-1" style="font-size:14px">4 bước: chọn người · chọn giọng AI · chọn chủ đề · chọn kênh.</p>

    <div class="field mt-3"><label>1. Phỏng vấn ai? *</label>
      <select id="iv-person">
        <option value="">— chọn người còn sống —</option>
        ${persons.map((p) => `<option value="${esc(p.id)}" ${personId === p.id ? 'selected' : ''}>
          ${esc(p.full_name)}${p.birth_date ? ' (' + yr(p.birth_date) + ')' : ''}</option>`).join('')}
        ${personId && !persons.some((p) => p.id === personId)
          ? `<option value="${esc(personId)}" selected>${esc(personName || 'Người đã chọn')}</option>` : ''}
      </select>
      <div class="help">Chỉ phỏng vấn người còn sống. Người đã mất được tưởng nhớ qua Bàn Thờ Số.</div>
    </div>

    <div class="field"><label>2. Giọng người dẫn AI</label>
      <select id="iv-host">${(hosts || []).map((x) =>
        `<option value="${esc(x.id)}">${esc(x.name)} — ${esc(x.desc || x.region)}</option>`).join('')}</select>
      <div class="help">Chọn giọng vùng gần với cụ để cụ dễ nghe, dễ trò chuyện.</div>
    </div>

    <div class="grid c2">
      <div class="field"><label>3. Chủ đề</label>
        <select id="iv-topic">${(topics || []).map((t) =>
          `<option value="${esc(t.id)}">${esc(t.label)}${t.sensitive ? ' (nhạy cảm)' : ''}</option>`).join('')}</select></div>
      <div class="field"><label>Phương ngữ</label>
        <select id="iv-lang">
          <option value="VI_NORTH">Bắc</option><option value="VI_CENTRAL">Trung</option>
          <option value="VI_SOUTH" selected>Nam</option><option value="MIXED">Pha trộn</option>
        </select></div>
    </div>

    <div class="grid c2">
      <div class="field"><label>4. Kênh</label>
        <select id="iv-channel">
          <option value="app_voip">Trong ứng dụng (gõ / nói)</option>
          <option value="pstn_twilio">Gọi điện thoại thường (PSTN)</option>
        </select>
        <div class="help">Cụ không dùng smartphone? Chọn gọi điện thoại thường.</div></div>
      <div class="field"><label>Hẹn lúc (tuỳ chọn)</label><input id="iv-when" type="datetime-local"></div>
    </div>

    <div class="alert warn mt-3" style="font-size:13px">
      <b>Trước khi bắt đầu:</b> AI sẽ tự giới thiệu là AI và <b>xin phép ghi âm</b>.
      Nếu cụ không đồng ý, hãy dừng lại — chúng ta tôn trọng điều đó.
    </div>

    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="iv-save"><i class="fa-solid fa-check"></i> Tạo buổi phỏng vấn</button></div>`,
    { wide: true })

  $('#iv-save').addEventListener('click', async () => {
    const pid = $('#iv-person').value
    if (!pid) return toast('Cần chọn người được phỏng vấn.', 'warn')
    try {
      const r = await api('/interviews', { method: 'POST', body: {
        intervieweeId: pid, aiHostId: $('#iv-host').value, topic: $('#iv-topic').value,
        language: $('#iv-lang').value, channel: $('#iv-channel').value,
        scheduledAt: $('#iv-when').value || null
      }})
      closeOverlay(); toast('Đã tạo buổi phỏng vấn.')
      openInterview(r.id)
    } catch (e) {
      if (e.status === 429) toast(e.message, 'warn')
      else toast(e.message, 'err')
    }
  })
}

async function openInterview(id) {
  drawer(loading('Đang mở buổi phỏng vấn…'))
  try {
    const d = await api('/interviews/' + id)
    ITV.session = d.session; ITV.host = d.host; ITV.topic = d.topic; ITV.ended = false
    renderInterview()
  } catch (e) {
    drawer(`<div class="drawer-head"><h2>Lỗi</h2><button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>${errBox(e)}`)
  }
}

function renderInterview() {
  const s = ITV.session, h = ITV.host, t = ITV.topic
  const turns = s.transcript_raw || []
  const emos = s.emotion_timeline || []
  const st = ST_LABEL[s.status] || [s.status, '']
  const reviewMode = s.status === 'PENDING_REVIEW' || s.status === 'APPROVED'

  drawer(`
    <div class="drawer-head">
      <div class="row" style="gap:12px">
        ${avatar({ full_name: s.interviewee_name, photo_url: s.interviewee_photo, is_alive: 1 }, 'lg')}
        <div>
          <h2>${esc(s.interviewee_name)}</h2>
          <div class="muted" style="font-size:13px">
            <span class="badge ${st[1]}">${st[0]}</span>
            ${esc(t ? t.label : s.topic)} · người dẫn: ${esc(h.name)}
            ${s.channel === 'pstn_twilio' ? ' · qua điện thoại' : ''}
          </div>
        </div>
      </div>
      <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button>
    </div>

    ${s.channel === 'pstn_twilio' ? `<div class="alert mt-3" style="font-size:13px">
      <i class="fa-solid fa-phone"></i> Buổi này dự kiến qua điện thoại thường.
      Bản demo này chạy hội thoại ngay trong trình duyệt — bạn có thể gõ giúp cụ hoặc đọc to câu hỏi cho cụ nghe.
    </div>` : ''}

    ${reviewMode ? renderTranscriptReview(s, turns) : `
      <div class="alert ok mt-3" style="font-size:13px">
        <i class="fa-solid fa-robot"></i> AI sẽ tự giới thiệu là AI và xin phép ghi âm ở câu đầu.
        Bạn có thể dừng bất cứ lúc nào.
      </div>

      <div class="chat-box mt-3" id="iv-chat">
        ${turns.length
          ? turns.map((x, i) => turnBubble(x, i, emos)).join('')
          : `<div class="empty" style="padding:24px">
               <div class="ico"><i class="fa-solid fa-hand-sparkles"></i></div>
               Bấm “Bắt đầu” để AI mở lời.
             </div>`}
      </div>

      <div id="iv-emo" class="mt-2"></div>

      <div class="chat-input-row mt-3">
        ${turns.length
          ? `<textarea id="iv-text" rows="2" placeholder="Gõ lại lời cụ kể… (hoặc bấm micro để nói)"></textarea>
             <button class="btn quiet" id="iv-mic" title="Nói (Web Speech API)"><i class="fa-solid fa-microphone"></i></button>
             <button class="btn gold" id="iv-send"><i class="fa-solid fa-paper-plane"></i></button>`
          : `<button class="btn gold block" id="iv-start"><i class="fa-solid fa-play"></i> Bắt đầu buổi phỏng vấn</button>`}
      </div>

      ${turns.length ? `<div class="row between mt-3">
        <span class="muted" style="font-size:13px">${turns.filter((x) => x.role === 'interviewee').length} lượt cụ kể</span>
        <button class="btn ghost sm" id="iv-end"><i class="fa-solid fa-stop"></i> Kết thúc & duyệt transcript</button>
      </div>` : ''}
    `}
  `)

  if (reviewMode) { bindTranscriptReview(s, turns); return }

  $('#iv-start') && $('#iv-start').addEventListener('click', () => itvTurn({ action: 'start' }))
  $('#iv-send') && $('#iv-send').addEventListener('click', itvSend)
  $('#iv-text') && $('#iv-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) itvSend()
  })
  $('#iv-mic') && $('#iv-mic').addEventListener('click', itvMic)
  $('#iv-end') && $('#iv-end').addEventListener('click', async () => {
    try {
      await api('/interviews/' + ITV.session.id + '/end', { method: 'POST' })
      toast('Đã kết thúc. Giờ mời bạn duyệt transcript.')
      openInterview(ITV.session.id)
    } catch (e) { toast(e.message, 'err') }
  })
  const box = $('#iv-chat'); if (box) box.scrollTop = box.scrollHeight
}

function turnBubble(x, i, emos) {
  const ai = x.role === 'ai'
  const emo = (emos || []).find((e) => e.t === x.t && !ai)
  const em = emo ? EMO_LABEL[emo.emotion] || { l: emo.emotion, i: 'fa-face-meh', c: '' } : null
  return `<div class="bubble ${ai ? 'ai' : 'me'}">
    ${ai ? `<div class="muted" style="font-size:11px;margin-bottom:4px">
      <i class="fa-solid fa-robot"></i> ${esc(ITV.host ? ITV.host.name : 'AI')} (trợ lý AI)</div>` : ''}
    ${esc(x.content)}
    ${em ? `<span class="emotion-tag ${em.c}"><i class="fa-solid ${em.i}"></i> ${esc(em.l)}${emo.confidence ? ' ' + Math.round(emo.confidence * 100) + '%' : ''}</span>` : ''}
  </div>`
}

async function itvSend() {
  const ta = $('#iv-text')
  const txt = ta.value.trim()
  if (!txt) return
  ta.value = ''
  await itvTurn({ text: txt })
}

async function itvTurn(body) {
  const box = $('#iv-chat')
  if (body.text && box) {
    box.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(body.text)}</div>`)
    box.scrollTop = box.scrollHeight
  }
  if (box) {
    box.insertAdjacentHTML('beforeend',
      `<div class="bubble ai typing" id="iv-typing"><span></span><span></span><span></span></div>`)
    box.scrollTop = box.scrollHeight
  }
  try {
    const elapsed = Math.round((Date.now() - (ITV.t0 || (ITV.t0 = Date.now()))) / 1000)
    const r = await api('/interviews/' + ITV.session.id + '/turn', {
      method: 'POST', body: { ...body, elapsed }
    })
    $('#iv-typing') && $('#iv-typing').remove()
    if (body.action === 'start') { openInterview(ITV.session.id); return }
    if (box) {
      const em = r.emotion ? EMO_LABEL[r.emotion] || { l: r.emotion, i: 'fa-face-meh', c: '' } : null
      if (em) {
        const last = [...box.querySelectorAll('.bubble.me')].pop()
        if (last) last.insertAdjacentHTML('beforeend',
          `<span class="emotion-tag ${em.c}"><i class="fa-solid ${em.i}"></i> ${esc(em.l)}${r.emotionConfidence ? ' ' + Math.round(r.emotionConfidence * 100) + '%' : ''}</span>`)
      }
      box.insertAdjacentHTML('beforeend', `<div class="bubble ai">
        <div class="muted" style="font-size:11px;margin-bottom:4px"><i class="fa-solid fa-robot"></i> ${esc(r.host || 'AI')} (trợ lý AI)</div>
        ${esc(r.reply)}</div>`)
      box.scrollTop = box.scrollHeight
    }
    if (r.shouldEnd && !ITV.ended) {
      ITV.ended = true
      $('#iv-emo').innerHTML = `<div class="alert grief">
        <b><i class="fa-solid fa-hand"></i> AI đã chủ động dừng lại.</b><br>
        Hệ thống nhận thấy cụ đang xúc động hoặc đã kể lâu. Theo nguyên tắc P3,
        chúng ta không cố khai thác thêm. Buổi phỏng vấn chuyển sang bước duyệt transcript.
        <div class="mt-2"><button class="btn gold sm" id="iv-toreview">Duyệt transcript ngay</button></div>
      </div>`
      $('#iv-toreview').addEventListener('click', () => openInterview(ITV.session.id))
    }
  } catch (e) {
    $('#iv-typing') && $('#iv-typing').remove()
    toast(e.message, 'err')
  }
}

function itvMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return toast('Trình duyệt này không hỗ trợ nhận dạng giọng nói. Bạn gõ giúp cụ nhé.', 'warn')
  const rec = new SR()
  rec.lang = 'vi-VN'; rec.interimResults = true; rec.continuous = false
  const btn = $('#iv-mic')
  btn.classList.add('gold'); btn.innerHTML = '<i class="fa-solid fa-circle pulse-60"></i>'
  rec.onresult = (ev) => {
    let t = ''
    for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript
    $('#iv-text').value = t
  }
  rec.onerror = () => toast('Không nghe được. Bạn thử lại hoặc gõ tay nhé.', 'warn')
  rec.onend = () => { btn.classList.remove('gold'); btn.innerHTML = '<i class="fa-solid fa-microphone"></i>' }
  rec.start()
}

/* ---------------- 8.4.4 Transcript review (bắt buộc trước khi tạo Memory) --- */
function renderTranscriptReview(s, turns) {
  const said = turns.map((x, i) => ({ ...x, i })).filter((x) => x.role === 'interviewee')
  const approved = s.status === 'APPROVED'
  return `
    <div class="alert ${approved ? 'ok' : 'warn'} mt-3">
      ${approved
        ? '<b><i class="fa-solid fa-check-double"></i> Transcript đã được duyệt.</b> Các đoạn được chọn đã trở thành ký ức trong Memory Graph.'
        : `<b><i class="fa-solid fa-clipboard-check"></i> Cần bạn duyệt trước khi lưu.</b><br>
           Chỉ những đoạn bạn <b>tích chọn</b> mới trở thành ký ức. Bạn có thể sửa lỗi nghe sai —
           nhưng hãy giữ đúng ý và giọng của cụ.`}
    </div>

    <div class="row between mt-4">
      <h3 class="card-title">Transcript — ${said.length} đoạn cụ kể</h3>
      ${!approved ? `<div class="btn-group">
        <button class="btn quiet sm" id="tr-all">Chọn hết</button>
        <button class="btn quiet sm" id="tr-none">Bỏ hết</button>
      </div>` : ''}
    </div>

    ${said.map((x) => `
      <div class="transcript-turn ${approved ? 'approved' : ''}" data-turn="${x.i}">
        ${turns[x.i - 1] && turns[x.i - 1].role === 'ai'
          ? `<div class="muted" style="font-size:12px;margin-bottom:6px">
               <i class="fa-solid fa-robot"></i> AI hỏi: ${esc(turns[x.i - 1].content.slice(0, 120))}</div>` : ''}
        ${approved
          ? `<div style="line-height:1.85">${esc(x.content)}</div>`
          : `<label class="check">
               <input type="checkbox" class="tr-cb" data-i="${x.i}" checked>
               <span>Đưa đoạn này vào gia phả</span>
             </label>
             <textarea class="tr-txt mt-2" data-i="${x.i}" rows="3">${esc(x.content)}</textarea>`}
        <div class="muted mt-1" style="font-size:12px">phút thứ ${Math.round((x.t || 0) / 60)}</div>
      </div>`).join('')}

    ${!approved ? `<div class="row end mt-4">
      <button class="btn quiet" id="tr-skip">Để sau</button>
      <button class="btn gold" id="tr-approve"><i class="fa-solid fa-check"></i> Duyệt & tạo ký ức</button>
    </div>` : `<div class="row end mt-4">
      <button class="btn ghost" id="tr-mems">Xem ký ức đã tạo</button>
    </div>`}
    <div id="tr-out"></div>`
}

function bindTranscriptReview(s, turns) {
  const root = $('#overlay-root')
  $('#tr-all') && $('#tr-all').addEventListener('click', () =>
    $$('.tr-cb', root).forEach((cb) => (cb.checked = true)))
  $('#tr-none') && $('#tr-none').addEventListener('click', () =>
    $$('.tr-cb', root).forEach((cb) => (cb.checked = false)))
  $('#tr-skip') && $('#tr-skip').addEventListener('click', closeOverlay)
  $('#tr-mems') && $('#tr-mems').addEventListener('click', () =>
    openPerson(s.interviewee_person_id))
  $('#tr-approve') && $('#tr-approve').addEventListener('click', async () => {
    const idx = $$('.tr-cb', root).filter((cb) => cb.checked).map((cb) => Number(cb.getAttribute('data-i')))
    if (!idx.length) return toast('Chọn ít nhất một đoạn, hoặc bấm “Để sau”.', 'warn')
    const editedTexts = {}
    $$('.tr-txt', root).forEach((ta) => {
      const i = Number(ta.getAttribute('data-i'))
      if (idx.includes(i) && ta.value.trim() !== turns[i].content) editedTexts[String(i)] = ta.value.trim()
    })
    $('#tr-out').innerHTML = loading('Đang tạo ký ức và vector hoá…')
    try {
      const r = await api('/interviews/' + s.id + '/approve', {
        method: 'POST', body: { approvedTurnIndexes: idx, editedTexts }
      })
      toast(`Đã tạo ${r.memoriesCreated} ký ức từ lời cụ kể.`)
      openInterview(s.id)
    } catch (e) { $('#tr-out').innerHTML = `<div class="alert danger mt-3">${esc(e.message)}</div>` }
  })
}

/* =====================================================================
   Persona Chat (7.5 RAG + 7.6 anti-hallucination + 11.6 anti-scam)
   ===================================================================== */
async function personaChat(personId, personName) {
  if (!requireLogin('trò chuyện với ký ức')) return
  modal(loading('Đang kiểm tra đồng thuận…'), { wide: true })
  try {
    const st = await api('/personas/' + personId + '/status')
    if (!st.consentGranted) {
      modal(`<div class="row between"><h3>Chưa có đồng thuận</h3>
          <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>
        <div class="alert danger mt-3">
          <b><i class="fa-solid fa-lock"></i> Không thể trò chuyện với ký ức của ${esc(st.person.full_name)}.</b><br>
          Theo nguyên tắc <b>P2 — Đồng thuận trước mọi thứ</b>, phải có bản ghi đồng thuận
          phạm vi <code>chatbot_persona</code> còn hiệu lực, ký bằng phương thức mạnh
          (video, VNeID hoặc công chứng).
        </div>
        <p class="muted" style="font-size:14px">
          Đây không phải lỗi kỹ thuật — đó là hàng rào đạo đức. Người đã mất không thể phản đối,
          nên chúng ta phải cẩn trọng hơn, không ít hơn.
        </p>
        <div class="row end mt-4">
          <button class="btn quiet" data-close>Đóng</button>
          <button class="btn gold" id="pc-consent">Tạo bản ghi đồng thuận</button>
        </div>`, { wide: true })
      $('#pc-consent').addEventListener('click', () => consentModal(personId, st.person.full_name))
      return
    }

    const hist = await api('/personas/' + personId + '/messages')
    const msgs = hist.messages || []

    modal(`<div class="row between">
        <div class="row" style="gap:12px">
          ${avatar(st.person, 'lg')}
          <div><h3>${esc(st.person.full_name)}</h3>
            <div class="muted" style="font-size:13px">
              ${st.memoryCount} ký ức đã lưu · ${st.llmReady ? 'AI sẵn sàng' : 'chế độ trích nguyên văn (chưa có LLM)'}
            </div></div>
        </div>
        <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="alert mt-3" style="font-size:13px">
        <b><i class="fa-solid fa-robot"></i> Đây là AI dựng lại từ ký ức gia đình — không phải người thật.</b>
        Mọi câu trả lời chỉ dựa trên ký ức đã được duyệt, và luôn kèm nguồn.
      </div>

      <div class="chat-box mt-3" id="pc-box">
        ${msgs.length
          ? msgs.map(personaBubble).join('')
          : `<div class="bubble persona">
               <div class="muted" style="font-size:11px;margin-bottom:4px"><i class="fa-solid fa-robot"></i> ký ức của ${esc(st.person.full_name)}</div>
               Cháu muốn hỏi gì về chuyện ngày xưa?
             </div>`}
      </div>
      <div id="pc-grief"></div>

      <div class="chat-input-row mt-3">
        <textarea id="pc-text" rows="2" placeholder="Hỏi về một chuyện cụ thể: ngày cưới, làng cũ, nghề nhà…"></textarea>
        <button class="btn gold" id="pc-send"><i class="fa-solid fa-paper-plane"></i></button>
      </div>

      <details class="mt-3"><summary class="muted" style="font-size:13px;cursor:pointer">Hàng rào an toàn đang bật</summary>
        <ul class="mt-2" style="font-size:13px">
          ${(st.guardrails || []).map((g) => `<li>${esc(g)}</li>`).join('')}
        </ul></details>`, { wide: true })

    const send = async () => {
      const ta = $('#pc-text'), box = $('#pc-box')
      const msg = ta.value.trim()
      if (!msg) return
      ta.value = ''
      box.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(msg)}</div>`)
      box.insertAdjacentHTML('beforeend',
        `<div class="bubble persona typing" id="pc-typing"><span></span><span></span><span></span></div>`)
      box.scrollTop = box.scrollHeight
      try {
        const r = await api('/personas/' + personId + '/chat', { method: 'POST', body: { message: msg } })
        $('#pc-typing').remove()
        box.insertAdjacentHTML('beforeend', personaBubble({
          role: 'persona', content: r.reply, citations: r.citations,
          blocked: r.blocked, block_reason: r.blockReason
        }, r.citationDetails, r.noMatch))
        box.scrollTop = box.scrollHeight
        $('#pc-grief').innerHTML = r.grief
          ? `<div class="alert grief mt-2">
               <b><i class="fa-solid fa-heart"></i> ${esc(r.grief.message)}</b>
               ${r.grief.severe ? `<div class="mt-2"><a class="btn danger sm" href="tel:0963061414">Gọi 096 306 1414</a></div>` : ''}
             </div>` : ''
        $$('[data-cd]', box).forEach((el) => el.addEventListener('click', () =>
          showAdviceSource(el.getAttribute('data-cd'))))
      } catch (e) {
        $('#pc-typing') && $('#pc-typing').remove()
        box.insertAdjacentHTML('beforeend',
          `<div class="bubble sys"><i class="fa-solid fa-circle-exclamation"></i> ${esc(e.message)}</div>`)
      }
    }
    $('#pc-send').addEventListener('click', send)
    $('#pc-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    })
    $('#pc-box').scrollTop = $('#pc-box').scrollHeight
    $$('[data-cd]', $('#pc-box')).forEach((el) => el.addEventListener('click', () =>
      showAdviceSource(el.getAttribute('data-cd'))))
  } catch (e) {
    modal(`<h3>Lỗi</h3>${errBox(e)}<div class="row end mt-3"><button class="btn quiet" data-close>Đóng</button></div>`)
  }
}

function personaBubble(m, details, noMatch) {
  if (m.role === 'user') return `<div class="bubble me">${esc(m.content)}</div>`
  const cites = m.citations || []
  return `<div class="bubble persona">
    <div class="muted" style="font-size:11px;margin-bottom:4px">
      <i class="fa-solid fa-robot"></i> dựng từ ký ức gia đình</div>
    ${esc(m.content)}
    ${m.blocked ? `<div class="alert danger mt-2" style="font-size:12px">
      <i class="fa-solid fa-shield-halved"></i> Câu trả lời gốc đã bị chặn: ${esc(m.block_reason || 'vi phạm hàng rào an toàn')}
    </div>` : ''}
    ${noMatch ? `<div class="mt-2 muted" style="font-size:12px">
      <i class="fa-solid fa-circle-info"></i> Không tìm thấy ký ức khớp → AI <b>không được phép</b> đoán.
    </div>` : ''}
    ${cites.length ? `<div class="cites">
      ${cites.map((cid, i) => {
        const d = (details || []).find((x) => x.id === cid)
        return `<span class="cite-chip" data-cd="${esc(cid)}" title="${esc(d ? d.snippet : '')}" style="cursor:pointer">
          <i class="fa-solid fa-link"></i> nguồn ${i + 1}${d ? ' · độ khớp ' + d.score : ''}</span>`
      }).join('')}
    </div>` : ''}
  </div>`
}

/* =====================================================================
   F6 — Ritual Sync (nghi lễ trực tuyến đồng bộ)
   4.6: đếm ngược theo lịch âm, phòng lễ, dâng hương đồng bộ, karaoke gia huấn.
   ===================================================================== */
const RIT = { id: null, cursor: '1970-01-01 00:00:00', timer: null, cd: null, karaokeTimer: null }

const RTYPE = { GIO: 'Giỗ', TET: 'Tết', THANH_MINH: 'Thanh Minh', CAU_AN: 'Cầu an', OTHER: 'Khác' }
const RSTAGE = {
  STARTED: ['đang diễn ra', 'green'], T_MINUS_1H: ['còn dưới 1 giờ', 'red'],
  T_MINUS_1D: ['còn dưới 1 ngày', 'warn'], T_MINUS_7D: ['trong tuần này', 'gold'],
  FUTURE: ['sắp tới', '']
}

async function viewRituals(host) {
  host.innerHTML = loading('Đang tra lịch âm và các buổi lễ…')
  try {
    const [d, lc] = await Promise.all([api('/rituals'), api('/lunar/calendar')])
    const rituals = d.rituals || []
    const upcoming = rituals.filter((r) => !r.countdown.isPast && r.status !== 'COMPLETED')
    const past = rituals.filter((r) => r.countdown.isPast || r.status === 'COMPLETED')
    const next = upcoming[0]

    host.innerHTML = `
      <div class="grid sidebar">
        <div class="col">
          ${next ? `<div class="card dark mb-4">
            <div class="row between top">
              <div>
                <div class="badge gold">${esc(RTYPE[next.ritual_type] || next.ritual_type)}</div>
                <h2 class="mt-2 gold-t">${esc(next.title)}</h2>
                <div style="opacity:.8;font-size:14px">
                  ${next.subject_name ? esc(next.subject_name) + ' · ' : ''}
                  ${next.lunar_day}/${next.lunar_month} âm lịch · ${fmtDate(next.scheduled_at)}
                </div>
              </div>
              <span class="badge ${(RSTAGE[next.notifyStage] || [])[1] || ''}">${(RSTAGE[next.notifyStage] || [''])[0]}</span>
            </div>
            <div class="countdown mt-4" id="cd-${esc(next.id)}" data-at="${esc(next.scheduled_at)}">
              ${cdMarkup(next.countdown)}
            </div>
            <div class="row mt-4" style="gap:8px">
              <button class="btn gold" data-join="${esc(next.id)}"><i class="fa-solid fa-door-open"></i> Vào phòng lễ</button>
              ${S.user ? `<button class="btn on-dark" data-rsvp="${esc(next.id)}"><i class="fa-solid fa-hand"></i> Tôi sẽ dự</button>` : ''}
            </div>
            <div class="mt-3" style="opacity:.7;font-size:13px">
              ${next.yes_count || 0} người xác nhận dự · ${next.joined_count || 0} đã từng vào phòng
            </div>
          </div>` : ''}

          <div class="row between mb-3">
            <h2 class="card-title">Các buổi lễ sắp tới</h2>
            ${S.user
              ? '<button class="btn gold" id="rt-new"><i class="fa-solid fa-plus"></i> Lập buổi lễ</button>'
              : '<button class="btn gold" onclick="window.__auth()">Đăng nhập để lập lễ</button>'}
          </div>

          ${upcoming.length
            ? `<div class="list">${upcoming.map(ritualRow).join('')}</div>`
            : empty('fa-calendar-check', 'Chưa có buổi lễ nào được lập.',
                S.user ? '<button class="btn gold" id="rt-new2">Lập buổi lễ đầu tiên</button>' : '')}

          ${past.length ? `<div class="mt-4">
            <div class="card-head"><h3 class="card-title">Đã diễn ra</h3></div>
            <div class="list">${past.slice(0, 10).map(ritualRow).join('')}</div>
          </div>` : ''}
        </div>

        <div class="col">
          <div class="card paper mb-4">
            <div class="card-title">Hôm nay âm lịch</div>
            <div class="mt-2" style="font-family:var(--f-display);font-size:20px">
              ${esc(lc.lunarToday ? lc.lunarToday.label : '')}
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-head"><h3 class="card-title">Giỗ trong họ</h3></div>
            ${(lc.anniversaries || []).length
              ? `<div class="list">${lc.anniversaries.slice(0, 8).map((a) => `
                  <div class="list-item clickable" data-p3="${esc(a.personId)}">
                    ${avatar({ full_name: a.name, photo_url: a.photoUrl, is_alive: 0 }, 'sm')}
                    <div class="f1"><b>${esc(a.name)}</b>
                      <div class="muted" style="font-size:12px">${esc(a.lunarLabel)} → ${esc(a.solarDate)}</div></div>
                    <span class="badge ${a.daysUntil <= 7 ? 'red' : ''}">${a.daysUntil === 0 ? 'hôm nay' : 'còn ' + a.daysUntil + ' ngày'}</span>
                  </div>`).join('')}</div>`
              : '<div class="muted" style="font-size:14px">Chưa có ngày giỗ nào được ghi theo lịch âm.</div>'}
          </div>

          <div class="card mb-4">
            <div class="card-head"><h3 class="card-title">Lễ tiết trong năm</h3></div>
            <div class="timeline">
              ${(lc.holidays || []).slice(0, 9).map((h) => `<div class="timeline-item">
                <b style="font-size:14px">${esc(h.name)}</b>
                <div class="muted" style="font-size:12px">${esc(h.lunarLabel)} · ${esc(h.solarDate)}
                  · ${h.daysUntil === 0 ? 'hôm nay' : 'còn ' + h.daysUntil + ' ngày'}</div>
                <div class="muted" style="font-size:12px">${esc(h.note)}</div>
              </div>`).join('')}
            </div>
          </div>

          <div class="card dark">
            <div class="card-title gold-t">Đồng bộ thế nào?</div>
            <p class="mt-2" style="opacity:.85;font-size:14px">
              Khi một người trong họ cắm hương, mọi người ở phòng lễ đều thấy nén hương ấy hiện lên
              trong khoảng 2–3 giây — kể cả người đang ở nước ngoài.
              Bản này đồng bộ bằng polling; kiến trúc đầy đủ dùng SFU + pub/sub đa vùng.
            </p>
          </div>
        </div>
      </div>`

    const bindNew = (el) => el && el.addEventListener('click', () => newRitualModal())
    bindNew($('#rt-new')); bindNew($('#rt-new2'))
    $$('[data-p3]', host).forEach((el) => el.addEventListener('click', () => openPerson(el.getAttribute('data-p3'))))
    $$('[data-join]', host).forEach((el) => el.addEventListener('click', (e) => {
      e.stopPropagation(); openRitualRoom(el.getAttribute('data-join'))
    }))
    $$('[data-rsvp]', host).forEach((el) => el.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!requireLogin('xác nhận dự lễ')) return
      try { await api('/rituals/' + el.getAttribute('data-rsvp') + '/rsvp', { method: 'POST', body: { rsvp: 'YES' } })
        toast('Đã ghi nhận bạn sẽ dự lễ.') } catch (err) { toast(err.message, 'err') }
    }))
    $$('[data-rt]', host).forEach((el) => el.addEventListener('click', () => openRitualRoom(el.getAttribute('data-rt'))))

    if (next) startCountdown(next.id, next.scheduled_at)
    const want = new URLSearchParams(location.search).get('ritual')
    if (want) openRitualRoom(want)
  } catch (e) { host.innerHTML = errBox(e) }
}

function cdMarkup(cd) {
  if (!cd || cd.isPast) return '<div class="cd-unit"><b>đang diễn ra</b><span>vào phòng lễ ngay</span></div>'
  return `<div class="cd-unit"><b>${cd.days}</b><span>ngày</span></div>
    <div class="cd-unit"><b>${String(cd.hours).padStart(2, '0')}</b><span>giờ</span></div>
    <div class="cd-unit"><b>${String(cd.minutes).padStart(2, '0')}</b><span>phút</span></div>`
}

function startCountdown(id, at) {
  if (RIT.cd) clearInterval(RIT.cd)
  const tick = () => {
    const el = document.getElementById('cd-' + id)
    if (!el) { clearInterval(RIT.cd); return }
    const ms = new Date(at).getTime() - Date.now()
    el.innerHTML = cdMarkup({
      ms, isPast: ms < 0, days: Math.floor(ms / 86400000),
      hours: Math.floor((ms % 86400000) / 3600000), minutes: Math.floor((ms % 3600000) / 60000)
    })
  }
  RIT.cd = setInterval(tick, 30000); tick()
}

function ritualRow(r) {
  const st = RSTAGE[r.notifyStage] || ['', '']
  return `<div class="list-item clickable" data-rt="${esc(r.id)}">
    <div class="f1">
      <div class="row" style="gap:6px">
        <span class="badge dark">${esc(RTYPE[r.ritual_type] || r.ritual_type)}</span>
        <b>${esc(r.title)}</b>
        ${r.status === 'LIVE' ? '<span class="badge green pulse-60">đang mở</span>' : ''}
        ${r.status === 'COMPLETED' ? '<span class="badge">đã xong</span>' : `<span class="badge ${st[1]}">${st[0]}</span>`}
      </div>
      <div class="muted" style="font-size:13px">
        ${r.subject_name ? esc(r.subject_name) + ' · ' : ''}${r.lunar_day}/${r.lunar_month} âm lịch
        · ${fmtDate(r.scheduled_at)}${r.altar_name ? ' · ' + esc(r.altar_name) : ''}
      </div>
    </div>
    <span class="badge">${r.yes_count || 0} dự</span>
  </div>`
}

async function newRitualModal() {
  if (!requireLogin('lập buổi lễ')) return
  let persons = [], altars = []
  try {
    const [p, a] = await Promise.all([api('/persons'), api('/altars')])
    persons = (p.persons || []).filter((x) => x.is_alive === 0)
    altars = a.altars || []
  } catch (_) {}
  modal(`<h3>Lập buổi lễ</h3>
    <p class="muted mt-1" style="font-size:14px">Ngày giỗ đặt theo <b>âm lịch</b>; hệ thống tự quy đổi sang dương lịch mỗi năm.</p>
    <div class="field mt-3"><label>Tiêu đề *</label><input id="rt-title" placeholder="Giỗ cụ Nguyễn Văn Bảo lần thứ 18"></div>
    <div class="grid c2">
      <div class="field"><label>Loại lễ</label><select id="rt-type">
        ${Object.keys(RTYPE).map((k) => `<option value="${k}">${RTYPE[k]}</option>`).join('')}</select></div>
      <div class="field"><label>Tưởng nhớ ai</label><select id="rt-subject">
        <option value="">— không cụ thể —</option>
        ${persons.map((p) => `<option value="${esc(p.id)}" data-d="${p.death_anniv_lunar_day || ''}" data-m="${p.death_anniv_lunar_month || ''}">
          ${esc(p.full_name)}${p.death_anniv_lunar_day ? ' (giỗ ' + p.death_anniv_lunar_day + '/' + p.death_anniv_lunar_month + ' ÂL)' : ''}</option>`).join('')}
      </select></div>
    </div>
    <div class="grid c3">
      <div class="field"><label>Ngày âm</label><input id="rt-ld" type="number" min="1" max="30" placeholder="15"></div>
      <div class="field"><label>Tháng âm</label><input id="rt-lm" type="number" min="1" max="12" placeholder="7"></div>
      <div class="field"><label>Giờ cúng</label><input id="rt-time" type="time" value="10:00"></div>
    </div>
    <div class="field"><label>Bàn thờ</label><select id="rt-altar">
      <option value="">— không gắn —</option>
      ${altars.map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Gia huấn đọc trong lễ (karaoke)</label>
      <textarea id="rt-gh" rows="4" placeholder="Mỗi dòng là một câu, cả họ cùng đọc theo…"></textarea>
      <div class="help">Mỗi dòng sẽ sáng lên lần lượt để cả họ cùng đọc — như karaoke.</div></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="rt-save">Lập lễ</button></div>`, { wide: true })

  $('#rt-subject').addEventListener('change', (e) => {
    const o = e.target.selectedOptions[0]
    if (o && o.getAttribute('data-d')) {
      $('#rt-ld').value = o.getAttribute('data-d')
      $('#rt-lm').value = o.getAttribute('data-m')
    }
  })
  $('#rt-save').addEventListener('click', async () => {
    const title = $('#rt-title').value.trim()
    const ld = parseInt($('#rt-ld').value, 10), lm = parseInt($('#rt-lm').value, 10)
    if (!title) return toast('Cần tiêu đề.', 'warn')
    if (!ld || !lm) return toast('Cần ngày và tháng âm lịch.', 'warn')
    try {
      const r = await api('/rituals', { method: 'POST', body: {
        title, ritualType: $('#rt-type').value, subjectPersonId: $('#rt-subject').value || null,
        lunarDay: ld, lunarMonth: lm, timeOfDay: $('#rt-time').value || '10:00',
        altarId: $('#rt-altar').value || null, giaHuanText: $('#rt-gh').value.trim() || null
      }})
      closeOverlay()
      toast(`Đã lập lễ — quy đổi sang ${String(r.scheduledAt).slice(0, 10)}.`)
      viewRituals($('#view-rituals'))
    } catch (e) { toast(e.message, 'err') }
  })
}

/* ---------------------------- Phòng lễ ----------------------------- */
async function openRitualRoom(id) {
  if (RIT.timer) { clearInterval(RIT.timer); RIT.timer = null }
  if (RIT.karaokeTimer) { clearInterval(RIT.karaokeTimer); RIT.karaokeTimer = null }
  drawer(loading('Đang vào phòng lễ…'))
  try {
    if (S.user) { try { await api('/rituals/' + id + '/join', { method: 'POST' }) } catch (_) {} }
    const d = await api('/rituals/' + id)
    RIT.id = id
    const r = d.ritual
    const joined = (d.participants || []).filter((p) => p.joined_at)
    const lines = (r.gia_huan_text || '').split('\n').map((x) => x.trim()).filter(Boolean)

    drawer(`
      <div class="drawer-head">
        <div>
          <div class="badge gold">${esc(RTYPE[r.ritual_type] || r.ritual_type)}${r.status === 'LIVE' ? ' · đang mở' : ''}</div>
          <h2 class="mt-2">${esc(r.title)}</h2>
          <div class="muted" style="font-size:13px">
            ${r.lunar_day}/${r.lunar_month} âm lịch · ${fmtDate(r.scheduled_at)}
            ${r.subject_name ? ' · tưởng nhớ ' + esc(r.subject_name) : ''}
          </div>
        </div>
        <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button>
      </div>

      ${d.countdown && !d.countdown.isPast ? `<div class="alert warn mt-3">
        <b>Buổi lễ chưa tới giờ.</b> Bạn vẫn có thể vào trước để chuẩn bị, thắp hương sẽ được ghi nhận vào sổ lễ.
        <div class="countdown mt-3" id="cd-room" data-at="${esc(r.scheduled_at)}">${cdMarkup(d.countdown)}</div>
      </div>` : ''}

      <div class="ritual-room mt-3">
        <div class="altar-stage theme-${esc(r.religion_theme || 'KhongTonGiao')}" style="min-height:280px">
          ${r.horizontal_scroll_text ? `<div class="hoanh-phi">${esc(r.horizontal_scroll_text)}</div>` : ''}
          ${r.subject_photo || r.subject_name ? `<div class="altar-portraits">
            <figure class="portrait-frame">
              ${r.subject_photo ? `<img src="${esc(r.subject_photo)}" alt="${esc(r.subject_name)}">`
                : `<div class="portrait-name" style="padding:28px 10px">${esc(initials(r.subject_name))}</div>`}
              <figcaption class="portrait-name">${esc(r.subject_name || '')}</figcaption>
            </figure>
          </div>` : ''}
          <div class="altar-table">
            <div class="candle" id="rm-cl"><div class="candle-body"></div><div class="flame"></div></div>
            <div class="censer">
              <div class="incense-sticks" id="rm-sticks"></div>
              <div class="smoke-layer" id="rm-smoke"></div>
              <div class="censer-bowl"></div>
            </div>
            <div class="candle" id="rm-cr"><div class="candle-body"></div><div class="flame"></div></div>
          </div>
          <div class="presence-bar" id="rm-presence"></div>
        </div>

        <div class="altar-actions mt-3">
          <button class="btn gold" id="rm-incense"><i class="fa-solid fa-fire"></i> Dâng hương</button>
          <button class="btn ghost" id="rm-prayer"><i class="fa-solid fa-hands-praying"></i> Khấn</button>
          <button class="btn ghost" id="rm-flower"><i class="fa-solid fa-spa"></i> Dâng hoa</button>
        </div>
      </div>

      ${lines.length ? `<div class="karaoke mt-4">
        <div class="row between">
          <h3 class="card-title">Gia huấn — cả họ cùng đọc</h3>
          <button class="btn quiet sm" id="rm-kara"><i class="fa-solid fa-play"></i> Bắt đầu đọc</button>
        </div>
        <div class="mt-3" id="rm-lines">
          ${lines.map((l, i) => `<div class="karaoke-line" data-k="${i}">${esc(l)}</div>`).join('')}
        </div>
      </div>` : ''}

      <div class="grid c2 mt-4">
        <div class="card">
          <div class="card-head"><h3 class="card-title">Người đang dự (${joined.length})</h3></div>
          <div class="participant-grid" id="rm-parts">
            ${(d.participants || []).length
              ? d.participants.map((p) => `<div class="participant ${p.joined_at ? 'live' : ''}">
                  ${avatar({ full_name: p.full_name, photo_url: p.avatar_url, is_alive: 1 }, 'lg')}
                  <div style="font-size:12px">${esc(p.full_name)}</div>
                  <div class="muted" style="font-size:11px">${p.joined_at ? 'đang dự' : p.rsvp === 'YES' ? 'sẽ dự' : p.rsvp === 'NO' ? 'không dự' : 'chưa rõ'}</div>
                </div>`).join('')
              : '<div class="muted" style="font-size:14px">Chưa ai vào phòng.</div>'}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3 class="card-title">Sổ lễ</h3></div>
          <div class="timeline" id="rm-log">
            ${(d.events || []).length
              ? d.events.map(logItem).join('')
              : '<div class="muted" style="font-size:14px">Chưa có hành động nào.</div>'}
          </div>
        </div>
      </div>

      <div class="alert mt-4" style="font-size:13px">
        <i class="fa-solid fa-wifi"></i> Đồng bộ: <b>${esc(d.transport ? d.transport.mode : 'poll-sync')}</b>.
        ${esc(d.transport ? d.transport.note : '')}
      </div>

      ${S.user && r.status !== 'COMPLETED' ? `<div class="row end mt-3">
        <button class="btn quiet" id="rm-complete">Kết thúc buổi lễ</button>
      </div>` : ''}
    `)

    // khôi phục hương đã cắm
    const inc = (d.events || []).filter((x) => x.type === 'INCENSE').length
    ALTAR.sticks = 0
    const sticksEl = $('#rm-sticks')
    for (let i = 0; i < Math.min(inc, 12); i++) addStickTo(sticksEl, i)
    startSmokeIn('#rm-smoke')
    renderPresence('#rm-presence', d.events || [])

    $('#rm-incense').addEventListener('click', () => ritualRoomAct('INCENSE'))
    $('#rm-prayer').addEventListener('click', () => {
      if (!requireLogin('khấn')) return
      const t = prompt('Lời khấn của bạn (chỉ người trong họ đọc được):')
      if (t && t.trim()) ritualRoomAct('PRAYER', { text: t.trim() })
    })
    $('#rm-flower').addEventListener('click', () => ritualRoomAct('FLOWER'))
    $('#rm-kara') && $('#rm-kara').addEventListener('click', () => runKaraoke(lines.length))
    $('#rm-complete') && $('#rm-complete').addEventListener('click', async () => {
      try {
        const s = await api('/rituals/' + id + '/complete', { method: 'POST' })
        toast('Buổi lễ đã kết thúc. Sổ lễ được lưu lại.')
        closeOverlay(); viewRituals($('#view-rituals'))
      } catch (e) { toast(e.message, 'err') }
    })
    if (d.countdown && !d.countdown.isPast) startCountdown('room', r.scheduled_at)

    RIT.cursor = (d.events && d.events[0] && d.events[0].created_at) || '1970-01-01 00:00:00'
    RIT.timer = setInterval(pollRitual, 2500)
  } catch (e) {
    drawer(`<div class="drawer-head"><h2>Lỗi</h2><button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>${errBox(e)}`)
  }
}

function addStickTo(host, i) {
  if (!host) return
  const s = document.createElement('span')
  s.className = 'stick'
  s.style.setProperty('--i', String(i))
  s.style.left = 18 + i * 7 + 'px'
  s.style.transform = `rotate(${(i % 5) * 3 - 6}deg)`
  host.appendChild(s)
}

function startSmokeIn(sel) {
  const el = $(sel)
  if (!el) return
  const puff = () => {
    if (!document.body.contains(el)) return
    const s = document.createElement('span')
    s.className = 'smoke'
    s.style.left = 30 + Math.random() * 40 + 'px'
    s.style.animationDuration = 4 + Math.random() * 2.5 + 's'
    el.appendChild(s)
    setTimeout(() => s.remove(), 7000)
  }
  for (let i = 0; i < 3; i++) setTimeout(puff, i * 700)
  const iv = setInterval(() => {
    if (!document.body.contains(el)) { clearInterval(iv); return }
    puff()
  }, 1400)
}

function renderPresence(sel, events) {
  const el = $(sel)
  if (!el) return
  const names = []
  for (const e of events) {
    const n = e.actor || e.actor_name || e.user_name
    if (n && !names.includes(n)) names.push(n)
    if (names.length >= 6) break
  }
  el.innerHTML = names.length
    ? names.map((n) => `<span class="presence-chip"><span class="avatar sm living">${esc(initials(n))}</span> ${esc(n)}</span>`).join('')
    : ''
}

async function ritualRoomAct(type, payload = {}) {
  if (!requireLogin('tham gia nghi lễ')) return
  if (type === 'INCENSE') { addStickTo($('#rm-sticks'), ALTAR.sticks++); startSmokeIn('#rm-smoke') }
  const cid = 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  try {
    await api('/ritual-events', { method: 'POST', body: {
      ritualId: RIT.id, type, payload, clientEventId: cid
    }})
    stageToast(type === 'INCENSE' ? 'Bạn đã dâng một nén hương' : type === 'FLOWER' ? 'Bạn đã dâng hoa' : 'Lời khấn đã được ghi')
  } catch (e) {
    const q = JSON.parse(localStorage.getItem('gsk_queue') || '[]')
    q.push({ ritualId: RIT.id, type, payload, clientEventId: cid })
    localStorage.setItem('gsk_queue', JSON.stringify(q))
    toast('Mất kết nối — hành động được xếp hàng và sẽ gửi lại.', 'warn')
  }
}

async function pollRitual() {
  if (!RIT.id || !document.querySelector('#rm-log')) {
    if (RIT.timer) { clearInterval(RIT.timer); RIT.timer = null }
    return
  }
  try {
    const r = await api('/ritual-events/stream?ritualId=' + encodeURIComponent(RIT.id) +
      '&since=' + encodeURIComponent(RIT.cursor))
    if (r.cursor) RIT.cursor = r.cursor
    const log = $('#rm-log')
    for (const e of (r.events || []).slice().reverse()) {
      if (log) log.insertAdjacentHTML('afterbegin', logItem(e))
      if (e.type === 'INCENSE') { addStickTo($('#rm-sticks'), ALTAR.sticks++); startSmokeIn('#rm-smoke') }
      if (e.type === 'JOIN') stageToast(`${e.actor || 'Một người trong họ'} vừa vào phòng lễ`)
    }
    if ((r.events || []).length) renderPresence('#rm-presence', r.events)
  } catch (_) {}
}

function runKaraoke(n) {
  if (RIT.karaokeTimer) clearInterval(RIT.karaokeTimer)
  const lines = $$('.karaoke-line')
  lines.forEach((l) => l.classList.remove('active', 'done'))
  let i = 0
  const step = () => {
    if (i > 0) { lines[i - 1].classList.remove('active'); lines[i - 1].classList.add('done') }
    if (i >= n) { clearInterval(RIT.karaokeTimer); RIT.karaokeTimer = null; return }
    lines[i].classList.add('active')
    lines[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    i++
  }
  step()
  RIT.karaokeTimer = setInterval(step, 4200)
}

/* =====================================================================
   F7 — Consent Ledger & Digital Will
   P2: Đồng thuận trước mọi thứ. 11.5.3: phạm vi rủi ro cao cần ký mạnh.
   4.7.2 Right to Rest · 4.7.3 Di chúc số · 4.7.4 Xác nhận qua đời.
   ===================================================================== */
const SIG_LABEL = {
  NATIONAL_EID: 'VNeID (định danh quốc gia)',
  VIDEO_CONSENT: 'Video đồng thuận (~30 giây)',
  NOTARY: 'Công chứng',
  HANDWRITTEN_SCAN: 'Bản ký tay chụp lại'
}
const RISK_BADGE = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'warn', LOW: '' }
const CST_LABEL = {
  active: ['còn hiệu lực', 'green'], revoked: ['đã thu hồi', 'red'],
  sunset: ['đã cho yên nghỉ', 'gold'], pending: ['chờ', 'warn']
}

async function viewConsent(host) {
  host.innerHTML = loading('Đang mở sổ đồng thuận…')
  try {
    const [sc, cs, rr, wl] = await Promise.all([
      api('/consent/scopes'), api('/consent'), api('/rest-requests'),
      api('/wills').catch(() => ({ wills: [] }))
    ])
    const scopes = sc.scopes || []
    const records = cs.records || []
    const active = records.filter((r) => r.status === 'active')

    host.innerHTML = `
      <div class="grid sidebar">
        <div class="col">
          <div class="alert mb-4">
            <b><i class="fa-solid fa-scale-balanced"></i> Đây là hồ sơ pháp lý, không phải một cái ô tích.</b><br>
            Mỗi bản ghi ở đây có phạm vi rõ ràng, thời hạn, phương thức ký, mã băm bất biến
            và điều khoản “Quyền được yên nghỉ”. Người đã mất không thể phản đối — nên chúng ta
            phải cẩn trọng hơn, không ít hơn.
          </div>

          <div class="grid c3 mb-4">
            ${statBox('Bản ghi đồng thuận', records.length, 'tổng cộng')}
            ${statBox('Còn hiệu lực', active.length, 'đang bảo vệ')}
            ${statBox('Yêu cầu yên nghỉ', (rr.requests || []).length, 'Right to Rest')}
          </div>

          <div class="row between mb-3">
            <h2 class="card-title">Sổ đồng thuận</h2>
            ${S.user
              ? '<button class="btn gold" id="cs-new"><i class="fa-solid fa-file-signature"></i> Tạo bản ghi</button>'
              : '<button class="btn gold" onclick="window.__auth()">Đăng nhập</button>'}
          </div>

          ${records.length
            ? `<table class="tbl">
                 <thead><tr><th>Người được bảo vệ</th><th>Phạm vi</th><th>Ký bằng</th><th>Trạng thái</th><th></th></tr></thead>
                 <tbody>${records.map(consentRow).join('')}</tbody>
               </table>`
            : empty('fa-file-shield', 'Chưa có bản ghi đồng thuận nào. Không có đồng thuận → mọi tính năng AI về người đó đều bị chặn.',
                S.user ? '<button class="btn gold" id="cs-new2">Tạo bản ghi đầu tiên</button>' : '')}

          <div class="card mt-4">
            <div class="card-head">
              <h3 class="card-title">Quyền được yên nghỉ</h3>
              <span class="badge">${(rr.requests || []).length}</span>
            </div>
            <p class="muted" style="font-size:14px">
              Bất cứ lúc nào, người kế thừa có thể yêu cầu <b>tắt vĩnh viễn</b> mọi tương tác AI
              với người đã mất. Cần đủ số phiếu đồng ý mới thực hiện — để không ai đơn phương quyết định.
            </p>
            ${(rr.requests || []).length ? `<div class="list mt-3">
              ${rr.requests.map((r) => `<div class="list-item">
                <div class="f1">
                  <div class="row" style="gap:6px">
                    <b>${esc(r.subject_name)}</b>
                    <span class="badge ${r.status === 'EXECUTED' ? 'gold' : 'warn'}">${r.status === 'EXECUTED' ? 'đã thực hiện' : 'đang chờ phiếu'}</span>
                    <span class="badge ${r.mode === 'HARD_DELETE' ? 'red' : ''}">${r.mode === 'HARD_DELETE' ? 'xoá hẳn' : 'ngưng tương tác'}</span>
                  </div>
                  <div class="muted" style="font-size:13px">
                    ${(r.approvals || []).length}/${r.required_approvals} phiếu · yêu cầu ${fmtDate(r.created_at)}
                  </div>
                </div>
                ${r.status !== 'EXECUTED' && S.user
                  ? `<button class="btn quiet sm" data-rra="${esc(r.id)}">Đồng ý</button>` : ''}
              </div>`).join('')}
            </div>` : '<div class="muted mt-3" style="font-size:14px">Chưa có yêu cầu nào.</div>'}
          </div>

          <div class="card mt-4">
            <div class="card-head">
              <h3 class="card-title">Di chúc số</h3>
              ${S.user ? '<button class="btn quiet sm" id="wl-new">Lập di chúc</button>' : ''}
            </div>
            ${(wl.wills || []).length
              ? `<div class="list">${wl.wills.map((w) => `<div class="list-item">
                  <div class="f1">
                    <div class="row" style="gap:6px">
                      <b>${esc(w.testator_name)}</b>
                      <span class="badge ${w.status === 'activated' ? 'gold' : w.status === 'signed' ? 'green' : ''}">
                        ${w.status === 'activated' ? 'đã kích hoạt' : w.status === 'signed' ? 'đã ký' : 'bản nháp'}</span>
                      <span class="badge">${(w.witness_ids || []).length} nhân chứng</span>
                    </div>
                    <div class="muted" style="font-size:13px">
                      ${(w.inheritors || []).length} người kế thừa
                      ${w.post_mortem_instructions && w.post_mortem_instructions.activateMemorialMode ? ' · bật chế độ tưởng niệm' : ''}
                      ${w.activated_at ? ' · kích hoạt ' + fmtDate(w.activated_at) : ''}
                    </div>
                  </div>
                  ${w.status !== 'activated' && S.user
                    ? `<button class="btn quiet sm" data-wla="${esc(w.id)}">Xác nhận qua đời</button>` : ''}
                </div>`).join('')}</div>`
              : '<div class="muted" style="font-size:14px">Chưa có di chúc số nào.</div>'}
          </div>

          ${S.user ? `<div class="card mt-4">
            <div class="card-head">
              <h3 class="card-title">Sổ nhật ký bất biến</h3>
              <button class="btn quiet sm" id="cs-audit">Xem</button>
            </div>
            <p class="muted" style="font-size:14px">
              Mọi hành động liên quan tới đồng thuận, AI, ký ức đều được ghi lại — ai làm, lúc nào, từ đâu.
            </p>
            <div id="cs-audit-out"></div>
          </div>` : ''}
        </div>

        <div class="col">
          <div class="card mb-4">
            <div class="card-head"><h3 class="card-title">Các phạm vi & mức rủi ro</h3></div>
            <div class="list">
              ${scopes.map((s) => `<div class="list-item">
                <div class="f1">
                  <div class="row" style="gap:6px">
                    <b style="font-size:14px">${esc(s.label)}</b>
                    <span class="badge ${RISK_BADGE[s.risk] || ''}">${esc(s.risk)}</span>
                  </div>
                  <div class="muted" style="font-size:12px"><code>${esc(s.id)}</code>${s.note ? ' · ' + esc(s.note) : ''}</div>
                </div>
              </div>`).join('')}
            </div>
          </div>

          <div class="card dark mb-4">
            <div class="card-title gold-t">Ký mạnh là bắt buộc</div>
            <p class="mt-2" style="opacity:.85;font-size:14px">
              Nhân bản giọng nói, persona AI, tái tạo video, avatar 3D — bốn phạm vi này
              <b>chỉ</b> nhận Video Consent, VNeID hoặc công chứng. Ký tay chụp lại là <b>không đủ</b>;
              hệ thống sẽ trả về lỗi 422 chứ không lưu.
            </p>
          </div>

          <div class="card paper">
            <div class="card-title">Mã băm & công chứng số</div>
            <p class="mt-2" style="font-size:14px">
              Mỗi bản ghi được băm SHA-256 và ghi mã băm làm bằng chứng thời điểm.
              <b>Không có thông tin cá nhân nào</b> được đưa lên chuỗi — chỉ mã băm.
              Bạn có thể tự đối chiếu bằng nút “Kiểm chứng”.
            </p>
          </div>
        </div>
      </div>`

    const bindNew = (el) => el && el.addEventListener('click', () => consentModal())
    bindNew($('#cs-new')); bindNew($('#cs-new2'))
    $$('[data-cv]', host).forEach((el) => el.addEventListener('click', () => verifyConsent(el.getAttribute('data-cv'))))
    $$('[data-crv]', host).forEach((el) => el.addEventListener('click', () => revokeConsent(el.getAttribute('data-crv'))))
    $$('[data-crest]', host).forEach((el) => el.addEventListener('click', () => restRequestModal(el.getAttribute('data-crest'))))
    $$('[data-rra]', host).forEach((el) => el.addEventListener('click', async () => {
      try {
        const r = await api('/rest-requests/' + el.getAttribute('data-rra') + '/approve', { method: 'POST' })
        toast(r.status === 'EXECUTED'
          ? 'Đủ phiếu — đã cho yên nghỉ. Mọi tương tác AI đã ngưng.'
          : `Đã ghi phiếu (${r.approvals}/${r.required}).`)
        viewConsent(host)
      } catch (e) { toast(e.message, 'err') }
    }))
    $('#wl-new') && $('#wl-new').addEventListener('click', () => willModal())
    $$('[data-wla]', host).forEach((el) => el.addEventListener('click', () => activateWillModal(el.getAttribute('data-wla'))))
    $('#cs-audit') && $('#cs-audit').addEventListener('click', showAudit)
  } catch (e) { host.innerHTML = errBox(e) }
}

function consentRow(r) {
  const st = CST_LABEL[r.status] || [r.status, '']
  return `<tr>
    <td><div class="row" style="gap:8px">
      ${avatar({ full_name: r.subject_name, photo_url: r.subject_photo, is_alive: r.is_alive }, 'sm')}
      <div><b>${esc(r.subject_name)}</b>
        <div class="muted" style="font-size:12px">${r.is_alive ? 'còn sống' : 'đã mất'}</div></div>
    </div></td>
    <td>${(r.scope || []).map((s) => `<span class="badge dark" style="margin:2px"><code>${esc(s)}</code></span>`).join('')}</td>
    <td><span style="font-size:13px">${esc(SIG_LABEL[r.signature_method] || r.signature_method)}</span>
      <div class="muted" style="font-size:12px">${fmtDate(r.signed_at)}</div></td>
    <td><span class="badge ${st[1]}">${st[0]}</span>
      ${r.revoked_reason ? `<div class="muted" style="font-size:12px">${esc(r.revoked_reason)}</div>` : ''}</td>
    <td class="nowrap">
      <button class="btn quiet sm" data-cv="${esc(r.id)}">Kiểm chứng</button>
      ${r.status === 'active' && S.user ? `
        <button class="btn quiet sm" data-crv="${esc(r.id)}">Thu hồi</button>
        ${r.is_alive === 0 ? `<button class="btn quiet sm" data-crest="${esc(r.id)}">Cho yên nghỉ</button>` : ''}` : ''}
    </td>
  </tr>`
}

async function consentModal(personId, personName) {
  if (!requireLogin('tạo bản ghi đồng thuận')) return
  let persons = [], scopes = []
  try {
    const [p, s] = await Promise.all([api('/persons'), api('/consent/scopes')])
    persons = p.persons || []
    scopes = s.scopes || []
  } catch (_) {}

  modal(`<h3>Bản ghi đồng thuận mới</h3>
    <p class="muted mt-1" style="font-size:14px">
      Hãy đọc kỹ. Đây là văn bản có hiệu lực pháp lý trong hệ thống, không phải cài đặt tuỳ chọn.
    </p>

    <div class="field mt-3"><label>Người được bảo vệ *</label>
      <select id="co-person">
        <option value="">— chọn —</option>
        ${persons.map((p) => `<option value="${esc(p.id)}" ${personId === p.id ? 'selected' : ''}>
          ${esc(p.full_name)}${p.is_alive ? '' : ' (đã mất)'}</option>`).join('')}
        ${personId && !persons.some((p) => p.id === personId)
          ? `<option value="${esc(personId)}" selected>${esc(personName || '')}</option>` : ''}
      </select></div>

    <div class="field"><label>Phạm vi cho phép *</label>
      <div class="scope-grid" id="co-scopes">
        ${scopes.map((s) => `<label class="scope-item" data-risk="${esc(s.risk)}">
          <input type="checkbox" value="${esc(s.id)}" ${s.id === 'commercial_use' ? '' : ''}>
          <div class="f1">
            <b style="font-size:14px">${esc(s.label)}</b>
            <span class="badge ${RISK_BADGE[s.risk] || ''}">${esc(s.risk)}</span>
            <div class="muted" style="font-size:12px">${esc(s.note || '')}</div>
          </div>
        </label>`).join('')}
      </div>
      <div class="help">Sử dụng thương mại mặc định <b>tắt</b> — phải tự tay chọn riêng.</div>
    </div>

    <div class="field"><label>Phương thức ký *</label>
      <select id="co-sig">
        <option value="VIDEO_CONSENT">Video đồng thuận (~30 giây) — mạnh</option>
        <option value="NATIONAL_EID">VNeID — mạnh</option>
        <option value="NOTARY">Công chứng — mạnh</option>
        <option value="HANDWRITTEN_SCAN">Bản ký tay chụp lại — yếu</option>
      </select>
      <div class="help" id="co-sig-help"></div></div>

    <div class="field" id="co-video-wrap"><label>Đường dẫn video đồng thuận</label>
      <input id="co-video" placeholder="https://… (clip người ký nói rõ mình đồng ý)">
      <div class="help">Bắt buộc khi chọn Video Consent.</div></div>

    <div class="grid c2">
      <div class="field"><label>Hết hiệu lực (tuỳ chọn)</label><input id="co-end" type="date"></div>
      <div class="field"><label>Tự hết hạn nếu không dùng</label>
        <select id="co-sunset"><option value="5">sau 5 năm không tương tác</option>
          <option value="3">sau 3 năm</option><option value="10">sau 10 năm</option>
          <option value="0">không tự hết hạn</option></select></div>
    </div>

    <div class="field"><label>Quyền được yên nghỉ — cần bao nhiêu phiếu người kế thừa?</label>
      <select id="co-rtr"><option value="2">2 phiếu</option><option value="3">3 phiếu</option>
        <option value="1">1 phiếu</option></select>
      <div class="help">Số phiếu cần để tắt vĩnh viễn mọi tương tác AI về người này.</div></div>

    <div class="alert warn mt-3" style="font-size:13px">
      Bằng việc tạo bản ghi, bạn xác nhận đã có sự đồng thuận thật của người được bảo vệ
      hoặc của người kế thừa hợp pháp. Nội dung này được băm SHA-256 và ghi vào sổ bất biến.
    </div>

    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="co-save"><i class="fa-solid fa-file-signature"></i> Ký & lưu</button></div>
    <div id="co-out"></div>`, { wide: true })

  const syncSig = () => {
    const m = $('#co-sig').value
    const strong = ['VIDEO_CONSENT', 'NATIONAL_EID', 'NOTARY'].includes(m)
    $('#co-video-wrap').style.display = m === 'VIDEO_CONSENT' ? '' : 'none'
    $('#co-sig-help').innerHTML = strong
      ? 'Đủ mạnh cho mọi phạm vi, kể cả rủi ro cao.'
      : '<b class="red-t">Chỉ dùng được cho phạm vi rủi ro thấp/trung.</b> Nếu chọn nhân bản giọng, persona AI, video hay avatar 3D, hệ thống sẽ từ chối (422).'
  }
  $('#co-sig').addEventListener('change', syncSig); syncSig()
  $$('#co-scopes .scope-item').forEach((el) => {
    const cb = el.querySelector('input')
    cb.addEventListener('change', () => el.classList.toggle('on', cb.checked))
  })

  $('#co-save').addEventListener('click', async () => {
    const pid = $('#co-person').value
    const scope = $$('#co-scopes input:checked').map((cb) => cb.value)
    if (!pid) return toast('Cần chọn người được bảo vệ.', 'warn')
    if (!scope.length) return toast('Cần chọn ít nhất một phạm vi.', 'warn')
    const sunset = Number($('#co-sunset').value)
    try {
      const r = await api('/consent', { method: 'POST', body: {
        subjectPersonId: pid, scope, signatureMethod: $('#co-sig').value,
        videoConsentUrl: $('#co-video').value.trim() || null,
        timeEnd: $('#co-end').value || null,
        autoSunset: { enabled: sunset > 0, inactiveYears: sunset || null },
        rightToRest: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: Number($('#co-rtr').value) }
      }})
      closeOverlay()
      toast('Đã ký và lưu bản ghi đồng thuận.')
      modal(`<h3>Bản ghi đã được lưu</h3>
        <dl class="kv mt-3">
          <dt>Mã bản ghi</dt><dd><code>${esc(r.id)}</code></dd>
          <dt>Mã băm SHA-256</dt><dd><code style="word-break:break-all">${esc(r.recordHash)}</code></dd>
          <dt>Mã công chứng số</dt><dd><code style="word-break:break-all">${esc(r.blockchainTxHash)}</code></dd>
          <dt>Trạng thái</dt><dd><span class="badge green">còn hiệu lực</span></dd>
        </dl>
        <div class="alert ok mt-3" style="font-size:13px">
          Không có thông tin cá nhân nào được đưa vào mã công chứng — chỉ mã băm.
        </div>
        <div class="row end mt-4"><button class="btn gold" onclick="location.reload()">Xong</button></div>`)
    } catch (e) {
      const req = e.problem && e.problem.requiredMethods
      $('#co-out').innerHTML = `<div class="alert danger mt-3">
        <b><i class="fa-solid fa-ban"></i> ${esc(e.message)}</b>
        ${req ? `<div class="mt-2" style="font-size:13px">Phương thức được chấp nhận: ${req.map((m) => `<code>${esc(m)}</code>`).join(', ')}</div>` : ''}
        ${e.status === 422 ? '<div class="mt-2" style="font-size:13px">Đây là hàng rào P2 hoạt động đúng thiết kế — không phải lỗi hệ thống.</div>' : ''}
      </div>`
    }
  })
}

async function verifyConsent(id) {
  modal(loading('Đang đối chiếu mã băm…'))
  try {
    const v = await api('/consent/' + id + '/verify')
    const st = CST_LABEL[v.status] || [v.status, '']
    modal(`<div class="row between"><h3>Kiểm chứng bản ghi</h3>
        <button class="x-btn" data-close><i class="fa-solid fa-xmark"></i></button></div>
      <dl class="kv mt-3">
        <dt>Mã bản ghi</dt><dd><code>${esc(v.consentId)}</code></dd>
        <dt>Trạng thái</dt><dd><span class="badge ${st[1]}">${st[0]}</span></dd>
        <dt>Mã băm đã lưu</dt><dd><code style="word-break:break-all">${esc(v.storedHash || '')}</code></dd>
        <dt>Băm lại hiện tại</dt><dd><code style="word-break:break-all">${esc(v.recomputedHash || '')}</code></dd>
        <dt>Mạng công chứng</dt><dd>${esc(v.blockchain ? v.blockchain.network : '')}</dd>
        <dt>Địa chỉ hợp đồng</dt><dd><code>${esc(v.blockchain ? v.blockchain.contractAddress : '')}</code></dd>
        <dt>Chứa dữ liệu cá nhân?</dt><dd><span class="badge green">Không</span></dd>
      </dl>
      <div class="alert ${v.verified ? 'ok' : 'warn'} mt-3" style="font-size:13px">
        ${v.verified
          ? '<i class="fa-solid fa-check-double"></i> Bản ghi hợp lệ — mã băm khớp, nội dung chưa bị sửa đổi.'
          : '<i class="fa-solid fa-circle-info"></i> Mã băm không khớp với trạng thái hiện tại (ví dụ bản ghi đã thu hồi sau khi ký). Mã băm gốc vẫn được lưu vĩnh viễn để đối chiếu.'}
      </div>`, { wide: true })
  } catch (e) { modal(`<h3>Lỗi</h3>${errBox(e)}<div class="row end mt-3"><button class="btn quiet" data-close>Đóng</button></div>`) }
}

function revokeConsent(id) {
  modal(`<h3>Thu hồi đồng thuận</h3>
    <div class="alert warn mt-3">
      Ngay khi thu hồi, <b>mọi tính năng AI</b> dựa trên bản ghi này sẽ ngừng hoạt động tức thì:
      persona chat, nhân bản giọng, ảnh động, avatar. Bản ghi không bị xoá — nó được đánh dấu “đã thu hồi”
      và giữ lại trong sổ để đối chiếu.
    </div>
    <div class="field mt-3"><label>Lý do</label>
      <input id="cr-reason" placeholder="Gia đình quyết định ngưng sử dụng"></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn danger" id="cr-go">Thu hồi ngay</button></div>`)
  $('#cr-go').addEventListener('click', async () => {
    try {
      const r = await api('/consent/' + id + '/revoke', { method: 'POST', body: { reason: $('#cr-reason').value.trim() || null } })
      closeOverlay(); toast(r.effect || 'Đã thu hồi.')
      viewConsent($('#view-consent'))
    } catch (e) { toast(e.message, 'err') }
  })
}

function restRequestModal(consentId) {
  modal(`<h3>Yêu cầu “Quyền được yên nghỉ”</h3>
    <p class="muted mt-2" style="font-size:14px">
      Có lúc điều tử tế nhất là để người đã mất được yên. Yêu cầu này cần đủ phiếu
      của người kế thừa mới có hiệu lực — không ai được đơn phương quyết định.
    </p>
    <div class="field mt-3"><label>Mức độ</label>
      <select id="rr-mode">
        <option value="SOFT_SUNSET">Ngưng tương tác AI — vẫn giữ ký ức để tưởng niệm</option>
        <option value="HARD_DELETE">Xoá hẳn dữ liệu tương tác AI</option>
      </select>
      <div class="help">Khuyến nghị chọn mức đầu: ký ức vẫn còn cho con cháu, chỉ AI ngưng nói thay người đã mất.</div></div>
    <div class="field"><label>Điều kiện kích hoạt</label>
      <select id="rr-trigger">
        <option value="INHERITOR_DECISION">Người kế thừa quyết định</option>
        <option value="TIME_LIMIT">Hết thời hạn</option>
        <option value="INACTIVITY">Lâu không dùng</option>
      </select></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="rr-go">Gửi yêu cầu</button></div>`)
  $('#rr-go').addEventListener('click', async () => {
    try {
      const r = await api('/rest-requests', { method: 'POST', body: {
        consentRecordId: consentId, mode: $('#rr-mode').value, trigger: $('#rr-trigger').value
      }})
      closeOverlay()
      toast(`Đã gửi yêu cầu — cần ${r.requiredApprovals} phiếu, hiện có ${r.approvals}.`)
      viewConsent($('#view-consent'))
    } catch (e) { toast(e.message, 'err') }
  })
}

async function willModal() {
  if (!requireLogin('lập di chúc số')) return
  let persons = []
  try { persons = (await api('/persons')).persons || [] } catch (_) {}
  const alive = persons.filter((p) => p.is_alive === 1)
  modal(`<h3>Di chúc số</h3>
    <p class="muted mt-1" style="font-size:14px">
      Bạn tự quyết định điều gì xảy ra với ký ức, giọng nói và hình ảnh của mình sau khi mất.
      Không ai được quyết định thay.
    </p>
    <div class="field mt-3"><label>Người lập di chúc *</label>
      <select id="wl-testator"><option value="">— chọn —</option>
        ${alive.map((p) => `<option value="${esc(p.id)}">${esc(p.full_name)}</option>`).join('')}</select></div>
    <div class="field"><label>Nhân chứng (chọn ≥ 2 để ký)</label>
      <div class="scope-grid" id="wl-wit">
        ${persons.map((p) => `<label class="scope-item">
          <input type="checkbox" value="${esc(p.id)}">
          <div class="f1"><b style="font-size:14px">${esc(p.full_name)}</b></div></label>`).join('')}
      </div></div>
    <div class="field"><label>Người kế thừa quyền quyết định</label>
      <div class="scope-grid" id="wl-inh">
        ${persons.map((p) => `<label class="scope-item">
          <input type="checkbox" value="${esc(p.id)}">
          <div class="f1"><b style="font-size:14px">${esc(p.full_name)}</b></div></label>`).join('')}
      </div></div>
    <div class="field"><label>Chủ đề khoá vĩnh viễn (persona AI không được nói)</label>
      <input id="wl-locked" value="chính trị, tài chính riêng"></div>
    <div class="field"><label>Lời cuối gửi gia đình</label>
      <textarea id="wl-msg" rows="3" placeholder="Điều tôi muốn con cháu nhớ…"></textarea></div>
    <label class="check mt-2"><input type="checkbox" id="wl-memorial" checked>
      <span>Bật chế độ tưởng niệm khi tôi mất</span></label>
    <label class="check"><input type="checkbox" id="wl-capsule" checked>
      <span>Mở các hộp thư thời gian “khi tôi mất”</span></label>
    <div class="field mt-3"><label>Trạng thái</label>
      <select id="wl-status"><option value="draft">Bản nháp</option>
        <option value="signed">Ký ngay (cần ≥ 2 nhân chứng)</option></select></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn gold" id="wl-save">Lưu di chúc</button></div>
    <div id="wl-out"></div>`, { wide: true })
  $$('#wl-wit .scope-item, #wl-inh .scope-item').forEach((el) => {
    const cb = el.querySelector('input')
    cb.addEventListener('change', () => el.classList.toggle('on', cb.checked))
  })
  $('#wl-save').addEventListener('click', async () => {
    const t = $('#wl-testator').value
    if (!t) return toast('Cần chọn người lập di chúc.', 'warn')
    try {
      await api('/wills', { method: 'POST', body: {
        testatorPersonId: t,
        witnessIds: $$('#wl-wit input:checked').map((x) => x.value),
        inheritors: $$('#wl-inh input:checked').map((x) => ({ personId: x.value, role: 'decision_maker' })),
        postMortemInstructions: {
          releaseTimeCapsulesAt: $('#wl-capsule').checked ? 'on_death' : 'never',
          activateMemorialMode: $('#wl-memorial').checked,
          lockedTopics: $('#wl-locked').value.split(',').map((s) => s.trim()).filter(Boolean),
          finalMessageToFamily: $('#wl-msg').value.trim() || null
        },
        status: $('#wl-status').value
      }})
      closeOverlay(); toast('Đã lưu di chúc số.')
      viewConsent($('#view-consent'))
    } catch (e) {
      $('#wl-out').innerHTML = `<div class="alert danger mt-3"><b>${esc(e.message)}</b></div>`
    }
  })
}

function activateWillModal(id) {
  modal(`<h3>Xác nhận qua đời</h3>
    <div class="alert warn mt-3">
      <b>Đây là bước không thể xem nhẹ.</b> Theo 4.7.4, cần <b>≥ 2 nhân chứng</b> và
      ảnh giấy chứng tử. Hệ thống <b>không</b> tự suy đoán ai đã mất từ dữ liệu hoạt động —
      một người im lặng lâu không có nghĩa là họ đã mất.
    </div>
    <div class="field mt-3"><label>Phương thức</label>
      <select id="wa-method">
        <option value="MANUAL_WITNESS">Nhân chứng + giấy chứng tử</option>
        <option value="GOV_REGISTRY">Đối soát dữ liệu hộ tịch</option>
      </select></div>
    <div class="field"><label>Ảnh giấy chứng tử (URL)</label>
      <input id="wa-cert" placeholder="https://…"></div>
    <div class="field"><label>Ngày mất</label><input id="wa-date" type="date"></div>
    <div class="row end mt-4"><button class="btn quiet" data-close>Huỷ</button>
      <button class="btn danger" id="wa-go">Xác nhận & kích hoạt di chúc</button></div>
    <div id="wa-out"></div>`)
  $('#wa-go').addEventListener('click', async () => {
    try {
      const r = await api('/wills/' + id + '/activate', { method: 'POST', body: {
        method: $('#wa-method').value, deathCertificateUrl: $('#wa-cert').value.trim() || null,
        deathDate: $('#wa-date').value || null
      }})
      closeOverlay()
      toast(`Đã kích hoạt di chúc. ${r.capsulesReleased} hộp thư thời gian được mở.`)
      viewConsent($('#view-consent'))
    } catch (e) {
      $('#wa-out').innerHTML = `<div class="alert danger mt-3"><b>${esc(e.message)}</b>
        ${e.status === 422 ? '<div class="mt-2" style="font-size:13px">Hàng rào chống kích hoạt sai đang hoạt động đúng.</div>' : ''}</div>`
    }
  })
}

async function showAudit() {
  const out = $('#cs-audit-out')
  out.innerHTML = loading('Đang tải nhật ký…')
  try {
    const d = await api('/audit-logs')
    const logs = d.logs || []
    out.innerHTML = logs.length
      ? `<table class="tbl mt-3"><thead><tr><th>Lúc</th><th>Ai</th><th>Hành động</th><th>Đối tượng</th></tr></thead>
          <tbody>${logs.slice(0, 60).map((l) => `<tr>
            <td class="nowrap muted" style="font-size:12px">${fmtDate(l.created_at)}</td>
            <td style="font-size:13px">${esc(l.actor_name || 'hệ thống')}</td>
            <td><code style="font-size:12px">${esc(l.action)}</code></td>
            <td class="muted" style="font-size:12px">${esc(l.target_type || '')} ${esc(String(l.target_id || '').slice(0, 8))}</td>
          </tr>`).join('')}</tbody></table>
         <div class="muted mt-2" style="font-size:12px">Hiển thị ${Math.min(60, logs.length)}/${logs.length} bản ghi gần nhất.</div>`
      : '<div class="muted mt-3" style="font-size:14px">Chưa có nhật ký.</div>'
  } catch (e) { out.innerHTML = errBox(e) }
}

/* =====================================================================
 * PART 9 — BOOTSTRAP & ROUTER
 * Điều phối: nạp phiên, xả hàng đợi ngoại tuyến, dựng đúng trang.
 * ===================================================================== */

// Cầu nối cho các nút inline onclick="window.__auth()" trong các trạng thái rỗng
window.__auth = () => authModal()
window.__gsk = { S, api, viewTree, openPerson, personaChat, consentModal }

const VIEWS = {
  dashboard: () => viewDashboard($('#view-dashboard')),
  tree: () => viewTree($('#view-tree')),
  altar: () => viewAltar($('#view-altar')),
  memories: () => viewMemories($('#view-memories')),
  scroll: () => viewScroll($('#view-scroll')),
  interview: () => viewInterview($('#view-interview')),
  rituals: () => viewRituals($('#view-rituals')),
  consent: () => viewConsent($('#view-consent'))
}

function bindChrome() {
  const be = $('#btn-elder')
  if (be) be.onclick = (ev) => { ev.preventDefault(); toggleElder() }

  const ba = $('#btn-auth')
  if (ba) ba.onclick = (ev) => { ev.preventDefault(); authModal() }

  const bd = $('#btn-demo')
  if (bd) bd.onclick = async (ev) => {
    ev.preventDefault()
    bd.classList.add('is-busy')
    try {
      await api('/auth/demo', { method: 'POST' })
      location.href = '/dashboard'
    } catch (e) {
      bd.classList.remove('is-busy')
      toast(e.message || 'Không vào được tài khoản demo', 'err')
      authModal()
    }
  }

  // Đóng lớp phủ bằng phím Esc — cử chỉ nhẹ, không phá nhịp
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeOverlay()
  })

  // Dọn các bộ đếm khi rời trang, tránh gọi API vô ích
  window.addEventListener('beforeunload', () => {
    if (ALTAR.timer) clearInterval(ALTAR.timer)
    if (RIT.timer) clearInterval(RIT.timer)
    if (RIT.cd) clearInterval(RIT.cd)
    if (RIT.karaokeTimer) clearInterval(RIT.karaokeTimer)
  })

  // Khi mạng trở lại, đẩy các nén nhang đã thắp lúc mất kết nối (AC-F1.4)
  window.addEventListener('online', () => {
    flushQueue().then(() => {
      const q = JSON.parse(localStorage.getItem('gsk_queue') || '[]')
      if (!q.length) toast('Đã đồng bộ các nghi lễ thực hiện lúc mất mạng', 'ok')
    })
  })
}

async function boot() {
  bindChrome()

  const page = window.__PAGE__ || 'home'
  document.body.dataset.page = page

  // Chế độ Ông bà áp dụng ngay từ localStorage để không nháy chữ
  if (localStorage.getItem('gsk_elder') === '1') document.body.classList.add('elder-mode')

  await loadMe()

  // Xả hàng đợi ngoại tuyến sau khi đã biết phiên đăng nhập
  if (S.user) flushQueue()

  const run = VIEWS[page]
  if (!run) return // trang chủ (landing) là HTML tĩnh, không cần dựng thêm

  const host = $('#view-' + page)
  if (!host) return

  try {
    await run()
  } catch (e) {
    host.innerHTML = `<div class="card">${errBox(e)}
      <div class="btn-group mt-3">
        <button class="btn quiet" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> Tải lại</button>
        ${S.user ? '' : '<button class="btn gold" onclick="window.__auth()"><i class="fa-solid fa-door-open"></i> Đăng nhập</button>'}
      </div></div>`
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
