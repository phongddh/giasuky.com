/**
 * Gia Sử Ký — Cloudflare Pages entry (Hono)
 * Gateway hợp nhất 10 microservice của spec 7.1 thành các route module chạy trên edge.
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { AppEnv } from './lib/types'
import { sessionMiddleware } from './lib/auth'
import { authRoutes } from './routes/auth'
import { genealogyRoutes } from './routes/genealogy'
import { memoryRoutes } from './routes/memories'
import { consentRoutes } from './routes/consent'
import { aiRoutes } from './routes/ai'
import { ritualRoutes } from './routes/rituals'
import { llmAvailable } from './lib/ai'
import { problem } from './lib/util'

const app = new Hono<AppEnv>()

app.use('*', logger())
app.use('/api/*', cors({ origin: '*', credentials: true }))
app.use('*', sessionMiddleware)

// ------------------------------- API ---------------------------------
app.get('/api/health', (c) =>
  c.json({
    ok: true,
    service: 'giasuky',
    spec: 'GiaSuKy-Technical-Specification-v1.0',
    llmReady: llmAvailable(c.env),
    time: new Date().toISOString()
  })
)

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1', genealogyRoutes)
app.route('/api/v1', memoryRoutes)
app.route('/api/v1', consentRoutes)
app.route('/api/v1', aiRoutes)
app.route('/api/v1', ritualRoutes)

app.onError((err, c) => {
  console.error('[error]', err)
  if (c.req.path.startsWith('/api/')) {
    return c.json(problem(500, 'Internal error', err.message || 'Lỗi hệ thống.'), 500)
  }
  return c.text('Lỗi hệ thống: ' + err.message, 500)
})

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json(problem(404, 'Not found', 'Không có endpoint này.'), 404)
  }
  return c.redirect('/')
})

// ============================ HTML SHELL =============================
type Page = {
  key: string
  path: string
  label: string
  icon: string
  title: string
  sub?: string
  wide?: boolean
}

const PAGES: Page[] = [
  { key: 'home', path: '/', label: 'Trang chủ', icon: 'fa-house', title: 'Gia Sử Ký' },
  {
    key: 'dashboard', path: '/dashboard', label: 'Gia đường', icon: 'fa-torii-gate',
    title: 'Gia đường',
    sub: 'Tổng quan dòng họ: lịch giỗ theo âm lịch, ký ức mới, buổi lễ sắp tới.'
  },
  {
    key: 'tree', path: '/tree', label: 'Cây Sống', icon: 'fa-sitemap',
    title: 'Cây Gia Phả Sống',
    sub: 'F3 — Người còn sống là lá xanh, người đã mất là lá vàng. Kéo để di chuyển, cuộn để phóng to. Nhánh chưa xác minh vẽ nét đứt.',
    wide: true
  },
  {
    key: 'altar', path: '/altar', label: 'Bàn Thờ Số', icon: 'fa-fire',
    title: 'Bàn Thờ Số Thông Minh',
    sub: 'F1 — Thắp nhang, dâng hoa, khấn nguyện. Nhắc giỗ theo lịch âm, đồng bộ nghi lễ giữa các thành viên.'
  },
  {
    key: 'memories', path: '/memories', label: 'Ký ức', icon: 'fa-book-open',
    title: 'Đồ Thị Ký Ức Đối Chiếu',
    sub: 'F4 — Chế độ Rashomon: một sự kiện, nhiều lời kể song song. Hệ thống chỉ đánh dấu điểm khác nhau, KHÔNG tự phán xét đúng sai.'
  },
  {
    key: 'scroll', path: '/scroll', label: 'Gia Đạo', icon: 'fa-scroll',
    title: 'Cuộn Gia Đạo',
    sub: 'F5 — Gia huấn tổng hợp từ lời kể thật của người trong họ. Mỗi câu đều trích nguyên văn và dẫn về ký ức gốc.'
  },
  {
    key: 'interview', path: '/interview', label: 'Phỏng vấn AI', icon: 'fa-microphone-lines',
    title: 'Người Phỏng Vấn AI',
    sub: 'F2 — Trợ lý AI trò chuyện với các cụ theo giọng vùng miền, tự nhận là AI, xin phép ghi âm, biết dừng khi cụ mệt hoặc buồn.'
  },
  {
    key: 'rituals', path: '/rituals', label: 'Nghi lễ', icon: 'fa-calendar-day',
    title: 'Trung Tâm Nghi Lễ',
    sub: 'F6 — Giỗ chạp trực tuyến đồng bộ: đếm ngược, phòng lễ, gia huấn karaoke, sổ nhật ký nghi lễ.'
  },
  {
    key: 'consent', path: '/consent', label: 'Đồng thuận', icon: 'fa-file-signature',
    title: 'Sổ Đồng Thuận & Di Chúc Số',
    sub: 'F7 — Không có AI nào được dùng hình ảnh, giọng nói hay ký ức của người đã mất nếu chưa có đồng thuận rõ ràng.'
  }
]

function Nav({ active }: { active: string }) {
  return (
    <nav class="nav">
      {PAGES.filter((p) => p.key !== 'home').map((p) => (
        <a href={p.path} class={active === p.key ? 'active' : ''}>
          <i class={`fa-solid ${p.icon}`} /> {p.label}
        </a>
      ))}
      <a href="#" id="btn-elder" title="Chế độ Ông bà: chữ lớn, ít chuyển động">
        <i class="fa-solid fa-glasses" /> Ông bà
      </a>
      <a href="#" id="btn-auth"><i class="fa-solid fa-user" /> <span id="auth-label">Đăng nhập</span></a>
    </nav>
  )
}

const Shell = (props: { page: Page; active: string; children?: any }) => {
  const { page, active } = props
  return (
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{page.title} · Gia Sử Ký</title>
        <meta
          name="description"
          content="Gia Sử Ký — nền tảng gia phả số cho gia đình Việt: bàn thờ số, phỏng vấn AI, cây gia phả sống, đồ thị ký ức, gia đạo, nghi lễ trực tuyến và sổ đồng thuận."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="app">
          <header class="topbar">
            <div class="topbar-inner">
              <a class="brand" href="/">
                <span class="brand-mark">祖</span>
                <span class="brand-text">
                  <b>Gia Sử Ký</b>
                  <span>giasuky.com</span>
                </span>
              </a>
              <Nav active={active} />
            </div>
          </header>

          <main class="main" id="main">
            {active !== 'home' && (
              <div class="page-head">
                <h1>
                  <i class={`fa-solid ${page.icon}`} style="color:var(--secondary-600);margin-right:8px" />
                  {page.title}
                </h1>
                {page.sub && <div class="sub">{page.sub}</div>}
              </div>
            )}
            {props.children}
          </main>

          <footer class="foot">
            <div class="foot-inner">
              <div>
                <b>Gia Sử Ký</b> — “Chúng ta không mất người thân. Chúng ta chỉ chưa biết cách lắng nghe họ.”
                <br />
                Bản dựng MVP theo <code>GiaSuKy-Technical-Specification-v1.0</code> trên Cloudflare Workers + D1.
              </div>
              <div>
                <b>Nguyên tắc</b>
                <br />
                P1 Tôn kính trước tiện lợi · P2 Đồng thuận trước mọi thứ · P3 Ký ức không phải nội dung
                <br />
                Đường dây hỗ trợ tâm lý: <b>096 306 1414</b>
              </div>
            </div>
          </footer>
        </div>

        <div id="overlay-root" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js" />
        <script>{`window.__PAGE__ = ${JSON.stringify(active)};`}</script>
        <script src="/static/app.js" />
      </body>
    </html>
  )
}

const pageOf = (key: string) => PAGES.find((p) => p.key === key)!

// ------------------------------- Landing -----------------------------
const FEATURES = [
  { k: 'F1', ico: 'fa-fire', t: 'Bàn Thờ Số Thông Minh', d: 'Không gian thờ 3 chiều với nhang khói, nến, hoành phi theo tín ngưỡng của nhà mình. Nhắc giỗ đúng ngày âm lịch. Ảnh cũ được phục dựng — nhưng không bao giờ tự tô màu để bịa nét mặt tổ tiên.', href: '/altar' },
  { k: 'F2', ico: 'fa-microphone-lines', t: 'Người Phỏng Vấn AI', d: 'Trợ lý AI nói giọng Bắc – Trung – Nam, gọi điện hỏi chuyện các cụ. Tự giới thiệu là AI, xin phép ghi âm, không ngắt lời, và dừng lễ độ khi cụ mệt hay xúc động.', href: '/interview' },
  { k: 'F3', ico: 'fa-sitemap', t: 'Cây Gia Phả Sống', d: 'Người còn sống là lá xanh, người đã mất là lá vàng. Nhánh chưa xác minh vẽ nét đứt — không bao giờ dựng nên quan hệ chưa được kiểm chứng.', href: '/tree' },
  { k: 'F4', ico: 'fa-diagram-project', t: 'Đồ Thị Ký Ức Đối Chiếu', d: 'Một đám cưới, ba người kể ba kiểu. Hệ thống đặt các lời kể cạnh nhau, đánh dấu điểm khác nhau và để con cháu tự đi hỏi thêm.', href: '/memories' },
  { k: 'F5', ico: 'fa-scroll', t: 'Cuộn Gia Đạo', d: 'Gia huấn của họ, tổng hợp từ lời thật của người thật. Trích nguyên văn — mỗi câu đều bấm được để nghe lại đúng đoạn ký ức gốc.', href: '/scroll' },
  { k: 'F6', ico: 'fa-people-group', t: 'Nghi Lễ Đồng Bộ', d: 'Con cháu ở Hà Nội, Sài Gòn, Tokyo, California cùng thắp nhang trong một buổi giỗ trực tuyến, cùng đọc gia huấn theo dòng chữ sáng dần.', href: '/rituals' },
  { k: 'F7', ico: 'fa-file-signature', t: 'Sổ Đồng Thuận & Di Chúc Số', d: 'Quyền được yên nghỉ. Mỗi phạm vi dùng dữ liệu là một ô đồng ý riêng, ký bằng video/VNeID, hash lưu công chứng — và có thể thu hồi bất cứ lúc nào.', href: '/consent' }
]

app.get('/', (c) => {
  const page = pageOf('home')
  return c.html(
    <Shell page={page} active="home">
      <div id="landing">
        <section class="hero" style="margin:calc(-1 * var(--sp-5)) calc(-1 * var(--sp-4)) var(--sp-6)">
          <div class="hero-inner">
            <span class="tagline">
              <i class="fa-solid fa-seedling" /> Di sản tổ tiên · DNA · Trí tuệ nhân tạo
            </span>
            <h1>
              Nơi tổ tiên <em>vẫn còn kể chuyện</em>
            </h1>
            <div class="vision">
              Gia Sử Ký không phải một cái cây phả hệ có ảnh. Đây là nơi ký ức của dòng họ được lưu bằng
              chính giọng người kể, đối chiếu nhiều góc nhìn, và luôn đặt sự đồng thuận của người đã mất lên
              trên mọi tiện lợi công nghệ.
            </div>
            <blockquote class="quote">
              “Chúng ta không mất người thân. Chúng ta chỉ chưa biết cách lắng nghe họ.”
            </blockquote>
            <div class="hero-cta">
              <a href="#" class="btn gold lg" id="btn-demo">
                <i class="fa-solid fa-door-open" /> Vào xem họ Nguyễn (demo)
              </a>
              <a href="/tree" class="btn on-dark lg">
                <i class="fa-solid fa-sitemap" /> Xem Cây Sống
              </a>
            </div>
            <div class="row mt-5" style="gap:var(--sp-6)">
              <div>
                <div class="fkey">TÔN KÍNH TRƯỚC TIỆN LỢI</div>
                <small style="color:#b6a48c">Không gamification trên nghi lễ, không quảng cáo cạnh bàn thờ.</small>
              </div>
              <div>
                <div class="fkey">ĐỒNG THUẬN TRƯỚC MỌI THỨ</div>
                <small style="color:#b6a48c">Không có consent — không có AI. Không ngoại lệ.</small>
              </div>
              <div>
                <div class="fkey">KHÔNG BỊA MỘT CHỮ</div>
                <small style="color:#b6a48c">Mọi câu AI nói đều dẫn nguồn về ký ức gia đình đã duyệt.</small>
              </div>
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:0">
          <div class="section-head">
            <h2>Bảy tính năng đột phá</h2>
            <p>
              Bản dựng này triển khai đầy đủ luồng nghiệp vụ F1–F7 của đặc tả v1.0 trên hạ tầng edge
              (Cloudflare Workers + D1), gồm cả các cơ chế bảo vệ: chống bịa đặt, chống lừa đảo, nhận biết
              đau buồn, và quyền được yên nghỉ.
            </p>
          </div>
          <div class="grid c3">
            {FEATURES.map((f) => (
              <a href={f.href} class="feature-card" style="text-decoration:none;color:inherit;display:block">
                <div class="fico">
                  <i class={`fa-solid ${f.ico}`} />
                </div>
                <div class="fkey">{f.k}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </a>
            ))}
          </div>
        </section>

        <section class="section" style="padding-top:0">
          <div class="grid c2">
            <div class="card">
              <h2>
                <i class="fa-solid fa-shield-heart red-t" /> Bốn lằn ranh đạo đức
              </h2>
              <div class="list">
                <div class="list-item">
                  <span class="badge red">P2</span>
                  <div>
                    <div class="t">Đồng thuận trước mọi thứ</div>
                    <div class="d">
                      Mọi tính năng AI đều đi qua cổng kiểm tra đồng thuận. Nhân bản giọng, persona chat,
                      video tái tạo bắt buộc ký bằng video/VNeID/công chứng.
                    </div>
                  </div>
                </div>
                <div class="list-item">
                  <span class="badge warn">P4</span>
                  <div>
                    <div class="t">Chống mạo danh & lừa đảo</div>
                    <div class="d">
                      Persona AI bị chặn cứng nếu nhắc tới tiền, OTP, số tài khoản, mật khẩu — kể cả khi bị
                      dụ. Câu hỏi của AI phỏng vấn cũng được quét cùng bộ luật.
                    </div>
                  </div>
                </div>
                <div class="list-item">
                  <span class="badge blue">P3</span>
                  <div>
                    <div class="t">Nhận biết đau buồn</div>
                    <div class="d">
                      Khi người dùng có dấu hiệu đau buồn nặng, hệ thống chuyển giọng an ủi và hiển thị đường
                      dây hỗ trợ tâm lý 096 306 1414 thay vì cố giữ người dùng lại.
                    </div>
                  </div>
                </div>
                <div class="list-item">
                  <span class="badge gold">P7</span>
                  <div>
                    <div class="t">Quyền được yên nghỉ</div>
                    <div class="d">
                      Người kế thừa có thể yêu cầu cho tổ tiên “yên nghỉ”: tắt tương tác AI (soft sunset) hoặc
                      xoá hẳn dữ liệu persona, cần đủ số phiếu đồng ý.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card paper">
              <h2>
                <i class="fa-solid fa-quote-left gold-t" /> Chống bịa đặt là quy tắc cứng
              </h2>
              <p style="font-size:var(--fs-sm)">
                AI của Gia Sử Ký không được phép “sáng tác” tổ tiên. Ba tầng chặn được cài trực tiếp trong mã:
              </p>
              <ol style="font-size:var(--fs-sm);line-height:1.9;padding-left:20px">
                <li>
                  <b>Không có ký ức khớp → không gọi LLM.</b> Persona trả lời thẳng là “chuyện đó không có trong
                  những gì gia đình đã lưu”.
                </li>
                <li>
                  <b>Mỗi câu trả lời phải kèm ít nhất một nguồn</b> (mã ký ức) — bấm được để xem đúng đoạn gốc.
                </li>
                <li>
                  <b>Gia huấn phải trích nguyên văn.</b> Câu nào LLM viết lại mà không tồn tại trong ký ức gốc sẽ
                  bị hệ thống loại bỏ tự động.
                </li>
              </ol>
              <div class="divider" />
              <small>
                Kiến trúc gốc của đặc tả dùng Neo4j, Qdrant, Elasticsearch, Kafka và mediasoup SFU. Bản MVP này
                ánh xạ sang D1 (recursive CTE cho phả hệ), bảng vector + cosine tính trong Worker, tìm kiếm
                không dấu, và đồng bộ nghi lễ bằng poll-cursor.
              </small>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  )
})

// --------------------- Các trang tính năng (SPA mount) ---------------
function featurePage(key: string) {
  const page = pageOf(key)
  return (c: any) =>
    c.html(
      <Shell page={page} active={key}>
        <div id={`view-${key}`}>
          <div class="loading-wrap">
            <span class="spinner" /> Đang mở {page.title.toLowerCase()}…
          </div>
        </div>
      </Shell>
    )
}

for (const p of PAGES) {
  if (p.key === 'home') continue
  app.get(p.path, featurePage(p.key))
}

export default app
