# TÀI LIỆU ĐẶC TẢ KỸ THUẬT
# ỨNG DỤNG CÂY GIA PHẢ SỐ TÍCH HỢP DNA & AI
# **Codename: "Gia Sử Ký"** — *Legacy Intelligence Network for Ancestral Genealogy & Experience*
# **Domain:** giasuky.com
> **Phiên bản**: 1.0 (Draft for Development)
> **Ngày phát hành**: 2026-08-03
> **Ngôn ngữ**: Tiếng Việt (thuật ngữ kỹ thuật giữ nguyên tiếng Anh)
> **Đối tượng đọc**: Developer, Tech Lead, AI Agent Autonomous Coder, Product Owner
> **Tình trạng**: Ready for implementation

---

## MỤC LỤC TỔNG QUÁT

1. [Executive Summary & Product Vision](#chuong-1)
2. [Product Overview — 7 Tính năng đột phá](#chuong-2)
3. [User Personas & User Stories](#chuong-3)
4. [Feature Specification chi tiết](#chuong-4)
5. [System Architecture (6 lớp)](#chuong-5)
6. [Database Schema (Neo4j + PostgreSQL + Vector DB)](#chuong-6)
7. [Backend Design (Microservices)](#chuong-7)
8. [Frontend Design (Web + Mobile)](#chuong-8)
9. [AI/ML Pipeline](#chuong-9)
10. [DNA Integration Module](#chuong-10)
11. [Security, Privacy, Consent Framework](#chuong-11)
12. [DevOps & Infrastructure](#chuong-12)
13. [Testing Strategy](#chuong-13)
14. [Business Model & Pricing](#chuong-14)
15. [Roadmap 12 tháng](#chuong-15)

---

<a id="chuong-1"></a>
# CHƯƠNG 1 — EXECUTIVE SUMMARY & PRODUCT VISION

## 1.1. Tầm nhìn (Vision)

> *"Xây dựng một **Legacy Network** — mạng lưới ký ức, quan hệ và di sản văn hóa liên thế hệ — nơi mỗi gia đình Á Đông có thể **sống cùng tổ tiên số**, **kể chuyện với con cháu chưa sinh ra**, và **duy trì gia đạo** qua nhiều thế kỷ."*

## 1.2. Sứ mệnh (Mission)

**Gia Sử Ký** không phải là một ứng dụng cây gia phả. Nó là một **hạ tầng di sản số văn hóa Á Đông** với 3 trụ cột:

| Trụ cột | Mô tả |
|---------|-------|
| **Preserve** | Bảo tồn ký ức trước khi thế hệ ông bà mất đi (silent generation problem) |
| **Connect** | Kết nối họ hàng phân tán (đặc biệt Việt kiều hải ngoại) qua nghi lễ số đồng bộ |
| **Transmit** | Truyền lại gia huấn, gia đạo, DNA di truyền và câu chuyện cho thế hệ sau |

## 1.3. Unique Selling Proposition (USP)

Gia Sử Ký khác biệt với các đối thủ (Ancestry, MyHeritage, StoryFile, HereAfter AI, Việt Phả Tuệ, MyTree.vn) ở **5 điểm cốt lõi** — được rút ra từ 5 khoảng trống thị trường (blue ocean insights):

1. **Legacy Network, không phải Individual Legacy** — Mối quan hệ giữa các persona (không phải mỗi persona đơn lẻ như HereAfter).
2. **Digitize đúng nghi lễ thờ cúng tổ tiên Á Đông** — Bàn thờ số, lịch âm, nhang khói ảo, họp mặt online đồng bộ.
3. **Consent Framework có tính pháp lý** — Digital Will + Consent Ledger, tuân thủ Luật Công nghiệp Công nghệ số Việt Nam 2025.
4. **Giải quyết "Silent Generation"** — AI Interviewer qua điện thoại tự động, tương thích ông bà không dùng smartphone.
5. **Living Tree** — Không chỉ ghi người đã mất, mà chủ động ghi người đang sống theo timeline milestone.

## 1.4. Thị trường mục tiêu

- **TAM (Total Addressable Market)**: Digital Legacy Economy — **22–24 tỷ USD (2025)** → **47–78 tỷ USD (2030–2035)**, CAGR 13–18%.
- **SAM (Serviceable Available Market)**: Dân số Á Đông + Đông Nam Á có văn hóa thờ tổ tiên — **~2 tỷ người**.
- **SOM (Serviceable Obtainable Market)**:
  - **Việt Nam**: ~25 triệu hộ gia đình.
  - **Việt kiều hải ngoại**: 5.3 triệu người (Mỹ, Úc, Pháp, Canada, Đức).
  - **Trung Quốc / Đài Loan / Hàn / Nhật** (giai đoạn 2): thị trường 1.5 tỷ người.

## 1.5. Nguyên tắc sản phẩm (Product Principles)

| # | Nguyên tắc | Ý nghĩa |
|---|-----------|---------|
| P1 | **Culture-First, Tech-Second** | Mọi tính năng phải phù hợp văn hóa Á Đông; không "copy-paste" Ancestry. |
| P2 | **Consent Before Everything** | Không có consent = không có AI clone, không có persona ảo. |
| P3 | **Grief-Aware** | Nhận biết người dùng đang đau buồn; đưa cảnh báo, kết nối tâm lý. |
| P4 | **Anti-Scam by Design** | AI persona không bao giờ yêu cầu tiền, chuyển khoản, chia sẻ OTP. |
| P5 | **Right to Rest** | Người dùng có quyền quyết định AI persona của mình "yên nghỉ" (tắt vĩnh viễn). |
| P6 | **Data Sovereignty** | Người dùng luôn export/xóa được dữ liệu; dữ liệu lưu tại VN (data residency). |
| P7 | **Progressive Disclosure** | Người mới thấy giao diện đơn giản (cây gia phả); tính năng nâng cao mở dần. |
| P8 | **Offline-First cho người già** | AI Interviewer qua điện thoại analog (Twilio) không cần app. |

---
<a id="chuong-2"></a>
# CHƯƠNG 2 — PRODUCT OVERVIEW: 7 TÍNH NĂNG ĐỘT PHÁ

## 2.1. Bản đồ tính năng (Feature Map)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Gia Sử Ký PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [F1] SMART DIGITAL ALTAR         [F2] AI INTERVIEWER           │
│       Bàn Thờ Số Thông Minh            Phỏng vấn viên AI đa vùng│
│                                                                 │
│  [F3] LIVING TREE                 [F4] MEMORY GRAPH             │
│       Cây Sống 3D                      Đồ thị ký ức chéo        │
│                                                                 │
│  [F5] GIA ĐẠO SCROLL              [F6] RITUAL SYNC              │
│       Cuộn Gia Huấn AI                 Đồng bộ nghi lễ online   │
│                                                                 │
│  [F7] CONSENT LEDGER & DIGITAL WILL                             │
│       Sổ đồng thuận + Di chúc số                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│         SUPPORTING FEATURES (Hạ tầng nền)                       │
│  • DNA Integration     • Photo Restoration    • Time Capsule    │
│  • Lịch âm giỗ Tết     • Công đức khuyến học  • Voice Cloning   │
│  • Ngoại phả (văn khấn)• Nhận diện khuôn mặt  • AR/VR mộ tổ    │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2. Chi tiết 7 tính năng đột phá

### F1 — SMART DIGITAL ALTAR (Bàn Thờ Số Thông Minh)

- **Mục đích**: Số hóa nghi lễ thờ tổ tiên Á Đông một cách tôn nghiêm, không "gimmick".
- **Tương tác**: Người dùng vào không gian 3D bàn thờ, thắp hương ảo (haptic + audio ambient tiếng chuông chùa/tiếng mưa), khấn nguyện, xem ảnh thờ đã phục hồi bằng AI.
- **Đồng bộ lịch âm**: Auto push notification giỗ theo lịch âm cho cả dòng họ.
- **Tính năng con**:
  - Ambient sound engine (mưa, chim, chuông, tiếng tụng kinh)
  - Đèn nến ảo với vật lý mô phỏng ánh sáng
  - Ảnh thờ đã phục hồi bằng AI (colorize + upscale)
  - Không gian tùy biến theo tôn giáo (Phật, Công giáo, Cao Đài, Hòa Hảo, đạo Mẫu)
  - Ghi âm lời khấn cá nhân, lưu vào Memory Graph

### F2 — AI INTERVIEWER (Phỏng vấn viên AI đa vùng miền)

- **Mục đích**: Chủ động phỏng vấn ông bà, thu thập ký ức trước khi họ mất — giải quyết "silent generation problem".
- **Đặc biệt**:
  - Hiểu **giọng Bắc / Trung / Nam** và từ ngữ cổ (VD: "răng rứa", "chi rứa", "má tui").
  - Nhận diện ca dao tục ngữ, ngôn ngữ khấn.
  - **Hoạt động qua điện thoại thường** (Twilio Voice Gateway) — ông bà không cần smartphone.
- **Cuộc phỏng vấn 20 phút mỗi tuần**:
  - Câu hỏi mở, không leading.
  - Detect emotion (buồn, mệt) → tạm dừng, chuyển đề tài.
  - Sau mỗi cuộc, AI tự transcribe, cấu trúc hóa, cross-reference với dữ liệu đã có, gửi bản nháp cho gia đình duyệt trước khi nhập Memory Graph.

### F3 — LIVING TREE (Cây Sống 3D)

- **Mục đích**: Cây gia phả **không phải chỉ cho người đã mất** — ghi lại người đang sống theo timeline.
- **Milestone tự động gợi ý**:
  - Cưới, sinh con, tốt nghiệp, mua nhà, đổi việc, du học, giỗ đầu, mừng thọ.
  - AI push: *"Con vừa tốt nghiệp — muốn để lại lời nhắn cho con của bạn 20 năm sau không?"*
- **Cây 3D tương tác** (Three.js / React Three Fiber): xoay 360°, zoom vào nhánh, click vào mỗi node xem hồi ký, ảnh, video, giọng nói.
- **Growth animation**: cây "mọc" thêm cành khi có thành viên mới.

### F4 — CROSS-REFERENTIAL MEMORY GRAPH (Đồ thị ký ức chéo)

- **Mục đích**: Cùng một sự kiện được kể qua nhiều góc nhìn (hiệu ứng Rashomon) → sự thật đa chiều.
- **Ví dụ**:
  - Bà nội kể: *"Ngày đó chú Ba đi bộ đội, cả nhà khóc."*
  - Chú Ba kể: *"Tôi đi hồ hởi lắm, không thấy ai khóc."*
  - AI liên kết 2 câu chuyện thành **cùng một event node**, hiển thị 2 quan điểm cạnh nhau.
- **Auto discovery**: AI phát hiện mâu thuẫn, gợi ý phỏng vấn thêm để làm sáng tỏ.

### F5 — GIA ĐẠO SCROLL (Cuộn Gia Huấn AI)

- **Mục đích**: AI tổng hợp tất cả **lời răn dạy**, câu nói, triết lý sống của tổ tiên → biên tập thành một **cuốn sách gia huấn số** cho con cháu.
- **Cấu trúc**:
  - Chương theo chủ đề (đạo hiếu, học hành, làm ăn, hôn nhân, cách đối nhân xử thế).
  - Trích dẫn nguyên văn kèm audio giọng gốc.
  - Có thể export PDF/EPUB in ra làm sách gia truyền.
- **Cập nhật động**: mỗi khi có lời răn mới được thu thập, Scroll tự cập nhật.

### F6 — RITUAL SYNC (Đồng bộ nghi lễ online)

- **Mục đích**: Cả dòng họ (dù ở Mỹ, Úc, Pháp, VN) **cùng thắp hương một lúc** cho giỗ tổ.
- **Cơ chế**:
  - WebRTC video call multi-party (up to 100 endpoints).
  - Countdown đến giờ khấn.
  - Tất cả cùng thắp nhang ảo → hiệu ứng nến hội tụ về bàn thờ chung.
  - Đọc gia huấn đồng thanh (karaoke-style highlight text).
  - Ghi lại buổi lễ, lưu vào archive dòng họ.
- **Múi giờ tự động**: chọn giờ tối ưu nhất cho đa số thành viên.

### F7 — CONSENT LEDGER & DIGITAL WILL (Sổ đồng thuận + Di chúc số)

- **Mục đích**: **Ràng buộc pháp lý** — không ai có quyền tạo AI persona của tôi mà không có consent của tôi.
- **Cấu trúc consent record**:
  - Người ký (subject).
  - Phạm vi (voice, image, chatbot, video reanimation).
  - Người được phép truy cập (cụ thể theo user ID / quan hệ dòng họ).
  - Thời hạn (VD: 50 năm sau khi mất → tự động sunset).
  - **Right to Rest**: điều kiện để AI persona "yên nghỉ" (VD: khi con cháu không còn tương tác trong 5 năm).
  - Chữ ký số (digital signature) + timestamp blockchain (Polygon zkEVM — chỉ để notarize, không lưu PII).
- **Digital Will**: người dùng khai báo trước khi mất — ai kế thừa "quản trị" persona.

## 2.3. Supporting Features (Tính năng nền)

| Feature | Mô tả |
|---------|-------|
| **DNA Integration** | Import raw data từ 23andMe, AncestryDNA, MyHeritage DNA; matching họ hàng opt-in |
| **Photo Restoration** | AI colorize + upscale + face restoration ảnh thờ cũ |
| **Voice Cloning** | Vbee / ElevenLabs với anti-scam watermark |
| **Lịch âm giỗ Tết** | Đồng bộ âm–dương, nhắc giỗ, gợi ý mâm cỗ theo miền |
| **Công đức khuyến học** | Sổ thu chi minh bạch cho quỹ dòng họ |
| **Ngoại phả** | Văn khấn, nghi thức, ý nghĩa tên thờ, gia phả bên ngoại |
| **Time Capsule** | Tin nhắn hẹn giờ mở (video/audio/text) đến tương lai |
| **AR/VR mộ tổ** | Chụp 3D nhà thờ họ, mộ tổ, cho phép "viếng" từ xa qua AR/VR |
| **Face similarity** | AI so khớp khuôn mặt giữa các thế hệ ("con giống ai") |

---
<a id="chuong-3"></a>
# CHƯƠNG 3 — USER PERSONAS & USER STORIES

## 3.1. Personas chính

### P1 — Bác Tùng, 68 tuổi, Trưởng họ (VN)

- **Tình huống**: Đang giữ gia phả giấy của họ Nguyễn tại quê. Muốn số hóa nhưng "sợ công nghệ".
- **Nỗi đau (pain)**: Con cháu ở xa, mất kết nối; sổ giấy mối mọt; không ai biết viết chữ Nho để đọc bản gốc.
- **Mục tiêu**: Số hóa toàn bộ, kết nối con cháu Việt kiều, chuẩn bị giỗ tổ hàng năm.
- **Tech level**: Zalo, YouTube, Facebook cơ bản. **Không cài app phức tạp.**
- **Tính năng cần**: Ritual Sync, Digital Altar, Living Tree (view mode chủ yếu).

### P2 — Chị Linh, 38 tuổi, Việt kiều tại California

- **Tình huống**: Xa Việt Nam 15 năm, con sinh ở Mỹ không biết tiếng Việt.
- **Pain**: Muốn con hiểu về ông bà; mẹ ở VN ngày càng già, sợ mất trước khi kịp ghi lại chuyện.
- **Mục tiêu**: Phỏng vấn mẹ từ xa, tạo hồi ký song ngữ, để lại cho con.
- **Tech level**: Cao — dùng iPhone, laptop, quen video call.
- **Tính năng cần**: AI Interviewer (gọi cho mẹ), Memory Graph, Gia Đạo Scroll (song ngữ), Time Capsule.

### P3 — Bạn Nam, 22 tuổi, Gen Z sinh viên

- **Tình huống**: Ông nội vừa mất năm ngoái. Chỉ còn vài file ghi âm cũ.
- **Pain**: Tiếc vì chưa kịp hỏi ông về chiến tranh, gia đình xưa; ảnh ông rất mờ, đen trắng.
- **Mục tiêu**: Phục hồi ảnh, dựng lại persona AI của ông để "trò chuyện", ghi lại cho em gái mới sinh.
- **Tech level**: Rất cao — TikTok, AR, gaming.
- **Tính năng cần**: Photo Restoration, Voice Cloning, AI Chatbot persona, Digital Altar 3D.

### P4 — Bà Sáu, 82 tuổi, ông bà tại quê Bến Tre

- **Tình huống**: Không dùng smartphone. Chỉ có điện thoại "cục gạch".
- **Pain**: Con cháu ở xa, ít gọi về; nhiều chuyện muốn kể nhưng "không ai hỏi".
- **Mục tiêu**: Được lắng nghe. Muốn để lại lời cho cháu chắt.
- **Tech level**: Chỉ điện thoại analog.
- **Tính năng cần**: **AI Interviewer qua Twilio Voice Gateway** — chỉ cần bấm số, không cần app.

### P5 — Anh Hùng, 45 tuổi, thành viên hội đồng gia tộc

- **Tình huống**: Đại diện dòng họ Trần lớn, ~300 nhân khẩu, có quỹ khuyến học.
- **Pain**: Quản lý quỹ minh bạch, tổ chức giỗ tổ, in ấn phả đồ.
- **Mục tiêu**: Vận hành B2B "workspace dòng họ".
- **Tính năng cần**: Công đức ledger, in phả đồ, Ritual Sync đa endpoint, phân quyền hội đồng.

## 3.2. User Stories (đại diện — mỗi feature có acceptance criteria)

Format: `As a [persona], I want [action], so that [benefit]`

### F1 — Digital Altar
- **US-F1.1**: Là chị Linh, tôi muốn thắp nhang ảo cho bố tôi vào ngày giỗ, để tôi cảm thấy kết nối dù ở xa. → *AC*: hoàn thành trong 3 tap, có haptic + audio, ghi lại vào Memory Graph.
- **US-F1.2**: Là bác Tùng, tôi muốn tạo bàn thờ chung cho họ Nguyễn, để cả họ cùng vào thắp nhang. → *AC*: chọn tôn giáo, upload ảnh thờ, mời thành viên qua QR code.

### F2 — AI Interviewer
- **US-F2.1**: Là chị Linh, tôi muốn AI gọi cho mẹ tôi ở VN mỗi Chủ nhật 8 giờ tối, phỏng vấn 20 phút, để tôi có transcript mỗi tuần. → *AC*: schedule setup 1 lần, mẹ chỉ cần trả lời điện thoại, AI hiểu giọng miền Nam.
- **US-F2.2**: Là bà Sáu, tôi muốn được hỏi những câu về tuổi thơ tôi, để tôi có người lắng nghe. → *AC*: câu hỏi mở, không đóng, detect mệt/buồn → tạm dừng.

### F3 — Living Tree
- **US-F3.1**: Là bạn Nam, tôi muốn xoay cây gia phả 3D, click vào ông cố để xem lịch sử, để tôi hiểu gốc gác. → *AC*: 60 FPS trên laptop, load lazy theo depth, click node < 500ms.

### F4 — Memory Graph
- **US-F4.1**: Là bác Tùng, tôi muốn thấy tất cả câu chuyện về đám cưới bố mẹ tôi từ nhiều người kể, để bức tranh đầy đủ. → *AC*: cùng event → group hiển thị, highlight mâu thuẫn.

### F5 — Gia Đạo Scroll
- **US-F5.1**: Là chị Linh, tôi muốn export cuốn gia huấn thành PDF song ngữ Việt–Anh, để in cho con đọc. → *AC*: PDF chuẩn A5, có ảnh, có QR link audio gốc.

### F6 — Ritual Sync
- **US-F6.1**: Là bác Tùng, tôi muốn tổ chức giỗ tổ online cho 50 con cháu ở 8 nước, để tất cả cùng khấn 1 lúc. → *AC*: multi-party WebRTC, countdown, đồng bộ hiệu ứng nhang trong <500ms độ trễ.

### F7 — Consent Ledger
- **US-F7.1**: Là bạn Nam, trước khi tạo AI persona của ông nội, tôi cần bằng chứng ông đã đồng ý khi còn sống. → *AC*: không có consent record → tính năng bị disable, hiển thị cảnh báo pháp lý.
- **US-F7.2**: Là chị Linh, tôi muốn khai báo Digital Will: sau khi tôi mất, chỉ con gái tôi được quản trị persona của tôi. → *AC*: signed record, timestamp on blockchain, có notary tùy chọn.

---
<a id="chuong-4"></a>
# CHƯƠNG 4 — FEATURE SPECIFICATION CHI TIẾT

Mỗi tính năng được đặc tả theo template chuẩn:
`Mục đích → User Flow → Data Model → UI Guide → AI Logic → Acceptance Criteria → Edge Cases`

---

## 4.1. F1 — SMART DIGITAL ALTAR

### 4.1.1. User Flow
```
[Home] → [Chọn người thân] → [Vào Digital Altar 3D]
                                     │
                                     ├─→ Thắp nhang (tap + haptic)
                                     ├─→ Đặt hoa/mâm cỗ ảo
                                     ├─→ Ghi âm lời khấn cá nhân
                                     ├─→ Xem ảnh thờ đã phục hồi
                                     ├─→ Nghe voice clone đọc gia huấn
                                     └─→ Chia sẻ khoảnh khắc với dòng họ
```

### 4.1.2. Data Model (conceptual)
```
Altar {
  id: UUID
  ownerId: UUID (dòng họ hoặc cá nhân)
  subjectPersonIds: [UUID]      // người được thờ (có thể nhiều: ông bà chung một bàn)
  religionTheme: enum(Phat, CongGiao, CaoDai, HoaHao, DaoMau, KhongTonGiao)
  spatialAssets: {
    background3D: URL,          // scene glb/gltf
    ambientSounds: [URL],       // mưa, chuông, tụng kinh
    incenseParticleConfig: JSON,
    lightingProfile: JSON
  }
  ritualLog: [RitualEvent]      // log mọi lần thắp nhang, khấn
  createdAt, updatedAt
}
```

### 4.1.3. UI Guide
- **Layout**: full-screen 3D (Three.js / React Three Fiber), UI overlay bottom-sheet
- **Interaction**: tap nhang → hạt lửa xuất hiện, khói bốc lên vòng 3–5 giây, âm thanh chuông nhẹ
- **Accessibility**:
  - Có mode 2D fallback cho thiết bị yếu (không có WebGL)
  - Voice-over toàn bộ nút
  - Contrast AAA cho người già

### 4.1.4. AI Logic
- **Photo restoration pipeline** (batch job khi upload ảnh thờ):
  - Step 1: face detection & alignment (MediaPipe)
  - Step 2: face restoration (GFPGAN / CodeFormer)
  - Step 3: colorization (DeOldify)
  - Step 4: upscale 4× (Real-ESRGAN)
  - Output: 3 phiên bản (original / restored BW / restored color) — người dùng chọn
- **Ambient recommendation**: dựa trên vùng miền + tôn giáo suy ra âm thanh phù hợp

### 4.1.5. Acceptance Criteria
| # | AC |
|---|----|
| AC-F1.1 | Load altar 3D < 3s trên iPhone 12 / laptop trung bình |
| AC-F1.2 | Fallback 2D tự động cho thiết bị không hỗ trợ WebGL2 |
| AC-F1.3 | Mọi ảnh upload đều qua moderation (không cho phép ảnh khỏa thân, bạo lực) |
| AC-F1.4 | Ritual log persist 100% (không mất khi mất mạng — offline queue) |
| AC-F1.5 | Ambient sound bản quyền — không dùng nhạc thương mại |

### 4.1.6. Edge Cases
- Ảnh thờ quá mờ → AI cảnh báo, không tự tô màu (tránh bịa nét mặt).
- Người dùng chọn "Không tôn giáo" → theme neutral, không có icon tôn giáo.
- Nhiều người cùng thắp nhang lúc → animation không đè lên nhau, sync qua WebSocket.

---

## 4.2. F2 — AI INTERVIEWER

### 4.2.1. User Flow (2 mode)

**Mode A — Qua ứng dụng (smartphone)**
```
[App] → [Chọn người được phỏng vấn] → [Chọn chủ đề gợi ý]
      → [Bắt đầu cuộc gọi VoIP] → [AI hỏi, người nghe kể]
      → [Kết thúc] → [Xem transcript] → [Duyệt] → [Vào Memory Graph]
```

**Mode B — Qua điện thoại thường (Twilio Voice Gateway)**
```
[Con cháu setup lịch qua app] → [AI gọi cho ông bà theo lịch]
                              → [Ông bà bắt máy, nghe câu chào]
                              → [Trò chuyện tự nhiên 15-25 phút]
                              → [AI kết thúc lễ độ]
                              → [Transcript gửi cho con cháu]
```

### 4.2.2. Data Model
```
InterviewSession {
  id: UUID
  intervieweeId: UUID           // người được phỏng vấn
  scheduledById: UUID           // con cháu setup
  channel: enum(APP_VOIP, PSTN_TWILIO)
  scheduledAt: DateTime
  duration: Int (seconds)
  status: enum(SCHEDULED, IN_PROGRESS, COMPLETED, FAILED, PENDING_REVIEW, APPROVED)
  topic: String                 // "Tuổi thơ", "Đám cưới", "Chiến tranh"...
  language: enum(VI_NORTH, VI_CENTRAL, VI_SOUTH, EN, MIXED)
  audioRecordingUrl: URL (S3, encrypted)
  transcriptRaw: JSON           // Whisper output với timestamp
  transcriptStructured: JSON    // đã cross-ref, gắn entity
  emotionTimeline: JSON         // (timestamp, emotion) mỗi 5 giây
  aiHost: enum(AI_MALE_HANOI, AI_FEMALE_SAIGON, AI_MALE_HUE, ...)
  consentSignatureId: UUID      // link đến ConsentLedger
}
```

### 4.2.3. AI Logic (pipeline chi tiết)

```
[Audio real-time streaming]
        │
        ▼
[Whisper large-v3 fine-tuned VI]  ← model fine-tune với dataset giọng Bắc/Trung/Nam
        │
        ▼
[VAD - Voice Activity Detection]  ← Silero VAD
        │
        ▼
[Emotion detector]                ← wav2vec2 emotion classifier
        │
        ▼
[Dialog manager (LLM)]            ← Llama 3.1 70B / Claude Sonnet với prompt điều phối
        │  ├─ Nếu detect buồn/mệt → chuyển đề tài hoặc kết thúc lễ độ
        │  ├─ Nếu detect ngôn ngữ cổ/ca dao → không hỏi ngắt, ghi note
        │  └─ Nếu detect danh từ riêng (tên người, địa danh) → auto-link entity
        ▼
[TTS xuất giọng AI]               ← ElevenLabs / Vbee với giọng vùng miền chọn trước
        │
        ▼
[Streaming về phone / VoIP]
```

### 4.2.4. Prompt Framework cho AI Host

```
SYSTEM PROMPT (rút gọn):
Bạn là {AI_HOST_NAME}, một người phỏng vấn nhân hậu, kiên nhẫn, hiểu văn hóa Việt Nam.
Bạn đang nói chuyện với {INTERVIEWEE_NAME}, {AGE} tuổi, quê {QUE_QUAN}, giọng miền {REGION}.
Chủ đề hôm nay: {TOPIC}.
Đã biết về họ: {SUMMARY_FROM_MEMORY_GRAPH}.

QUY TẮC BẮT BUỘC:
1. Không bao giờ ngắt lời khi họ đang kể.
2. Không hỏi 2 câu cùng lúc.
3. Nếu họ dừng >8 giây, hỏi câu tiếp theo nhẹ nhàng.
4. Không hỏi về chủ đề nhạy cảm (mất mát, bệnh, tiền) trừ khi họ chủ động nhắc.
5. Nếu detect emotion = "sad" hoặc "tired" → chuyển sang chủ đề vui hoặc lễ phép kết thúc.
6. Xưng hô đúng vai vế: gọi "bác", "cô", "chú", "ông", "bà" — không "bạn"/"anh"/"chị" trừ khi họ yêu cầu.
7. Nếu họ dùng từ cổ (VD "cái đài", "cái gánh"), hỏi thăm ý nghĩa để lưu vào Memory Graph.
```

### 4.2.5. Acceptance Criteria
| # | AC |
|---|----|
| AC-F2.1 | WER (Word Error Rate) < 12% cho giọng Bắc, < 15% cho Trung, < 15% cho Nam |
| AC-F2.2 | Độ trễ AI response < 800ms (streaming TTS) |
| AC-F2.3 | Auto phát hiện & dừng khi người kể khóc / thở gấp / mệt |
| AC-F2.4 | Transcript đạt độ chính xác >90% sau khi được con cháu review |
| AC-F2.5 | Cuộc gọi PSTN qua Twilio phải có consent audio (câu đầu tiên xin phép ghi âm) |

### 4.2.6. Edge Cases
- Ông bà không nghe rõ → AI tự động tăng volume, nói chậm hơn.
- Ông bà nghĩ AI là người thật → không lừa; tự giới thiệu rõ "Cháu là trợ lý AI".
- Cắt cuộc gọi giữa chừng → auto resume lần gọi sau, không lặp lại câu đã hỏi.

---

## 4.3. F3 — LIVING TREE (3D)

### 4.3.1. Cấu trúc cây

```
Root Ancestor (Tổ)
   │
   ├─ Generation 1 (Cụ)
   │    ├─ Generation 2 (Ông/Bà)
   │    │    ├─ Generation 3 (Bố/Mẹ)
   │    │    │    └─ Generation 4 (Bản thân)
   │    │    │         └─ Generation 5 (Con)
```

### 4.3.2. Data Model (Neo4j — chi tiết chương 6)
```
(Person)-[:CHILD_OF]->(Person)
(Person)-[:SPOUSE_OF]->(Person)
(Person)-[:ADOPTED_BY]->(Person)
(Person)-[:HAS_MEMORY]->(Memory)
(Person)-[:BELONGS_TO]->(Clan)
```

### 4.3.3. UI/UX

- **Layout gợi ý**: hình cây thật (root ở dưới, cành mở lên trên) HOẶC hoa văn Á Đông tròn xoay (mỗi vòng là 1 thế hệ).
- **Zoom levels**:
  - Level 1: Overview cả họ (500-2000 người) — cluster theo nhánh, LOD (level of detail).
  - Level 2: Nhánh gia đình (~20 người) — hiện tên + avatar.
  - Level 3: Cá nhân — modal chi tiết hồi ký, ảnh, video.
- **Animation "cây mọc"**: khi có thành viên mới → cành mới xuất hiện với hiệu ứng lá xanh.
- **Milestone gợi ý**: bong bóng nổi trên node của thành viên đang sống, gợi ý cập nhật.

### 4.3.4. Performance Requirement
- Render 2000 nodes ở FPS ≥ 30 trên laptop 2020.
- Lazy load: chỉ load hồi ký khi user click node.
- Instanced mesh cho lá cây / avatar node.

---

## 4.4. F4 — CROSS-REFERENTIAL MEMORY GRAPH

### 4.4.1. Cấu trúc đồ thị ký ức

```
(Event: "Đám cưới bố mẹ 1972")
   │
   ├─←(TOLD_BY, perspective: "bà nội")─── (Memory: "Bà nội kể...")
   ├─←(TOLD_BY, perspective: "chú Ba")── (Memory: "Chú Ba kể...")
   ├─←(HAS_PHOTO)──────────────────────── (Photo: photo_id)
   ├─←(HAS_VIDEO)──────────────────────── (Video: video_id)
   ├─←(HAS_AUDIO)──────────────────────── (Audio: audio_id)
   ├─←(HAPPENED_AT)────────────────────── (Location: "Hưng Yên")
   └─←(INVOLVES)───────────────────────── (Person: bố, mẹ, ...)
```

### 4.4.2. Contradiction Detection

Pipeline:
```
[Memory A: "Ngày đó trời mưa"]
[Memory B: "Trời nắng đẹp"]
        │
        ▼
[LLM extractor] → facts: {weather: "rain"}, {weather: "sunny"}
        │
        ▼
[Contradiction detector]
        │
        ▼
[Auto flag] → gợi ý con cháu hỏi thêm để làm rõ (không tự "chọn" bên nào)
```

### 4.4.3. Acceptance Criteria
- Cùng 1 event: hiển thị được nhiều lời kể song song (view "Rashomon mode").
- Contradiction highlight nhưng KHÔNG tự động resolve → nhắc con cháu confirm.
- Search full-text tiếng Việt có dấu / không dấu (Elasticsearch với analyzer VN).

---

## 4.5. F5 — GIA ĐẠO SCROLL

### 4.5.1. Pipeline sinh nội dung

```
[Toàn bộ Memory trong Graph]
        │
        ▼
[Filter: type = "advice" | "proverb" | "life_lesson"]
        │
        ▼
[LLM cluster theo chủ đề]
   • Đạo hiếu
   • Học hành
   • Hôn nhân
   • Làm ăn
   • Đối nhân xử thế
        │
        ▼
[LLM viết chương] — giữ NGUYÊN VĂN trích dẫn, KHÔNG paraphrase
        │
        ▼
[Human review (trưởng họ)]
        │
        ▼
[Publish: PDF / EPUB / interactive web]
```

### 4.5.2. Format xuất

- **PDF**: A5, 2 cột, font UTM Alta cho tiêu đề (phong cách phả ký Việt), font Nunito cho body.
- **EPUB**: có audio player embed cho mỗi lời răn (giọng gốc).
- **Web**: cuộn dọc như thư pháp, có typewriter animation.

### 4.5.3. Anti-hallucination
- **KHÔNG** dùng LLM để "sáng tác" lời răn.
- Chỉ được: trích dẫn, phân loại, sắp xếp, thêm bối cảnh.
- Mỗi trích dẫn phải link ngược về Memory ID gốc.

---

## 4.6. F6 — RITUAL SYNC

### 4.6.1. Kịch bản giỗ tổ đồng bộ

```
T-7 ngày:  Tự động push notification cho cả dòng họ theo lịch âm
T-1 ngày:  Nhắc, hỏi mâm cỗ, upload ảnh cỗ
T-1 giờ:  Countdown, chọn "tham gia" → hiện avatar trong lobby
T-0 (giờ khấn):
   ├─ WebRTC multi-party bật (up to 100 endpoints)
   ├─ Trưởng họ đọc gia huấn (karaoke highlight)
   ├─ Tất cả cùng tap "thắp nhang" → hiệu ứng nến hội tụ
   ├─ Bàn thờ chung 3D hiện tất cả nhang
   └─ Ghi hình toàn buổi lễ, lưu vào archive dòng họ
T+1 ngày: AI tổng hợp album ảnh + video buổi lễ, gửi cho tất cả
```

### 4.6.2. Kiến trúc kỹ thuật

- **WebRTC**: mediasoup SFU (Selective Forwarding Unit) — up to 100 peers.
- **Multi-region**: SFU deploy ở 3 region (SG, US-West, EU) để giảm latency.
- **Sync effect**: nhang tap → gửi event qua Redis pub/sub → broadcast tới tất cả peers trong <500ms.
- **Fallback low-bandwidth**: audio-only mode + static altar view.

### 4.6.3. Acceptance Criteria
- Độ trễ audio < 300ms trong cùng region, < 800ms cross-region.
- Không rớt >5% frame trong buổi lễ 60 phút.
- Recording chất lượng HD 1080p.

---

## 4.7. F7 — CONSENT LEDGER & DIGITAL WILL

### 4.7.1. Consent Record — cấu trúc pháp lý

```
ConsentRecord {
  id: UUID
  subjectPersonId: UUID          // người ký (chủ thể dữ liệu)
  scope: [
    "voice_clone",
    "photo_animation",
    "chatbot_persona",
    "video_reanimation",
    "3d_avatar",
    "commercial_use"           // riêng biệt, mặc định FALSE
  ]
  grantees: [
    { userId: UUID, relationship: "con_gai", accessLevel: "admin" },
    { userId: UUID, relationship: "cháu",   accessLevel: "view_only" }
  ]
  timeLimit: {
    startAt: DateTime,
    endAt: DateTime | null,      // null = perpetual, but subject to Right to Rest
    autoSunsetOnInactivity: {
      enabled: true,
      inactiveYears: 5
    }
  }
  rightToRest: {
    condition: enum(INACTIVITY, MANUAL_TRIGGER, INHERITOR_DECISION),
    inheritorApprovalCount: 2    // ít nhất 2 người kế thừa đồng ý
  }
  signature: {
    method: enum(NATIONAL_EID, HANDWRITTEN_SCAN, VIDEO_CONSENT, NOTARY),
    signedAt: DateTime,
    ipAddress: String,
    deviceFingerprint: String,
    videoConsentUrl: URL | null  // video clip 30s người ký nói rõ đồng ý
  }
  blockchainProof: {
    txHash: String,              // notarize hash lên Polygon zkEVM
    contractAddress: String,
    // KHÔNG lưu PII lên blockchain, chỉ SHA-256 hash của bản ghi
  }
  revocationLog: [
    { revokedAt: DateTime, reason: String, actorId: UUID }
  ]
}
```

### 4.7.2. Right to Rest (Quyền được yên nghỉ)

- **Sunset điều kiện**:
  - Không tương tác 5 năm liên tục → hỏi 2 người kế thừa → tắt persona.
  - Người thừa kế chủ động yêu cầu → cần 2/3 người thừa kế đồng ý.
  - Thời hạn cứng đến hạn → tắt tự động.
- **Sunset không phải delete**: dữ liệu vẫn lưu trữ (cho memorial), chỉ tắt AI interaction.
- Người dùng có thể chọn: `SOFT_SUNSET` (chỉ tắt AI) hoặc `HARD_DELETE` (xóa hoàn toàn).

### 4.7.3. Digital Will (Di chúc số)

```
DigitalWill {
  id: UUID
  testatorId: UUID
  witnessIds: [UUID]              // ít nhất 2 nhân chứng
  inheritors: [
    {
      userId: UUID,
      role: enum(PRIMARY_ADMIN, CO_ADMIN, MEMORIAL_VIEWER),
      quorum: Int                 // số phiếu cần cho action nhạy cảm
    }
  ]
  postMortemInstructions: {
    releaseTimeCapsulesAt: DateTime | "on_death" | "custom_dates",
    activateMemorialMode: Boolean,
    lockedTopics: ["chính trị", "tài chính riêng"],
    finalMessageToFamily: MemoryId
  }
  legalReview: {
    reviewedByLawyerId: UUID | null,
    jurisdiction: "VN" | "US" | ...,
    notarized: Boolean
  }
  createdAt, updatedAt, activatedAt (khi qua đời được xác nhận)
}
```

### 4.7.4. Xác nhận qua đời (Death Verification)

- 3 cơ chế:
  - **Manual + witness**: 2 người thân cùng khai báo + upload giấy chứng tử.
  - **Government API** (tương lai): tích hợp với dịch vụ công VN khi có.
  - **Inactivity + witness**: không login 12 tháng + 3 người thừa kế xác nhận.

### 4.7.5. Acceptance Criteria
- Không thể tạo AI persona nếu không có ConsentRecord active.
- Consent revoke → tất cả AI feature liên quan bị disable trong <5 phút.
- Blockchain proof có thể verify độc lập (public URL).
- Audit log immutable cho mọi hành động trên persona.

---
<a id="chuong-5"></a>
# CHƯƠNG 5 — SYSTEM ARCHITECTURE (6 LỚP)

## 5.1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Multi-platform)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Web (Next.js)│  │Mobile (RN)   │  │ Phone (PSTN) │  │ AR/VR      │  │
│  │ Three.js 3D  │  │ iOS+Android  │  │ Twilio Voice │  │ WebXR/Unity│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
└─────────┼─────────────────┼──────────────────┼────────────────┼─────────┘
          │                 │                  │                │
          ▼                 ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Kong / AWS API Gateway)                │
│              Auth · Rate limit · Request routing · WAF                  │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       MICROSERVICES LAYER (K8s)                         │
│                                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │Identity   │ │Genealogy  │ │Memory     │ │Ritual     │ │Media      │  │
│  │(NestJS)   │ │(NestJS)   │ │(NestJS)   │ │(NestJS)   │ │(NestJS)   │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │Consent    │ │AI Gateway │ │DNA        │ │Notif      │ │Analytics  │  │
│  │(NestJS)   │ │(FastAPI)  │ │(FastAPI)  │ │(NestJS)   │ │(FastAPI)  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AI SERVICES (Python / GPU pool)                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │Voice Clone│ │Photo      │ │RAG        │ │AI         │ │Emotion    │  │
│  │ElevenLabs │ │Restoration│ │Chatbot    │ │Interviewer│ │Detector   │  │
│  │Vbee       │ │GFPGAN     │ │(LlamaIdx) │ │(LangGraph)│ │(wav2vec2) │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │Neo4j      │ │PostgreSQL │ │Elastic    │ │Vector DB  │ │Redis      │  │
│  │(Graph)    │ │(Relational│ │Search     │ │(Qdrant)   │ │(Cache/Pub)│  │
│  │Family Tree│ │Metadata)  │ │(Full-text)│ │(RAG)      │ │           │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                                         │
│  ┌───────────────────────────────────┐  ┌───────────────────────────┐   │
│  │  S3-compatible Media Vault        │  │  Blockchain (Polygon zkEVM│   │
│  │  Encryption at rest (KMS envelope)│  │  Notarize Consent hashes) │   │
│  │  CDN (Cloudflare) for public read │  │                           │   │
│  └───────────────────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5.2. 6-Layer Model (Layered Architecture)

### Layer 1 — Data Foundation
- **Neo4j**: quan hệ gia đình (nhiều họ, đa hôn nhân, con nuôi, ly hôn).
- **PostgreSQL**: metadata, user, subscription, transaction, audit log.
- **Elasticsearch**: full-text search hồi ký tiếng Việt (analyzer VN riêng).
- **Qdrant** (Vector DB): embedding của mọi memory (voice, text, image) cho RAG.
- **Redis**: cache, pub/sub cho Ritual Sync real-time.

### Layer 2 — Media Vault
- **S3-compatible** (AWS S3 hoặc Wasabi để giảm chi phí).
- **Encryption**: AWS KMS envelope encryption — mỗi user có Data Encryption Key (DEK) riêng, DEK được wrap bởi KMS master key.
- **Lifecycle**: hot storage 30 ngày → warm 1 năm → glacier ≥ 1 năm.
- **CDN**: Cloudflare (edge cache media công khai; media riêng tư dùng signed URL 15 phút).
- **Format chuẩn hóa**:
  - Audio: FLAC (lossless) + AAC 128kbps (streaming).
  - Video: H.265 1080p + H.264 720p fallback.
  - Image: AVIF + WebP + JPEG fallback.

### Layer 3 — AI Services
- **Voice Cloning**: Vbee (VN) là primary; ElevenLabs multilingual fallback. Watermark inaudible bằng AudioSeal (Meta).
- **Photo Restoration**: GFPGAN + Real-ESRGAN + DeOldify — GPU workload trên NVIDIA T4/L4.
- **AI Chatbot (Persona)**: RAG kiến trúc bắt buộc — không cho phép LLM "bịa" khi thiếu dữ liệu; response phải cite Memory ID nguồn.
- **AI Interviewer**: LangGraph orchestrator; state machine với emotion-aware transitions.
- **Emotion Detector**: wav2vec2-xlsr-53 fine-tune tiếng Việt.
- **Face Similarity**: FaceNet / ArcFace embeddings so khớp giữa các thế hệ.

### Layer 4 — Consent & Rights Layer
- **Consent Service**: NestJS microservice độc lập, không service khác được bypass.
- **Digital Signature**: Vietnam National eID (VNeID) khi có; fallback video consent + notary.
- **Blockchain Notary**: Polygon zkEVM, smart contract nhận hash SHA-256 của consent record + timestamp.
- **Right to Rest daemon**: cronjob quét inactivity, gửi request kế thừa duyệt.

### Layer 5 — Ritual / Experience Layer
- **Next.js 14** với App Router + React Server Components.
- **Three.js / React Three Fiber**: cây gia phả 3D, altar 3D.
- **mediasoup SFU**: WebRTC multi-party (Ritual Sync).
- **React Native + Expo**: mobile iOS/Android.
- **Twilio Programmable Voice**: PSTN gateway cho AI Interviewer với ông bà.

### Layer 6 — Community & Rituals
- **WebSocket** (Socket.IO): real-time sync giữa các peer trong buổi lễ.
- **Notification service**: FCM (Android), APNs (iOS), Email (Postmark), SMS (Twilio), Zalo Notification Service (VN).
- **Community feed**: hoạt động dòng họ, tin nhắn nội bộ (không phải mạng xã hội mở).

## 5.3. Cross-Cutting Concerns

| Concern | Solution |
|---------|----------|
| **Observability** | OpenTelemetry → Grafana + Loki + Tempo + Prometheus |
| **Auth** | Auth0 hoặc self-hosted Keycloak; JWT + refresh token; VNeID SSO |
| **Rate limit** | Kong + Redis token bucket |
| **Feature flag** | Unleash / LaunchDarkly |
| **Job queue** | BullMQ (Redis) cho short jobs; Temporal cho long workflows (voice clone training) |
| **File upload** | Presigned S3 URL, multipart upload, virus scan (ClamAV) trước khi accept |
| **i18n** | i18next; hỗ trợ vi-VN, en-US, zh-CN, ja-JP, ko-KR |

## 5.4. Data Flow ví dụ: "Con cháu upload ảnh thờ để phục hồi"

```
[Client] upload ảnh
   │
   ▼
[API Gateway] auth + rate limit
   │
   ▼
[Media Service] presigned S3 URL
   │
   ▼
[S3 Media Vault] lưu ảnh gốc (encrypted)
   │
   ▼
[Media Service] tạo job {type: "RESTORE_PHOTO", assetId, userId}
   │
   ▼
[BullMQ queue]
   │
   ▼
[AI Worker (GPU)] pull job
   │  ├─ face detect + align
   │  ├─ GFPGAN restore
   │  ├─ DeOldify colorize
   │  └─ Real-ESRGAN upscale 4x
   ▼
[S3 Media Vault] lưu 3 phiên bản output
   │
   ▼
[Notification service] push "Ảnh đã phục hồi" đến client
   │
   ▼
[Client] render 3 phiên bản, user chọn phiên bản dùng
   │
   ▼
[Memory Service] gắn ảnh chosen vào Person node trong Neo4j
```

---
<a id="chuong-6"></a>
# CHƯƠNG 6 — DATABASE SCHEMA

## 6.1. Vì sao dùng 4 loại DB?

| DB | Purpose | Ví dụ |
|----|---------|-------|
| **Neo4j** | Quan hệ gia đình phức tạp (đa hôn nhân, con nuôi, họ ngoại) | Truy vấn "tất cả con cháu đời thứ 5 của cụ Tứ" |
| **PostgreSQL** | Dữ liệu có schema cứng, transaction ACID | User, subscription, payment, audit log |
| **Elasticsearch** | Full-text search tiếng Việt | Tìm "ông cố tôi tên gì?" trong 10,000 hồi ký |
| **Qdrant Vector** | Semantic search & RAG | Chatbot persona tìm memory tương tự để trả lời |

## 6.2. Neo4j — Graph Model (Family & Memory)

### 6.2.1. Node types

```
(:Person {
  id: UUID,
  fullName: String,
  aliases: [String],       // tên tự, tên hiệu, tên gọi ở nhà
  gender: enum(M, F, OTHER),
  birthDate: Date | null,
  deathDate: Date | null,
  birthPlace: String,
  deathPlace: String,
  isAlive: Boolean,
  bio: Text,
  religion: String,
  occupation: [String],
  photoIds: [UUID],
  audioIds: [UUID],
  videoIds: [UUID],
  createdBy: UUID (user),
  createdAt: DateTime,
  updatedAt: DateTime,
  // Meta
  isVerified: Boolean,     // trưởng họ xác minh
  confidenceScore: Float   // độ tin cậy khi có nhiều source
})

(:Clan {
  id: UUID,
  name: String,             // "Họ Nguyễn tại Hưng Yên"
  originPlace: String,
  foundedYear: Int,
  crestImageId: UUID,
  patriarchIds: [UUID]      // hội đồng gia tộc hiện tại
})

(:Memory {
  id: UUID,
  type: enum(TEXT, AUDIO, VIDEO, PHOTO, MIXED),
  content: Text,             // transcript hoặc caption
  mediaAssetIds: [UUID],
  language: String,
  perspective: String,       // "kể bởi cô Ba"
  createdAt: DateTime,
  eventDate: Date | null,    // sự kiện xảy ra khi nào
  location: String,
  embeddingId: UUID          // reference đến Qdrant vector
})

(:Event {
  id: UUID,
  title: String,             // "Đám cưới bố mẹ 1972"
  eventDate: Date,
  eventType: enum(WEDDING, FUNERAL, BIRTH, DEATH, WAR, MIGRATION, ...),
  location: String,
  significance: enum(FAMILY, CLAN, HISTORICAL)
})

(:Location {
  id: UUID,
  name: String,
  addressVn: String,
  lat: Float, lng: Float,
  historicalNames: [String]   // tên cũ (VD: "Hà Đông" trước 2008)
})

(:Advice {                    // trích xuất riêng cho Gia Đạo Scroll
  id: UUID,
  originalText: String,       // giữ nguyên văn
  category: enum(FILIAL_PIETY, EDUCATION, MARRIAGE, BUSINESS, ETHICS),
  sourceMemoryId: UUID,       // link ngược về Memory
  spokenBy: UUID              // Person
})
```

### 6.2.2. Relationship types

```
(:Person)-[:CHILD_OF {biological: true|false, adopted: bool}]->(:Person)
(:Person)-[:SPOUSE_OF {marriedAt: Date, divorcedAt: Date|null, order: Int}]->(:Person)
(:Person)-[:SIBLING_OF]->(:Person)      // suy diễn từ CHILD_OF
(:Person)-[:BELONGS_TO]->(:Clan)
(:Person)-[:HAS_MEMORY]->(:Memory)
(:Person)-[:GAVE_ADVICE]->(:Advice)
(:Memory)-[:ABOUT_EVENT]->(:Event)
(:Memory)-[:INVOLVES_PERSON]->(:Person)
(:Memory)-[:HAPPENED_AT]->(:Location)
(:Memory)-[:TOLD_BY {perspective: String}]->(:Person)
(:Event)-[:HAPPENED_AT]->(:Location)
(:Event)-[:INVOLVES]->(:Person)
```

### 6.2.3. Sample Cypher queries

**Q1: Tất cả con cháu đời thứ 3 của cụ Tứ**
```cypher
MATCH (root:Person {id: $rootId})<-[:CHILD_OF*3]-(desc:Person)
RETURN desc
```

**Q2: Tất cả câu chuyện về đám cưới bố mẹ tôi từ mọi góc nhìn**
```cypher
MATCH (event:Event {id: $eventId})<-[:ABOUT_EVENT]-(mem:Memory)
      <-[:HAS_MEMORY]-(teller:Person)
RETURN event, mem, teller
ORDER BY mem.createdAt
```

**Q3: Phát hiện mâu thuẫn giữa 2 memory về cùng event**
```cypher
MATCH (e:Event {id: $eventId})<-[:ABOUT_EVENT]-(m1:Memory),
      (e)<-[:ABOUT_EVENT]-(m2:Memory)
WHERE m1.id < m2.id
RETURN m1, m2
// → gửi cặp (m1, m2) sang LLM contradiction detector
```

## 6.3. PostgreSQL — Relational Schema (core tables)

### 6.3.1. Users & Auth
```
users (
  id UUID PK,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  hashed_password TEXT,
  vneid_verified BOOLEAN,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language VARCHAR(10),
  timezone VARCHAR(50),
  created_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
)

user_person_links (            -- link user với Person node trong Neo4j
  user_id UUID FK,
  person_id UUID,              -- Neo4j Person.id
  relationship_role enum('self', 'admin_for', 'guardian_for'),
  created_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, person_id)
)
```

### 6.3.2. Consent Ledger
```
consent_records (
  id UUID PK,
  subject_person_id UUID,
  scope JSONB,                  -- array of scopes
  grantees JSONB,
  time_start TIMESTAMPTZ,
  time_end TIMESTAMPTZ,
  auto_sunset_config JSONB,
  right_to_rest JSONB,
  signature_method VARCHAR(50),
  signed_at TIMESTAMPTZ,
  signer_ip INET,
  signer_device_fingerprint TEXT,
  video_consent_url TEXT,
  blockchain_tx_hash TEXT,
  blockchain_contract_address TEXT,
  status enum('active', 'revoked', 'sunset', 'pending'),
  created_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
)

digital_wills (
  id UUID PK,
  testator_person_id UUID,
  witness_ids UUID[],
  inheritors JSONB,
  post_mortem_instructions JSONB,
  legal_review JSONB,
  status enum('draft', 'signed', 'activated'),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

### 6.3.3. Subscription & Billing
```
subscriptions (
  id UUID PK,
  user_id UUID FK,
  plan enum('free', 'family', 'clan', 'lifetime'),
  status enum('active', 'trialing', 'past_due', 'canceled'),
  billing_cycle enum('monthly', 'yearly', 'lifetime'),
  amount_cents INT,
  currency CHAR(3),
  provider enum('stripe', 'vnpay', 'momo'),
  provider_subscription_id TEXT,
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
)

clans (                          -- workspace cho dòng họ (B2B)
  id UUID PK,
  name TEXT,
  neo4j_clan_id UUID,
  patriarch_user_id UUID,
  member_count INT,
  subscription_id UUID,
  merit_fund_balance_vnd BIGINT
)
```

### 6.3.4. Audit Log (immutable)
```
audit_logs (
  id UUID PK,
  actor_user_id UUID,
  action VARCHAR(100),           -- 'consent.grant', 'persona.chat', 'memory.delete'
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at)  -- partition theo tháng
```

### 6.3.5. AI Interviewer Sessions
```
interview_sessions (
  id UUID PK,
  interviewee_person_id UUID,
  scheduled_by_user_id UUID,
  channel enum('app_voip', 'pstn_twilio'),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  status VARCHAR(30),
  topic TEXT,
  language VARCHAR(20),
  ai_host_id VARCHAR(50),
  audio_recording_s3_key TEXT,
  transcript_raw JSONB,
  transcript_structured JSONB,
  emotion_timeline JSONB,
  consent_record_id UUID,
  reviewed_by_user_id UUID,
  reviewed_at TIMESTAMPTZ,
  approved BOOLEAN
)
```

## 6.4. Elasticsearch — Full-text index

Index chính: `memories_v1`

Mapping (rút gọn):
```
{
  "settings": {
    "analysis": {
      "analyzer": {
        "vietnamese_analyzer": {
          "type": "custom",
          "tokenizer": "vi_tokenizer",       // VietnameseTokenizer plugin
          "filter": ["lowercase", "vi_stop", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "memoryId": { "type": "keyword" },
      "personIds": { "type": "keyword" },
      "content": { "type": "text", "analyzer": "vietnamese_analyzer" },
      "contentNoTone": { "type": "text" },   // không dấu, search fuzzy
      "eventDate": { "type": "date" },
      "location": { "type": "text" },
      "language": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

## 6.5. Qdrant — Vector DB for RAG

Collection: `memory_embeddings`

```
{
  "vectors": {
    "size": 1024,
    "distance": "Cosine"
  },
  "payload_schema": {
    "memoryId": "keyword",
    "personId": "keyword",
    "clanId": "keyword",
    "modality": "keyword",       // text | audio | image
    "language": "keyword",
    "createdAt": "datetime"
  }
}
```

Embedding model: **multilingual-e5-large** (support tiếng Việt) hoặc **BGE-M3**.

Ảnh dùng CLIP ViT-L/14; audio dùng CLAP.

## 6.6. Redis — Cache & Pub/Sub

Keys pattern:
```
altar:presence:{altarId}          -- Set of userIds currently present
ritual:sync:{ritualId}:effects    -- Stream (Redis Streams) for effect events
persona:chat:{personaId}:context  -- LRU cache context window
person:tree:cache:{personId}      -- JSON cache 5 min
rate_limit:{userId}:{endpoint}    -- Token bucket
```

## 6.7. Migration strategy

- **Neo4j**: Liquibase-Neo4j hoặc `neo4j-migrations`.
- **PostgreSQL**: Prisma Migrate hoặc Flyway.
- **Elasticsearch**: alias-based reindex (blue/green).
- **Qdrant**: versioned collections.

---
<a id="chuong-7"></a>
# CHƯƠNG 7 — BACKEND DESIGN (MICROSERVICES)

## 7.1. Bounded Contexts (DDD)

Chia 10 microservices theo bounded context:

| # | Service | Ngôn ngữ | Trách nhiệm chính |
|---|---------|----------|-------------------|
| 1 | **Identity Service** | NestJS | Auth, user profile, VNeID, RBAC |
| 2 | **Genealogy Service** | NestJS | CRUD Person, Clan, mối quan hệ (Neo4j) |
| 3 | **Memory Service** | NestJS | CRUD Memory, Event, Advice; index ES/Qdrant |
| 4 | **Ritual Service** | NestJS | Digital Altar, Ritual Sync, lịch âm |
| 5 | **Media Service** | NestJS | Upload, transcode, thumbnail, presigned URL |
| 6 | **Consent Service** | NestJS | Consent Ledger, Digital Will, blockchain notary |
| 7 | **AI Gateway** | FastAPI | Điều phối AI (voice clone, RAG, interviewer) |
| 8 | **DNA Service** | FastAPI | Import DNA, matching, ethnic origin |
| 9 | **Notification Service** | NestJS | Push, email, SMS, Zalo, in-app |
| 10 | **Analytics Service** | FastAPI | Product metrics, engagement, moderation stats |

## 7.2. Communication patterns

- **Sync**: REST (public API) + gRPC (internal service-to-service).
- **Async**: Kafka (event streaming) cho các event lớn (memory.created, persona.chat.completed, consent.revoked).
- **Real-time**: Socket.IO cho Ritual Sync, presence, notification push.

## 7.3. API Design — REST + GraphQL

### Public API: REST (versioned)

Base URL: `https://api.Gia Sử Ký.app/v1`

Auth: Bearer JWT trong `Authorization` header.

**Ví dụ endpoint (mô tả, không code):**

```
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/vneid/callback

GET    /v1/clans/{clanId}
POST   /v1/clans
GET    /v1/clans/{clanId}/tree?depth=5&format=graph
POST   /v1/clans/{clanId}/members
GET    /v1/clans/{clanId}/altar

GET    /v1/persons/{personId}
POST   /v1/persons
PATCH  /v1/persons/{personId}
POST   /v1/persons/{personId}/relationships  { targetPersonId, type }
GET    /v1/persons/{personId}/memories?type=audio&limit=20

POST   /v1/memories                          multipart upload
GET    /v1/memories/{memoryId}
DELETE /v1/memories/{memoryId}

POST   /v1/interviews                        { intervieweeId, channel, scheduledAt }
GET    /v1/interviews/{sessionId}
POST   /v1/interviews/{sessionId}/approve

POST   /v1/consent                           { subjectPersonId, scope, grantees, ... }
POST   /v1/consent/{consentId}/revoke
GET    /v1/consent/subject/{personId}

POST   /v1/personas/{personId}/chat          { message } → streaming SSE response
GET    /v1/personas/{personId}/status

POST   /v1/rituals                           { title, scheduledAt, participants }
GET    /v1/rituals/{ritualId}/join           → WebSocket upgrade

POST   /v1/dna/import                        { provider: '23andme'|'ancestry', file }
GET    /v1/dna/matches
POST   /v1/dna/matches/{matchId}/contact-request

POST   /v1/media/upload                      → presigned S3 URL
POST   /v1/media/{mediaId}/restore-photo
```

### Internal API: GraphQL (BFF cho frontend)

- Frontend web/mobile gọi 1 GraphQL endpoint: `POST /graphql`.
- BFF layer (Apollo Server) fetch từ nhiều microservice REST/gRPC.
- Ưu điểm: giảm over-fetching, phù hợp cho UI phức tạp (Living Tree).

**Ví dụ GraphQL schema (rút gọn):**
```
type Query {
  me: User!
  person(id: ID!): Person
  clanTree(clanId: ID!, depth: Int = 5): TreeGraph!
  memoriesByPerson(personId: ID!, filter: MemoryFilter): [Memory!]!
  ritualUpcoming: [Ritual!]!
}

type Mutation {
  createMemory(input: CreateMemoryInput!): Memory!
  linkPersons(from: ID!, to: ID!, type: RelationType!): Boolean!
  grantConsent(input: ConsentInput!): ConsentRecord!
  scheduleInterview(input: InterviewInput!): InterviewSession!
}

type Subscription {
  ritualEvents(ritualId: ID!): RitualEvent!    # WebSocket
  personaChatStream(personId: ID!): ChatChunk! # streaming reply
}
```

## 7.4. AI Gateway Service (chi tiết)

AI Gateway là **hub trung tâm** cho mọi AI call — không service nào gọi trực tiếp OpenAI/ElevenLabs.

**Lý do**:
- Kiểm soát chi phí, rate limit, cost attribution.
- Áp dụng consent check trước mọi AI call.
- Vendor switching (Vbee ↔ ElevenLabs, Anthropic ↔ OpenAI).
- Cache & fallback.

**Kiến trúc nội bộ (pseudo):**
```
AIGateway (FastAPI)
├── endpoints/
│   ├── /voice/clone-train      → Vbee/ElevenLabs
│   ├── /voice/synthesize       → TTS streaming
│   ├── /chat/persona           → RAG pipeline
│   ├── /interview/turn         → dialog manager
│   ├── /photo/restore          → GPU worker queue
│   └── /embed                  → embedding service
├── middlewares/
│   ├── consent_check           → bắt buộc verify ConsentRecord.active
│   ├── rate_limit_per_persona  → Redis token bucket
│   ├── cost_attribution        → log tokens/duration to Analytics
│   └── watermark_injection     → AudioSeal cho mọi output voice
├── providers/
│   ├── vbee.py
│   ├── elevenlabs.py
│   ├── anthropic.py
│   ├── openai.py
│   ├── local_llama.py
│   └── stability.py
└── workers/                    → BullMQ / Temporal
    ├── photo_restoration_worker
    ├── voice_clone_training_worker
    └── memory_embedding_worker
```

## 7.5. RAG Pipeline chi tiết (cho Persona Chatbot)

```
User query: "Ông ơi, ngày xưa ông có nuôi vịt không?"
     │
     ▼
[1. Query embedding]  ← multilingual-e5-large
     │
     ▼
[2. Vector search Qdrant]  ← top-K = 20 memories từ persona này
     │
     ▼
[3. BM25 hybrid rerank]    ← Elasticsearch BM25 + cross-encoder rerank top-5
     │
     ▼
[4. Consent filter]        ← chỉ giữ memories có consent public đến user hiện tại
     │
     ▼
[5. Prompt assembly]
     SYSTEM: "Bạn đóng vai {personaName}, quê {que}, giọng {region}.
              CHỈ được trả lời dựa trên MEMORIES dưới đây. 
              Nếu không có thông tin → nói 'Ông không nhớ rõ chuyện đó cháu ạ'.
              KHÔNG BỊA. KHÔNG đưa ra ý kiến chính trị/y tế/tài chính.
              KHÔNG bao giờ yêu cầu tiền, OTP, hoặc thông tin cá nhân."
     MEMORIES: [top-5 với metadata]
     USER: "{query}"
     │
     ▼
[6. LLM call]  ← Claude Sonnet / Llama 3.1 70B
     │
     ▼
[7. Post-process]
     • Cite Memory IDs
     • Scan output với anti-scam classifier
     • Nếu output mention tiền/OTP → block + log alert
     │
     ▼
[8. TTS synthesis với voice clone]  ← streaming
     │
     ▼
[9. AudioSeal watermark inject]
     │
     ▼
[10. Stream về client]
```

## 7.6. Đảm bảo Anti-Hallucination

Nguyên tắc **cứng**:
1. LLM **không** được response nếu không có ít nhất 1 memory match (threshold > 0.7 cosine).
2. Mọi câu trả lời phải kèm `citations: [memoryId1, memoryId2, ...]`.
3. UI phải hiển thị "Nguồn:" clickable cho mỗi câu.
4. Nếu LLM output chứa các từ ngoài scope (chính trị, y tế cụ thể), auto-block.
5. Người dùng có thể flag câu trả lời → training data cho fine-tune.

## 7.7. Job Queue Architecture

- **BullMQ** (Redis): short-lived jobs (< 5 phút), retry logic đơn giản.
  - Photo restore, memory embed, notification push.
- **Temporal.io**: long-running workflows với durable state.
  - Voice clone training (30-60 phút).
  - Ritual Sync orchestration (chuẩn bị buổi lễ 1 tuần trước).
  - Right-to-Rest sunset flow (nhiều tuần chờ quorum).

## 7.8. Error handling & Retry

- API error format: RFC 7807 (Problem Details).
- Idempotency: mọi POST có `Idempotency-Key` header (Stripe style).
- Retry: exponential backoff cho worker jobs (3 lần, 1s / 4s / 16s).
- Dead letter queue cho jobs fail vĩnh viễn → alert on-call.

## 7.9. Rate Limits (initial)

| Endpoint | Free tier | Paid tier |
|----------|-----------|-----------|
| `/v1/personas/*/chat` | 20 msg/day | 500 msg/day |
| `/v1/media/upload` | 100 MB/day | 5 GB/day |
| `/v1/interviews` | 1 session/week | 5 sessions/week |
| `/v1/photo/restore` | 5 ảnh/tháng | 100 ảnh/tháng |
| Voice clone training | 0 (paid only) | 3 voice models/năm |

---
<a id="chuong-8"></a>
# CHƯƠNG 8 — FRONTEND DESIGN (Web + Mobile)

## 8.1. Tech Stack

### Web (Next.js 14)
- **Framework**: Next.js 14 (App Router, RSC, Server Actions).
- **UI kit**: shadcn/ui + Tailwind CSS 3.
- **3D**: React Three Fiber + Drei + Three.js r160.
- **State**: Zustand (client state) + TanStack Query v5 (server state).
- **Forms**: React Hook Form + Zod validation.
- **Animation**: Framer Motion.
- **Icons**: Lucide + custom Á Đông pack (hoa văn trống đồng, đèn lồng, sen).
- **Fonts**:
  - Body: Nunito Sans (Vietnamese diacritic support tốt).
  - Heading (phong cách phả ký): UTM Alta / Bookerly.
  - Chinese: Noto Serif SC (cho cộng đồng gốc Hoa).
- **i18n**: next-intl.
- **Testing**: Vitest + Playwright.

### Mobile (React Native + Expo)
- **Framework**: Expo SDK 51+ với New Architecture (Fabric + TurboModules).
- **Navigation**: Expo Router (file-based).
- **3D**: `react-native-skia` cho 2D flourish, hoặc WebView + Three.js cho 3D tree.
- **AR**: `expo-three-ar` + ARKit / ARCore (viewing mộ tổ 3D).
- **Native modules**:
  - `react-native-audio-recorder-player` (recording lời khấn).
  - `expo-haptics` (thắp nhang haptic feedback).
  - `react-native-webrtc` (Ritual Sync).
- **State/UI/Query**: giống web.

## 8.2. Information Architecture

```
[Landing / Onboarding]
   │
   ▼
[Home Feed]
   │
   ├─→ [Living Tree]        ← default view, 3D cây gia phả
   │      └─→ [Person Detail Modal]
   │             ├─→ [Hồi ký (Memory)]
   │             ├─→ [Ảnh & Video]
   │             ├─→ [Persona Chat] (nếu có consent)
   │             └─→ [Consent & Digital Will]
   │
   ├─→ [Digital Altar]      ← 3D altar
   │      ├─→ [Thắp nhang / Khấn]
   │      └─→ [Xem ảnh thờ / Nghe gia huấn]
   │
   ├─→ [Memory Graph]       ← Rashomon view
   │
   ├─→ [Gia Đạo Scroll]     ← cuộn dọc thư pháp
   │
   ├─→ [Ritual Center]      ← lịch âm, giỗ, buổi lễ đồng bộ
   │      └─→ [Live Ritual Room]
   │
   ├─→ [AI Interviewer]     ← schedule + review transcript
   │
   ├─→ [DNA]                ← import + matches
   │
   ├─→ [Clan Workspace]     ← B2B dòng họ (nếu là thành viên)
   │      ├─→ [Công đức khuyến học]
   │      ├─→ [Hội đồng]
   │      └─→ [In phả đồ]
   │
   └─→ [Settings]
          ├─→ [Consent Ledger]
          ├─→ [Digital Will]
          ├─→ [Subscription]
          ├─→ [Privacy]
          └─→ [Export/Delete data]
```

## 8.3. Design System

### 8.3.1. Color palette (semantic tokens)

- **Primary**: `#8B0000` (đỏ son truyền thống, dùng cho action chính, nhang).
- **Secondary**: `#D4AF37` (vàng đồng — dùng cho accent, khung ảnh thờ).
- **Neutral**: warm gray (không dùng cold blue-gray của tech thông thường).
- **Success**: `#4E8B3B`.
- **Warning**: `#C68A31`.
- **Sacred (Digital Altar background)**: `#1A1416` (đen ám khói).
- **Paper (Gia Đạo Scroll)**: `#F5EFDD` (giấy dó).

### 8.3.2. Typography scale

| Token | Size | Line-height | Use |
|-------|------|-------------|-----|
| display-1 | 48px | 1.1 | Landing hero |
| display-2 | 36px | 1.15 | Section title |
| heading-1 | 28px | 1.2 | Page title |
| heading-2 | 22px | 1.3 | Card title |
| body-1 | 16px | 1.5 | Default body |
| body-2 | 14px | 1.5 | Metadata |
| caption | 12px | 1.4 | Timestamps, hints |
| scroll-serif | 20px | 1.8 | Gia Đạo Scroll text |

### 8.3.3. Motion principles

- **Digital Altar**: chậm, tôn nghiêm, ease-in-out 600ms+.
- **Living Tree**: mềm, có "quán tính" khi xoay.
- **Ritual Sync**: đồng bộ nhịp — countdown pulse theo BPM = 60.
- **Milestone push**: bong bóng nổi lên mềm, không giật.

### 8.3.4. Accessibility (A11y)

- WCAG 2.1 Level AA tối thiểu; AAA cho ông bà mode.
- **Ông bà mode** (toggle trong settings): font 20px+ base, contrast tăng, animation giảm, voice-over toàn bộ.
- Keyboard navigation đầy đủ.
- Screen reader labels tiếng Việt chính xác (đặc biệt danh xưng).

## 8.4. Key screens — mô tả chi tiết

### 8.4.1. Living Tree — 3D view

- **Layout**: fullscreen canvas 3D.
- **Camera**: orbit control (mouse drag / touch pan-pinch).
- **Rendering**:
  - Node = quả cầu + avatar image texture.
  - Cạnh = đường cong Bezier giữa parent-child.
  - Người đang sống: cây lá xanh.
  - Người đã mất: lá vàng hoặc hạc trắng biểu tượng.
  - Nhánh chưa xác minh: đường đứt nét.
- **Interaction**:
  - Click node → panel trượt ra bên phải (30% viewport) hiển thị chi tiết.
  - Hover node → tooltip tên + năm sinh/mất.
  - Long press → context menu (edit, add child, view memories).
- **LOD (Level of Detail)**:
  - >100 nodes visible: chỉ hiện tên nhánh cấp cao.
  - <30 nodes: hiện avatar + tên đầy đủ.
- **Search**: bar top-left, kết quả highlight node trong cây.

### 8.4.2. Digital Altar — 3D scene

- **Layout**: fullscreen 3D immersive.
- **Camera**: fixed frontal, có subtle parallax khi rê chuột.
- **Scene composition**:
  - Bàn thờ chính giữa (theme theo tôn giáo).
  - Ảnh thờ trên bàn (glow effect).
  - Bát hương phía trước.
  - Hai bên: cặp đèn/nến.
  - Phía sau: bức hoành phi (customizable).
- **Interaction primitives**:
  - Tap bát hương → nhang mọc lên, khói bốc, chuông ngân.
  - Tap ảnh thờ → hiện info card + play voice clone (nếu có consent).
  - Tap "khấn" → mic bật, ghi âm lời khấn cá nhân.
- **Ambient**: âm thanh nền tùy chọn (mưa, chim, chuông chùa, tụng kinh, tuyệt đối không nhạc thương mại).
- **2D fallback**: nếu WebGL không hỗ trợ → view 2D vẫn giữ layout altar.

### 8.4.3. Memory Graph — Rashomon view

- **Layout**: timeline center + branches perspectives ở 2 bên.
- **Center**: event card với ngày, địa điểm, ảnh chính.
- **2 bên**: các memory từ nhiều người kể, xếp theo perspective:
  ```
          [Bà nội kể] ─── EVENT ─── [Chú Ba kể]
                          │
                          ▼
                    [Ảnh gốc 1972]
  ```
- **Highlight mâu thuẫn**: đường nối màu đỏ giữa 2 memory conflict, click để xem chi tiết.
- **Filter**: theo perspective, theo modality, theo độ tin cậy.

### 8.4.4. AI Interviewer setup screen

- **Wizard 4 step**:
  1. Chọn người được phỏng vấn (person picker).
  2. Chọn kênh (app VoIP / gọi điện thoại thường).
  3. Chọn chủ đề (câu hỏi gợi ý) + lịch (weekly / one-time).
  4. Xác nhận consent (upload video consent hoặc nhấn "đã có sẵn").
- **Review screen** (sau khi phỏng vấn xong):
  - Player audio với timeline.
  - Transcript song song, highlight emotion.
  - Nút "duyệt" cho mỗi đoạn — chỉ đoạn duyệt mới vào Memory Graph.
  - Có thể edit transcript trước khi lưu.

### 8.4.5. Ritual Sync — Live room

- **Layout**: split-screen.
  - **Left 60%**: 3D altar view chung (shared canvas).
  - **Right 40%**: video grid participants (WebRTC).
- **Top bar**: countdown timer, tên buổi lễ, số người tham gia.
- **Bottom action bar**:
  - Thắp nhang (đồng bộ)
  - Đọc gia huấn (karaoke text scroll)
  - Ghi âm lời khấn chung
  - Mic on/off
- **Cinematic mode**: sau buổi lễ, replay dạng cinematic với chapter markers.

### 8.4.6. Gia Đạo Scroll — Reader

- **Layout**: single-column cuộn dọc trên nền giấy dó, font thư pháp cho tiêu đề chương.
- **Interaction**:
  - Scroll xuống → chapter transition với hiệu ứng cuộn giấy.
  - Tap trích dẫn → play audio giọng gốc.
  - Tap tên người → nhảy về Person detail.
- **Export**:
  - Menu → Export → chọn format (PDF, EPUB, in ấn phả đồ A4/A5).
  - Song ngữ option (Việt–Anh) cho Việt kiều.

## 8.5. Offline & Sync

- **Offline-first cho mobile**:
  - Local SQLite mirror của tree gần nhất (5 gen quanh user).
  - Media cached: audio/video/photo đã view gần nhất (500 MB budget).
  - Ritual queued (thắp nhang offline sẽ sync khi online).
- **Conflict resolution**: last-write-wins với warning UI; conflict-heavy fields (bio, dates) yêu cầu manual merge.

## 8.6. Performance budgets

| Metric | Target |
|--------|--------|
| First Contentful Paint (Web) | < 1.8s (LTE 4G) |
| Largest Contentful Paint | < 2.5s |
| INP (interaction) | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| JS bundle size (route) | < 250KB gzipped |
| 3D scene load | < 3s trên iPhone 12 |
| Mobile cold start | < 2s |

---
<a id="chuong-9"></a>
# CHƯƠNG 9 — AI/ML PIPELINE

## 9.1. AI Portfolio

| # | Capability | Model / Vendor | Primary use case |
|---|-----------|----------------|------------------|
| 1 | Vietnamese ASR (đa vùng miền) | Whisper large-v3 fine-tune + PhoWhisper | AI Interviewer transcript |
| 2 | TTS voice cloning | Vbee (VN primary), ElevenLabs (fallback) | Persona voice |
| 3 | Emotion recognition (audio) | wav2vec2-xlsr-53 VN fine-tune | Detect buồn/mệt trong Interview |
| 4 | LLM (dialog + RAG) | Claude Sonnet, Llama 3.1 70B (local backup) | AI Host, Persona Chat |
| 5 | Text embedding | multilingual-e5-large, BGE-M3 | RAG search |
| 6 | Image embedding | CLIP ViT-L/14 | Face similarity, photo search |
| 7 | Audio embedding | CLAP | Audio memory RAG |
| 8 | Face restoration | GFPGAN v1.4 + CodeFormer | Phục hồi ảnh thờ |
| 9 | Colorization | DeOldify NoGAN | Tô màu ảnh đen trắng |
| 10 | Upscale | Real-ESRGAN x4 | Nâng độ phân giải |
| 11 | Face detection & similarity | MediaPipe + ArcFace | "Con giống ai" |
| 12 | Content moderation | AWS Rekognition + PhoBERT toxic classifier | Ảnh, text upload |
| 13 | AI watermark (audio) | Meta AudioSeal | Anti-scam voice clone |
| 14 | AI watermark (image) | Meta Stable Signature | Truy vết ảnh AI |
| 15 | Speech emotion synthesis | ElevenLabs Turbo v2 | Voice có cảm xúc phù hợp bối cảnh |

## 9.2. Voice Cloning Pipeline (chi tiết)

### 9.2.1. Yêu cầu training data
- **Tối thiểu**: 30 phút audio sạch (SNR > 25dB, không nhạc nền).
- **Khuyến nghị**: 3-5 giờ để đạt ~90% chân thực (theo Vbee benchmark).
- Nhiều phrase đa dạng: đọc số, tên riêng, cảm xúc (cười, buồn, ngạc nhiên).
- **Consent bắt buộc**: video 30 giây trong đó chủ thể **nói rõ** "Tôi đồng ý cho phép tạo bản sao giọng nói của tôi".

### 9.2.2. Pipeline
```
[Upload audio raw]
      │
      ▼
[Preprocessing]
   • Noise reduction (RNNoise)
   • Silence trim
   • Loudness normalize (-20 LUFS)
   • Split segments 3-15s
      │
      ▼
[Quality check]
   • SNR ≥ 25dB
   • Total duration ≥ 30 phút
   • Không có tiếng người khác
   • Reject nếu fail
      │
      ▼
[Consent verification]
   • Kiểm tra ConsentRecord active
   • Face match giữa video consent và chủ thể ảnh trong hệ thống
      │
      ▼
[Training job on Vbee / ElevenLabs]
   • Push data
   • Poll status
   • Timeout: 60 phút
      │
      ▼
[Watermark test]
   • Synthesize 10 sample
   • Verify AudioSeal detectable
      │
      ▼
[Register voice model in registry]
   • voice_id → S3 model ref
   • version, dataset hash, consent_id
      │
      ▼
[Ready for use in Persona Chat / Gia Đạo Scroll audio]
```

### 9.2.3. Anti-abuse guardrails
- Voice model không được export ngoài platform.
- Không được tạo model cho public figures (celebrity list block).
- Watermark bắt buộc; nếu vendor không hỗ trợ → apply post-processing watermark.
- Log mọi synthesis request (audit trail).
- Chèn 1-time inaudible signature ID vào mỗi output → truy vết nếu bị dùng scam.

## 9.3. AI Interviewer — Dialog State Machine

```
STATES:
  GREETING → TOPIC_INTRO → OPEN_QUESTION → LISTENING →
  FOLLOWUP → EMOTION_CHECK → SEGUE / CLOSE

Transitions:
  GREETING → TOPIC_INTRO           (sau khi user chào lại)
  OPEN_QUESTION → LISTENING        (sau khi hỏi)
  LISTENING → FOLLOWUP             (nếu response < 60s và có ý mở)
  LISTENING → EMOTION_CHECK        (nếu emotion="sad" hoặc silence>15s)
  EMOTION_CHECK → SEGUE            (nếu vẫn muốn tiếp)
  EMOTION_CHECK → CLOSE            (nếu quá buồn hoặc mệt)
  FOLLOWUP → LISTENING
  * → CLOSE                        (nếu duration > max hoặc user yêu cầu)
```

Sử dụng **LangGraph** để implement — state persistent trong Redis, có thể resume nếu cuộc gọi bị cắt.

## 9.4. Photo Restoration Workflow

Multi-stage GPU pipeline (chi tiết đã có trong 4.1.4):

Estimate GPU time: ~15s / ảnh trên NVIDIA L4.

Batch xử lý: 10 ảnh/batch để amortize model load.

**Post-processing quality gate**:
- Nếu SSIM giữa restored và original quá thấp (< 0.4) → cảnh báo "AI có thể đã thay đổi diện mạo, hãy xem xét".
- Không tự động replace ảnh gốc; luôn giữ 3 phiên bản.

## 9.5. Persona Chatbot — Full RAG (mở rộng 7.5)

### 9.5.1. Data preparation
- Sau mỗi Interview approved → memories mới được chunk (256-512 tokens).
- Embed bằng multilingual-e5-large.
- Store vào Qdrant với metadata (personId, eventDate, perspective, consentTags).

### 9.5.2. Retrieval
- Hybrid: BM25 (Elasticsearch) + dense vector (Qdrant) + rerank (bge-reranker-v2-m3).
- Top-K = 5 sau rerank.
- Filter: consent-visible cho user hỏi, không bao gồm memory bị flag.

### 9.5.3. Generation
- LLM: Claude 3.5 Sonnet (primary), Llama 3.1 70B (fallback / on-prem).
- System prompt: xưng hô, tính cách, ngôn ngữ vùng miền.
- Max tokens: 300 per response (short natural chat).
- Temperature: 0.4 (giữ tính cách nhất quán, không quá creative).

### 9.5.4. Post-generation checks
- Anti-scam classifier: block nếu output đề cập tiền, OTP, bank.
- Politics/medical guard: nếu detect → replace bằng "Ông không tiện bàn chuyện đó cháu ạ".
- Persona consistency check: dùng LLM classifier "câu trả lời có phù hợp với tính cách đã establish?".

### 9.5.5. Citation UI
- Mỗi câu response hiện marker `[1]`, `[2]` clickable → mở Memory source.
- Nếu response không có citation → block, không hiển thị.

## 9.6. Vietnamese-Specific NLP Considerations

- **Tokenizer**: VnCoreNLP hoặc pyvi cho word segmentation.
- **Dialect model**: fine-tune Whisper trên 3 datasets riêng (Bắc, Trung, Nam).
  - Nguồn dataset: VLSP, VIVOS, ForFriends, tự collect từ opt-in Interview data.
- **Xưng hô**: NER cho danh từ xưng hô (bà, ông, cô, chú, dì, cậu, mợ, thím).
- **Ngôn ngữ cổ / phương ngữ**: xây dựng dictionary + LLM fine-tune samples.
- **Chữ Nho / Hán Nôm** (support đọc gia phả cổ):
  - OCR: Ancient Chinese OCR (fine-tune trên Nôm dataset của viện Hán Nôm).
  - Dịch: LLM few-shot với examples chữ Nôm.

## 9.7. Emotion & Grief-Aware System

### 9.7.1. Detection layers
- **Audio**: wav2vec2 classifier — 8 emotions (neutral, happy, sad, tired, angry, surprise, fear, disgust).
- **Text**: PhoBERT fine-tune trên VN emotion dataset.
- **Behavior**: heuristic từ pattern login (số lần vào altar > baseline × 3 trong ngày kỉ niệm mất).

### 9.7.2. Grief-aware responses
- Nếu detect user đau buồn cực độ (kết hợp 3 layer):
  - Hiển thị cảnh báo mềm: "Bạn có muốn nói chuyện với chuyên gia tâm lý?"
  - Link đến hotline tâm lý VN (Ngày Mai, Line Việt Nam, JAAM Vietnam).
  - Giảm intensity của persona chat (persona nói ít hơn, khuyên nghỉ).
  - Không upsell paid features trong lúc đau buồn (ethical rule).

## 9.8. Content Moderation

- **Ảnh upload**: AWS Rekognition (nudity, violence, gore) + custom classifier phát hiện nội dung khỏa thân dòng họ (không phù hợp).
- **Text upload**: PhoBERT-based hate speech / spam classifier.
- **Audio**: transcribe rồi text-classify.
- **AI-generated flag**: mọi output từ voice clone / photo animation được đánh dấu là AI trong metadata.

## 9.9. Model Ops (MLOps)

- **Model registry**: MLflow.
- **Serving**: Triton Inference Server cho on-prem models; vendor API cho cloud.
- **A/B test**: shadow mode cho new model versions.
- **Drift monitoring**: track WER, response quality (LLM-as-judge), user thumbs up/down.
- **Fine-tuning cadence**:
  - Whisper VN: quý 1 lần với data mới từ opt-in.
  - PhoBERT emotion: 6 tháng 1 lần.
  - Persona RAG index: real-time (mỗi memory approve trigger reindex).

## 9.10. Cost Management

Ước tính chi phí AI per active user/month:

| Component | Cost estimate |
|-----------|---------------|
| Voice clone training (one-time) | $2–5 per voice |
| TTS synthesis (Vbee) | ~$0.30 / hour output |
| LLM (Claude Sonnet, 500 msg/mo) | ~$1.50 |
| Photo restoration | ~$0.05 / photo (GPU amortized) |
| Whisper ASR (self-hosted) | ~$0.20 / hour audio |
| Embedding (E5-large self-hosted) | ~$0.001 / 1k tokens |
| **Tổng ước tính cho paid user** | **$3–8 / month** |

→ Gross margin còn tốt với plan $5–15/tháng nếu quản lý AI ratio.

---
<a id="chuong-10"></a>
# CHƯƠNG 10 — DNA INTEGRATION MODULE

## 10.1. Product philosophy

Gia Sử Ký **KHÔNG** tự làm giải trình tự (sequencing) — đó là chuyện của các lab. Gia Sử Ký là **hạ tầng interpret & connect** dữ liệu DNA đã có.

3 giá trị:
1. **Import**: nhận raw data từ các provider phổ biến (23andMe, AncestryDNA, MyHeritage DNA, FamilyTreeDNA, LivingDNA).
2. **Interpret**: xử lý ethnic origin, haplogroup (thô), matching centimorgans.
3. **Connect**: match với các user khác trong hệ thống — opt-in **kép** (cả 2 bên đồng ý mới liên hệ).

## 10.2. Provider format matrix

| Provider | Format | SNPs count |
|----------|--------|-----------|
| 23andMe | .txt (autosomal SNP) | ~600k |
| AncestryDNA | .txt.gz | ~700k |
| MyHeritage | .csv.zip | ~700k |
| FamilyTreeDNA | .csv | ~700k |
| LivingDNA | .csv | ~650k |

Chuẩn hóa nội bộ: convert tất cả về format nội bộ `.Gia Sử Ký.gzip` (Parquet, chỉ giữ SNPs trong 1M chuẩn common set).

## 10.3. Data flow

```
[User upload raw DNA file]
      │
      ▼
[Consent gate]
   • Xác nhận opt-in explicit: sharing scope
   • Cảnh báo: "DNA reveals hidden info (paternity, health) — bạn có sẵn sàng?"
      │
      ▼
[Encrypt & store]
   • Client-side chunk hash trước upload
   • S3 với KMS envelope, DEK riêng cho từng file
      │
      ▼
[Parser worker (Python + pandas)]
   • Detect provider format
   • Normalize to .Gia Sử Ký.gzip
      │
      ▼
[Analysis pipeline]
   ├─ Ethnic composition (admixture inference, HAPLOMANIAC hoặc self-hosted admix)
   ├─ Y-haplogroup / mtDNA haplogroup
   ├─ Autosomal segment matching (IBD detection)
   └─ Health markers → BLOCKED by default (không hiển thị trừ khi user request + có cảnh báo)
      │
      ▼
[Matching engine]
   • Compare shared centimorgans (cM) với user khác trong hệ thống
   • Predict relationship: parent, sibling, 1C, 2C, 3C, ...
      │
      ▼
[Match notification]
   • Cả 2 bên nhận notification "Có người khớp DNA với bạn"
   • Cả 2 phải confirm mới lộ danh tính
```

## 10.4. Privacy & Ethics (nghiêm ngặt)

- **DNA data không bao giờ** được:
  - Bán / chia sẻ cho bên thứ 3.
  - Dùng cho quảng cáo target.
  - Dùng để training AI.
- **Reveal ngưng đường**: cảnh báo mạnh trước khi cho phép user thấy "cha ruột thật sự không phải cha đăng ký". Có thể có tùy chọn "chỉ hiển thị match với người tôi đã kết bạn".
- **Family surprise mode**: default OFF. Match với người ngoài họ chỉ hiện khi opt-in.
- **Delete anytime**: xóa raw file + derived data trong 30 ngày (grace period cho backup).

## 10.5. Integrate với Living Tree

- Sau khi có match:
  - AI gợi ý: "Bạn khớp 12.4% DNA với @user_X, khả năng cao là anh em họ đời 3. Cần liên hệ để cross-reference cây gia phả không?"
  - Nếu 2 bên đồng ý → merge suggestion cho 2 cây gia phả (dạng review, không auto-merge).
- Face similarity + DNA similarity combine → confidence score cho relationship.

## 10.6. Ethnic composition — visualize

- **UI**: cake chart với đơn vị %.
- **Region mapping**: Việt (Kinh), Chăm, Khmer, Hoa (Guangdong/Fujian/Hakka), Thai, Lao, Malay, South China Han, Northeast Asian, Southeast Asian aboriginal, ...
- **Cảnh báo**: "Kết quả ethnic composition mang tính thống kê tương đối, không phải quyết định chủng tộc."

## 10.7. Không làm

- Không dự đoán tính cách, IQ, hoặc traits phi khoa học.
- Không show health / disease risk trong V1.
- Không cung cấp "báo cáo nguồn gốc quý tộc" (dễ scam).

---
<a id="chuong-11"></a>
# CHƯƠNG 11 — SECURITY, PRIVACY, CONSENT FRAMEWORK

## 11.1. Threat Model

**Assets bảo vệ**:
- Dữ liệu định danh cá nhân (PII): tên, ngày sinh, quan hệ.
- Dữ liệu sinh trắc: giọng nói, khuôn mặt, DNA.
- Ký ức riêng tư (audio, video, hồi ký).
- Consent records (pháp lý).

**Kẻ tấn công tiềm năng**:
- Scammer dùng voice clone để lừa đảo người thân.
- Doxxing / stalker theo dấu qua cây gia phả.
- Insider malicious (nhân viên).
- Nation-state (bảo vệ ở mức "reasonable, not military-grade").

## 11.2. Data classification

| Class | Ví dụ | Encryption | Access |
|-------|-------|-----------|--------|
| **P0 - Public** | Ảnh dòng họ (public share opt-in) | TLS in transit | Public read |
| **P1 - Internal** | Cây gia phả clan | AES-256 at rest | Clan members |
| **P2 - Confidential** | Hồi ký cá nhân, audio | AES-256 + KMS DEK per user | User + granted |
| **P3 - Sensitive** | Voice clone model, DNA raw | KMS DEK per record | Explicit consent only |
| **P4 - Critical** | Consent records, Digital Will | KMS + blockchain notary | Notary chain |

## 11.3. Authentication & Authorization

### 11.3.1. AuthN
- **Primary**: email + password (Argon2id, cost 3, memory 64MB).
- **Recommended**: VNeID SSO (khi available) — verified identity.
- **Fallback**: passkey (WebAuthn) — khuyến khích cho paid users.
- **MFA**: TOTP hoặc SMS OTP, bắt buộc cho consent-sensitive action.

### 11.3.2. AuthZ
- **RBAC hybrid ABAC**:
  - Roles: `platform_admin`, `clan_patriarch`, `clan_member`, `individual_user`, `guest_viewer`.
  - Attribute checks: `user.consentScope contains 'voice_chat'` etc.
- **OPA (Open Policy Agent)** cho fine-grained decisions.
- Consent Service là **single source of truth** — mọi service check consent qua đó, không cache stale.

## 11.4. Encryption

- **In transit**: TLS 1.3, cert pinning trên mobile.
- **At rest**:
  - Media: envelope encryption (KMS wraps DEK).
  - Database: TDE (Postgres pgcrypto, Neo4j enterprise TDE).
- **In use** (sensitive ops):
  - Consent signing dùng device secure enclave (iOS Secure Enclave, Android StrongBox) — private key không rời thiết bị.

## 11.5. Consent Framework (chi tiết mở rộng)

### 11.5.1. Legal basis
- Việt Nam: **Luật Công nghiệp Công nghệ số 2025** (tài sản số, danh tính số), **Luật Bảo vệ Dữ liệu Cá nhân (2023)**.
- Cross-border: GDPR (EU), CCPA (California) khi có user.
- **Data residency**: dữ liệu user VN lưu tại VN region (AWS ap-southeast-1 Singapore hoặc VN datacenter khi có).

### 11.5.2. Consent scopes (granular)
Mỗi scope là independent — user check từng cái riêng:

| Scope | Ý nghĩa |
|-------|---------|
| `voice_clone_training` | Cho phép training model từ giọng của tôi |
| `voice_clone_usage_family` | Voice clone được dùng cho gia đình (bao gồm ai) |
| `voice_clone_usage_public` | Voice clone dùng public (mặc định FALSE) |
| `photo_animation` | Ảnh của tôi được animation (Deep Nostalgia style) |
| `chatbot_persona` | Persona AI trả lời thay tôi khi tôi qua đời |
| `dna_import` | DNA raw được lưu và analyze |
| `dna_matching_family` | DNA match trong dòng họ |
| `dna_matching_public` | DNA match với người ngoài |
| `memory_public_view` | Hồi ký của tôi có thể public |
| `commercial_use` | KHÔNG BAO GIỜ default TRUE, luôn opt-in explicit |

### 11.5.3. Video Consent Requirement

Cho voice clone và persona chatbot: **bắt buộc** upload video 30 giây trong đó chủ thể:
1. Nói tên đầy đủ.
2. Nói ngày hôm nay.
3. Nói câu: *"Tôi đồng ý cho phép tạo bản sao giọng nói / persona AI của tôi trên nền tảng Gia Sử Ký, có hiệu lực từ hôm nay."*

Video này được lưu vĩnh viễn với consent record, hash notarize lên blockchain.

### 11.5.4. Consent Revocation

- User có thể revoke bất kỳ scope nào, bất kỳ lúc nào.
- Revoke → propagate qua Kafka event `consent.revoked`.
- Mọi service nghe event, disable tính năng liên quan trong < 5 phút.
- Voice model bị delete khỏi vendor (call vendor API delete).
- Nếu có persona chat đang stream → interrupt an toàn.

## 11.6. Anti-Scam Measures

**Nhiều lớp**:

1. **Watermark bắt buộc trên audio output** — AudioSeal detector chạy ở mọi voice-generation endpoint.
2. **AI persona không được nói về tiền**:
   - Anti-scam classifier scan mỗi response.
   - Từ khóa cứng bị block: OTP, mã ngân hàng, chuyển khoản, gấp gáp, khẩn cấp cần tiền.
3. **Rate limit chat**: max 500 msg/day cho paid user, tránh dùng làm bot lừa đảo.
4. **Session recording** cho persona chat: user luôn thấy đây là AI (label "AI Persona" persistent).
5. **Impersonation detection**: nếu ai đó tạo persona của celebrity, block.
6. **Report + investigate**: user có thể báo nghi ngờ scam → team moderation review trong 24h.

## 11.7. Grief-aware & Mental health safeguards

- Detect grief pattern (chương 9.7) → gợi ý resource.
- Không upsell trong grief window.
- Persona không được nói câu gây hiểu lầm sinh học: "Ông vẫn còn ở đây với con". Thay bằng "Cháu vẫn có thể nhớ về ông bất cứ lúc nào."
- Prompt engineering: persona luôn nhắc "Đây là trí nhớ AI phục dựng lại".

## 11.8. Compliance checklist

| Regulation | Status |
|-----------|--------|
| Luật BVDL Việt Nam 2023 | Full compliance |
| Luật CNCN Số 2025 | Full compliance (danh tính số, tài sản số) |
| GDPR (EU users) | Full compliance |
| CCPA (CA users) | Full compliance |
| ISO 27001 | Target Y2 |
| SOC 2 Type II | Target Y2 |
| HIPAA | N/A (không xử lý health data) |

## 11.9. Incident Response

- **Runbook**: có sẵn cho voice clone abuse, data breach, persona hijack.
- **RTO / RPO**: RTO < 4h, RPO < 1h.
- **Notify user**: trong 72h nếu có breach involving PII (theo luật VN).

## 11.10. Bug Bounty

- Chương trình HackerOne từ tháng 6 sau launch.
- Focus scope: consent bypass, voice clone abuse, RAG data leak.

---
<a id="chuong-12"></a>
# CHƯƠNG 12 — DEVOPS & INFRASTRUCTURE

## 12.1. Cloud strategy

- **Primary cloud**: AWS (region `ap-southeast-1` Singapore cho phần lớn user VN).
- **CDN**: Cloudflare (global edge).
- **DR region**: AWS `us-west-2` Oregon.
- **Data residency**: VN users' PII replica priority ở ap-southeast-1; DR chỉ backup encrypted, chỉ decrypt trong emergency.
- **On-prem GPU option** (giai đoạn 2): server GPU tại VN để giảm latency + chi phí cho AI inference.

## 12.2. Kubernetes topology

```
Production cluster (ap-southeast-1)
├── Namespace: identity
├── Namespace: genealogy
├── Namespace: memory
├── Namespace: ritual
├── Namespace: media
├── Namespace: consent
├── Namespace: ai-gateway
├── Namespace: dna
├── Namespace: notification
├── Namespace: analytics
├── Namespace: observability   (Grafana stack)
└── Namespace: platform         (ingress, cert-manager, sealed-secrets)

Node pools:
  • general-pool     (Graviton c7g)     — stateless services
  • data-pool        (r7g memory)       — Postgres, Neo4j
  • gpu-pool         (g5.xlarge L4)     — AI inference workers
  • gpu-training-pool (g5.12xlarge)     — voice clone training, spot instance
```

## 12.3. Infrastructure as Code

- **Terraform**: cloud resources (VPC, RDS, S3, KMS, IAM).
- **Helm charts**: mỗi microservice có chart riêng.
- **ArgoCD**: GitOps CD, sync từ `k8s-manifests` repo.
- **Crossplane** (optional): declarative cloud resources qua K8s CRDs.

## 12.4. CI/CD Pipeline

```
[Developer push branch]
      │
      ▼
[GitHub Actions CI]
   ├─ Lint (eslint, ruff, hadolint)
   ├─ Unit tests
   ├─ Integration tests (docker-compose)
   ├─ Build Docker image
   ├─ Scan (Trivy, Snyk)
   ├─ Push to ECR with tag = git sha
      │
      ▼
[PR review] — CODEOWNERS auto-request
      │
      ▼
[Merge to main]
      │
      ▼
[Auto-deploy to staging] (ArgoCD)
      │
      ▼
[Smoke tests + Playwright E2E]
      │
      ▼
[Manual approval for prod]
      │
      ▼
[Progressive rollout via Argo Rollouts]
   • Canary: 5% traffic, 5 min
   • Then 25%, 50%, 100%
   • Auto-rollback nếu error rate > baseline * 2
```

## 12.5. Observability

- **Metrics**: Prometheus + Grafana. Custom SLIs: chat latency P95, altar load time P95, WER trung bình.
- **Logs**: Loki + Grafana. Structured JSON logs.
- **Traces**: Tempo + OpenTelemetry SDK. Correlate: request → all services → DB queries.
- **Alerting**: Alertmanager → PagerDuty (on-call rotation) + Zalo channel cho team.
- **RUM**: Sentry (error tracking) + web-vitals collector.
- **AI Observability**: Langfuse cho LLM tracing, cost, quality metrics.

### Key SLOs (Service Level Objectives)

| Service | SLO |
|---------|-----|
| API availability | 99.9% monthly |
| Persona chat P95 latency | < 3s (end-to-end) |
| AI Interviewer PSTN uptime | 99.5% |
| Media upload success | 99.5% |
| Ritual Sync frame loss | < 5% |

## 12.6. Data backup

- **Neo4j**: daily online backup → S3 Glacier, retention 90 ngày.
- **Postgres**: continuous WAL archiving + daily snapshots, retention 30 ngày.
- **S3 Media Vault**: cross-region replication (versioning ON).
- **Consent Records**: extra backup vào cold storage + blockchain notary hash → forensic verifiable.

## 12.7. Disaster Recovery drill

- Q1 mỗi năm: full DR failover test.
- RTO target: 4h. RPO: 1h.

## 12.8. Cost optimization

- Spot instances cho GPU training pool (voice clone).
- Reserved instances cho Postgres, Neo4j (1 năm cam kết).
- S3 Intelligent Tiering.
- CloudFront cache hit rate target > 85%.
- Đo cost per active user, target < $2/user/month infra.

## 12.9. Security ops

- **WAF**: AWS WAF + Cloudflare WAF.
- **DDoS**: Cloudflare Enterprise.
- **Secrets**: AWS Secrets Manager, rotated 90 ngày. Sealed Secrets cho K8s.
- **Network**: private VPC, no public DB. Bastion via SSM Session Manager.
- **SIEM**: Wazuh hoặc Datadog Cloud SIEM.
- **Vulnerability**: Trivy scan trong CI, Snyk weekly.
- **Penetration test**: hàng năm bởi bên thứ 3.

## 12.10. Environments

| Env | Purpose | Data |
|-----|---------|------|
| `dev` | Developer local | Fake seed |
| `staging` | Pre-prod, integration test | Anonymized subset |
| `prod` | Live users | Real data |
| `sandbox` | Public API demo cho partners | Synthetic |

Environment promotion: dev → staging (auto) → prod (manual approval).

---
<a id="chuong-13"></a>
# CHƯƠNG 13 — TESTING STRATEGY

## 13.1. Test pyramid

```
                    ▲
                   / \
                  / E2E \             (5%)   — Playwright, Detox
                 /-------\
                / Integr. \           (25%)  — service-level, docker-compose
               /-----------\
              /   Unit tests \        (70%)  — Vitest, Jest, pytest
             /-------------- \
```

## 13.2. Unit testing

- **Frontend**: Vitest + React Testing Library.
- **Backend NestJS**: Jest với TestContainers cho DB.
- **Backend Python**: pytest + pytest-asyncio.
- **Coverage target**: 80% overall, 95% cho consent-related code.

## 13.3. Integration testing

- Docker Compose spins up: service under test + Postgres + Neo4j + Redis + mock external.
- Test happy path + edge cases cho mỗi endpoint.

## 13.4. E2E testing

- **Web**: Playwright, chạy trên Chromium/Firefox/Safari.
- **Mobile**: Detox (Expo).
- **Critical user journeys**:
  - Signup → tạo clan → add first member → upload photo → altar view.
  - Schedule AI Interview → phỏng vấn (mocked audio) → review transcript → approve.
  - Grant consent → create persona → chat → revoke consent → chat fails.
  - Multi-party Ritual Sync với 3 peer simulator.

## 13.5. AI-specific testing

### 13.5.1. ASR accuracy
- **Golden dataset**: 100 audio clips per dialect, ground truth transcript.
- **Metric**: WER per dialect. Fail build nếu WER thoái hóa > 5% so với baseline.

### 13.5.2. Voice clone quality
- **MOS (Mean Opinion Score)** với listener panel, target 4.0+ trên thang 5.
- **Speaker similarity**: cosine similarity giữa embedding gốc và output ≥ 0.85.

### 13.5.3. LLM quality
- **LLM-as-judge**: dùng Claude 3.5 Sonnet chấm câu trả lời chatbot theo tiêu chí:
  - Có cite memory không?
  - Có phù hợp tính cách persona không?
  - Có bịa không?
- **Regression suite**: 200 câu hỏi + expected answer categories.

### 13.5.4. Anti-scam
- **Red team dataset**: 500 câu hỏi lừa đảo (yêu cầu tiền, OTP, gấp) — must be blocked.
- Target block rate 100%.

## 13.6. Load testing

- **k6** cho HTTP APIs.
- **Custom WebRTC load tool** cho Ritual Sync (mô phỏng 100 peers).
- Target scale ban đầu: 10k CCU (concurrent users), 500 concurrent Ritual sessions.

## 13.7. Chaos engineering

- Chaos Mesh trong K8s: kill pod ngẫu nhiên, network partition, DB latency injection.
- Chạy hàng tuần trong staging.

## 13.8. Accessibility testing

- axe-core CI check cho web.
- Manual test với NVDA / VoiceOver mỗi release.
- Test với "Ông bà mode" bật.

## 13.9. Cultural sensitivity review

- Trước mỗi release lớn: review với **cultural advisor** (chuyên gia văn hóa, tôn giáo VN).
- Kiểm tra:
  - Xưng hô đúng không?
  - UI hình ảnh có vi phạm tôn giáo/tâm linh?
  - Text prompt có disrespectful không?

---
<a id="chuong-14"></a>
# CHƯƠNG 14 — BUSINESS MODEL & PRICING

## 14.1. Pricing tiers

| Plan | Giá | Đối tượng | Tính năng chính |
|------|-----|-----------|-----------------|
| **Free** | 0đ | Ai cũng dùng | Cây gia phả cơ bản, 2 thành viên user, 100MB media, không AI |
| **Family** | 99.000đ/tháng (~$4) | Gia đình nhỏ (5-10 user) | AI Interviewer 5 session/tháng, 5GB media, 1 persona chat, altar 3D, lịch âm |
| **Clan** | 499.000đ/tháng (~$20) | Dòng họ (đến 200 user) | AI Interviewer 20 session/tháng, 50GB, 5 persona chat, Ritual Sync 100 peer, công đức ledger, in phả đồ |
| **Lifetime** | 4.990.000đ (~$200) | Cá nhân trọn đời | Family plan trọn đời, 20GB, 2 persona chat |
| **Clan Lifetime** | 24.990.000đ (~$1000) | Dòng họ lớn trọn đời | Clan plan trọn đời, 500GB, 20 persona |
| **Enterprise** | Custom | Hội đồng gia tộc, tổ chức tôn giáo | White-label, custom altar theme, dedicated support |

## 14.2. Add-ons (à la carte)

| Add-on | Giá |
|--------|-----|
| Voice clone training model (1 persona) | 500.000đ / model (one-time) |
| Photo restoration batch (100 ảnh) | 300.000đ |
| DNA test kit (co-brand với lab đối tác) | 1.500.000đ – 2.500.000đ |
| AR/VR scan mộ tổ / nhà thờ họ | 5.000.000đ / địa điểm |
| In phả đồ giấy dó cao cấp | Theo m² |
| Notary Digital Will | 800.000đ / hồ sơ |

## 14.3. Freemium conversion strategy

**Free** cho phép user thấy value cốt lõi (cây gia phả); paid unlock trải nghiệm cảm xúc (AI, altar 3D, persona chat).

**Trigger conversion điểm**:
- User upload ảnh thờ mờ → gợi ý paid photo restoration.
- Sắp giỗ tổ → gợi ý Ritual Sync (paid).
- User cao tuổi lên tuyến sức khoẻ → gợi ý AI Interviewer (paid).

**Anti-pattern cần tránh** (đạo đức):
- Không upsell khi user đang đau buồn (grief-aware).
- Không paywall người đã mất (memorial page free vĩnh viễn).
- Không lock consent revocation sau paywall.

## 14.4. B2B — Clan Workspace

Đối tượng: các hội đồng gia tộc, tộc trưởng.

Bundle:
- 1 workspace dòng họ (unlimited thành viên).
- 3 admin seats.
- Công đức ledger public/transparent.
- Ritual Sync multi-region.
- In phả đồ (partnership với xưởng in truyền thống).
- Support đường dây riêng (Zalo group).

Sale channel:
- Hội đồng gia tộc (top-down).
- Influencer YouTube chuyên chủ đề gia đình (VD: Khoai Lang Thang, Ẩm Thực Mẹ Làm, …).
- Chùa & nhà thờ (kênh cộng đồng).

## 14.5. Revenue projection (rough)

Assumptions Y1:
- 100k signup (free), 5% → paid = 5k paid users.
- ARPU paid = $6/tháng.
- 500 clan B2B, ARPU = $20/tháng.
- 200 lifetime users = $200 each = $40k one-time.

Y1 ARR: (5k × $6 × 12) + (500 × $20 × 12) + $40k = $360k + $120k + $40k ≈ **$520k**.

Y2 target: 10x = $5M ARR.

## 14.6. Cost of Goods Sold (COGS)

Per paid user / month:
- Infrastructure: ~$1.50.
- AI (voice, LLM, ASR): ~$3–5.
- Payment fees: ~3%.
- Support: ~$0.50.

Gross margin: **50-60%** (chấp nhận được cho AI SaaS, sẽ tăng khi self-host models scale).

## 14.7. Ethical monetization principles

- Không quảng cáo.
- Không bán data.
- Không upsell trong "sacred moments" (giỗ, tang lễ, buổi lễ).
- Memorial mode miễn phí vĩnh viễn.
- Transparent pricing — không dark pattern.

---
<a id="chuong-15"></a>
# CHƯƠNG 15 — ROADMAP 12 THÁNG

## 15.1. Phase 0 — Pre-development (Tuần 1–4)

**Mục tiêu**: Validate + prep.

- Tuần 1–2:
  - 20 phỏng vấn khách hàng: 10 trưởng họ ở VN, 10 Việt kiều.
  - Đánh giá đối thủ chi tiết (Việt Phả Tuệ, MyTree, MyHeritage).
  - Setup GitHub org, Notion, Figma, Slack/Zalo team.
- Tuần 3–4:
  - Prototype Figma 3 tính năng lõi: Living Tree 3D, Digital Altar, AI Interviewer.
  - Design system draft (color, typo, iconography).
  - Cultural advisor sign-off cho concept.
- **Deliverable**: Design prototype + product spec (tài liệu này).

## 15.2. Phase 1 — MVP Foundation (Tháng 2–4)

**Mục tiêu**: build infra + 3 core features (Living Tree, Digital Altar, AI Interviewer PSTN).

- **Tháng 2**:
  - Setup infra: AWS accounts, VPC, K8s cluster (dev + staging).
  - Auth service (Identity), Genealogy service.
  - Neo4j schema, PostgreSQL schema.
  - Basic web app: signup, tạo clan, add persons, view tree 2D.
- **Tháng 3**:
  - Living Tree 3D (Three.js).
  - Digital Altar 3D (basic Phật theme).
  - Media Service + photo restoration MVP.
  - Consent Service v1 (không blockchain).
- **Tháng 4**:
  - AI Interviewer qua Twilio PSTN (giọng miền Nam trước, extend Bắc/Trung sau).
  - Whisper VN fine-tune round 1.
  - RAG persona chat POC.
  - Alpha test với 20 gia đình.

**Deliverable**: Alpha app với 3 tính năng core, chạy được end-to-end.

## 15.3. Phase 2 — Full MVP với 7 tính năng đột phá (Tháng 5–7)

- **Tháng 5**:
  - Memory Graph + Elasticsearch + Qdrant.
  - Cross-referential Rashomon view.
  - Time Capsule feature.
  - Voice cloning pipeline hoàn chỉnh với watermark.
- **Tháng 6**:
  - Gia Đạo Scroll (LLM aggregator + PDF export).
  - Ritual Sync (mediasoup WebRTC).
  - Blockchain notary cho consent (Polygon zkEVM).
  - VNeID integration.
- **Tháng 7**:
  - Mobile app iOS + Android (React Native).
  - Offline sync.
  - Ông bà mode.
  - Beta test với 500 gia đình.

**Deliverable**: Full-feature beta.

## 15.4. Phase 3 — DNA + Polish + GA (Tháng 8–10)

- **Tháng 8**:
  - DNA Integration Module (23andMe, Ancestry, MyHeritage import).
  - Matching engine.
  - Ethnic composition analysis.
- **Tháng 9**:
  - Performance optimization (60 FPS 3D trên mid-tier device).
  - Security audit + pen test.
  - Bug bounty launch.
  - Cultural review round cuối với 5 chuyên gia.
- **Tháng 10**:
  - GA launch (public).
  - Marketing campaign: YouTube influencer, PR (Tuoi Tre, VnExpress).
  - Partnership với hội đồng gia tộc lớn (Nguyễn, Trần, Lê, Phạm).

## 15.5. Phase 4 — Scale & Expansion (Tháng 11–12)

- **Tháng 11**:
  - AR/VR mộ tổ scan (3D photogrammetry service).
  - In phả đồ partnership.
  - Enterprise sales.
- **Tháng 12**:
  - Chuẩn bị mở rộng thị trường Đông Nam Á (Malaysia, Singapore Chinese diaspora).
  - Multi-language full: EN, ZH, KO, JA.
  - Fundraising Series A (nếu cần scale).

## 15.6. Milestones & KPIs

| Phase | Timeline | KPI target |
|-------|----------|-----------|
| Phase 0 | Tháng 1 | Design sign-off, 20 interviews |
| Phase 1 | Tháng 2–4 | 20 alpha families active weekly |
| Phase 2 | Tháng 5–7 | 500 beta families, NPS > 40 |
| Phase 3 | Tháng 8–10 | 10k signups, 500 paid, NPS > 50 |
| Phase 4 | Tháng 11–12 | 50k signups, 3k paid, first international users |

## 15.7. Risk register

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | Voice clone bị abuse để lừa đảo | Critical | Watermark bắt buộc, anti-scam guardrails, cooperative với công an mạng |
| R2 | Grief-related lawsuit ("Ông tôi mất, AI không nên tồn tại") | High | Consent framework nghiêm, opt-out dễ, tư vấn tâm lý |
| R3 | Data breach PII | Critical | Encryption at rest, KMS DEK per user, audit log |
| R4 | Vendor lock (ElevenLabs/Vbee) | Medium | Multi-vendor, fine-tune local backup |
| R5 | ASR không hiểu giọng vùng miền | High | Fine-tune với dataset thật, human-in-the-loop review |
| R6 | Cultural insensitivity | High | Cultural advisor review, community feedback loop |
| R7 | Chi phí AI vượt margin | Medium | Cost monitoring, cache aggressive, self-host quantized models |
| R8 | Bị ông lớn copy (Ancestry, MyHeritage) | Medium | Moat = văn hóa + community lock-in, cross-clan network effect |

## 15.8. Team structure gợi ý

**Year 1 team (~20 người)**:

- **Product & Design** (3): PM, UX designer, Cultural researcher.
- **Frontend** (4): 2 web, 2 mobile.
- **Backend** (5): 2 core services (NestJS), 1 media, 1 consent, 1 platform.
- **AI/ML** (4): 1 ASR, 1 LLM/RAG, 1 voice clone, 1 image restoration.
- **DevOps/Security** (2): 1 SRE, 1 SecOps.
- **QA** (2): 1 test automation, 1 cultural QA.

## 15.9. Long-term vision (Year 3+)

- **Genealogy super-graph**: liên kết mọi cây gia phả Á Đông thành mạng lưới, khám phá quan hệ họ hàng liên vùng.
- **AI historian**: AI đọc tài liệu chữ Nho, dựng lại lịch sử gia đình từ tư liệu cổ.
- **Immersive memory space**: VR/AR full immersion — bước vào ngôi nhà tổ tiên tái dựng 3D.
- **Cultural preservation project**: hợp tác với UNESCO / viện văn hóa để lưu trữ ký ức cộng đồng.

---

# PHỤ LỤC A — GLOSSARY (thuật ngữ)

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Persona** | AI avatar đại diện cho 1 người (đã mất hoặc còn sống), có voice + tính cách |
| **Consent Ledger** | Sổ đồng thuận có chữ ký số, ràng buộc pháp lý |
| **Digital Will** | Di chúc số quy định phân quyền persona sau khi chết |
| **Right to Rest** | Quyền "yên nghỉ" — AI persona tắt vĩnh viễn |
| **Memory Graph** | Đồ thị ký ức chéo, nhiều perspective cho cùng event |
| **Living Tree** | Cây gia phả cho cả người sống, không chỉ người mất |
| **Gia Đạo Scroll** | Cuộn gia huấn số tổng hợp từ lời răn |
| **Ritual Sync** | Đồng bộ nghi lễ online cho dòng họ toàn cầu |
| **Silent Generation** | Thế hệ ông bà ít nói, sắp mất mà chưa kịp ghi lại |
| **RAG** | Retrieval-Augmented Generation — LLM có tra cứu memory trước khi trả lời |
| **VNeID** | Định danh điện tử quốc gia Việt Nam |

# PHỤ LỤC B — REFERENCES

- Vbee Voice Cloning: https://vbee.vn/
- ElevenLabs: https://elevenlabs.io/
- Meta AudioSeal (watermark): github.com/facebookresearch/audioseal
- FamilySearch: https://familysearch.org/
- Việt Phả Tuệ: (VN)
- MyTree.vn: (VN)
- Luật CNCN Số Việt Nam 2025.
- Luật BVDL Cá Nhân 2023.
- Mordor Intelligence "Digital Legacy Market Report".
- Precedence Research "Digital Legacy Economy 2025-2035".

# PHỤ LỤC C — Tài liệu tham khảo (nội bộ)

- Tài liệu ý tưởng gốc + đánh giá đột phá (tác giả cung cấp).
- Deep research về ứng dụng gia phả VN & thế giới.
- Cultural advisor board notes (TBD sau khi setup).

---

**HẾT TÀI LIỆU**

*Phiên bản 1.0 — sẵn sàng cho implementation.*
*Mọi thay đổi phải được reviewed bởi Product Owner + Tech Lead + Cultural Advisor.*
