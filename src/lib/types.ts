export type Bindings = {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  LLM_MODEL?: string
  /** 'development' = chế độ mở (sandbox/demo); mọi giá trị khác = production nghiêm ngặt */
  APP_ENV?: string
  /** Danh sách origin được phép (phân tách bằng dấu phẩy), bổ sung cho check CSRF */
  ALLOWED_ORIGINS?: string
  /** Phiên bản build, trả trong /api/health */
  APP_VERSION?: string
  /** GĐ5-30 Blockchain notary: cần đủ RPC + key mới ký chain thật; thiếu → mock-ledger */
  BLOCKCHAIN_RPC_URL?: string
  BLOCKCHAIN_PRIVATE_KEY?: string
  BLOCKCHAIN_CHAIN?: string
  /** GĐ5-27 Voice clone/TTS: cần đủ mới tổng hợp giọng thật; thiếu → mock */
  TTS_API_URL?: string
  TTS_API_KEY?: string
  TTS_VOICE_ID?: string
}

export type SessionUser = {
  id: string
  full_name: string
  email: string | null
  elder_mode: number
  clan_id?: string | null
  clan_role?: string | null
  /** Toàn bộ dòng họ user thuộc (multi-clan: dùng để resolve đúng clan thay vì LIMIT 1 ngẫu nhiên) */
  clan_ids?: string[]
}

export type Variables = {
  user: SessionUser | null
  /** Request id truy vết log/audit (4-23 observability) */
  requestId: string
}

export type AppEnv = { Bindings: Bindings; Variables: Variables }

/** 11.5.2 Consent scopes (granular) */
export const CONSENT_SCOPES = [
  'voice_clone',
  'photo_animation',
  'chatbot_persona',
  'video_reanimation',
  '3d_avatar',
  'commercial_use'
] as const
export type ConsentScope = (typeof CONSENT_SCOPES)[number]

/** 4.2.2 AI hosts theo vùng miền */
export const AI_HOSTS = [
  { id: 'AI_FEMALE_SAIGON', name: 'Cô Mai', region: 'VI_SOUTH', gender: 'F', desc: 'Giọng Sài Gòn, dịu dàng, chậm rãi' },
  { id: 'AI_MALE_HANOI', name: 'Anh Kiên', region: 'VI_NORTH', gender: 'M', desc: 'Giọng Hà Nội, trầm ấm, lễ độ' },
  { id: 'AI_FEMALE_HANOI', name: 'Chị Hạnh', region: 'VI_NORTH', gender: 'F', desc: 'Giọng Hà Nội, nhẹ nhàng' },
  { id: 'AI_MALE_HUE', name: 'Anh Lâm', region: 'VI_CENTRAL', gender: 'M', desc: 'Giọng Huế, khoan thai' },
  { id: 'AI_FEMALE_HUE', name: 'Cô Trâm', region: 'VI_CENTRAL', gender: 'F', desc: 'Giọng Huế, êm ái' }
] as const

export const RELIGION_THEMES = [
  { id: 'Phat', label: 'Phật giáo', accent: '#D4AF37' },
  { id: 'CongGiao', label: 'Công giáo', accent: '#C9B67A' },
  { id: 'CaoDai', label: 'Cao Đài', accent: '#E0C060' },
  { id: 'HoaHao', label: 'Hòa Hảo', accent: '#B98A3A' },
  { id: 'DaoMau', label: 'Đạo Mẫu', accent: '#E06A5A' },
  { id: 'KhongTonGiao', label: 'Không tôn giáo', accent: '#B9AFA0' }
] as const

export const ADVICE_CATEGORIES = [
  { id: 'FILIAL_PIETY', label: 'Đạo hiếu' },
  { id: 'EDUCATION', label: 'Học hành' },
  { id: 'MARRIAGE', label: 'Hôn nhân' },
  { id: 'BUSINESS', label: 'Làm ăn' },
  { id: 'ETHICS', label: 'Đối nhân xử thế' }
] as const

/** 4.2 topic bank cho AI Interviewer */
export const INTERVIEW_TOPICS = [
  {
    id: 'tuoi_tho',
    label: 'Tuổi thơ',
    questions: [
      'Hồi nhỏ nhà mình ở đâu ạ? Cảnh vật quanh nhà lúc đó thế nào?',
      'Ngày bé thì thường chơi những trò gì với anh chị em trong nhà?',
      'Có món ăn nào thời đó mà bây giờ vẫn nhớ mãi không?',
      'Đi học ngày ấy thế nào, đường xa hay gần?'
    ]
  },
  {
    id: 'dam_cuoi',
    label: 'Đám cưới & hôn nhân',
    questions: [
      'Hai người gặp nhau lần đầu trong hoàn cảnh nào?',
      'Ngày cưới hôm đó trời thế nào, có đông họ hàng không?',
      'Lễ vật ngày ấy nhà mình chuẩn bị những gì?',
      'Sau khi cưới thì hai người ở đâu, làm gì để sống?'
    ]
  },
  {
    id: 'lang_que',
    label: 'Làng quê & quê gốc',
    questions: [
      'Quê gốc của họ mình ở đâu, có nhà thờ họ không?',
      'Trong làng có ngôi đình, cây đa hay giếng nước nào mà con cháu nên biết?',
      'Ngày giỗ tổ ở quê thường làm những gì?'
    ]
  },
  {
    id: 'chien_tranh',
    label: 'Những năm tháng khó khăn',
    questions: [
      'Thời đó gia đình mình sinh sống ra sao?',
      'Có kỷ niệm nào về sự giúp đỡ của người trong họ mà đến nay vẫn nhớ?'
    ],
    sensitive: true
  },
  {
    id: 'gia_dao',
    label: 'Gia đạo & lời dặn',
    questions: [
      'Điều gì quan trọng nhất mà cụ muốn con cháu ghi nhớ?',
      'Ông bà xưa dạy lại câu gì mà nay vẫn thấy đúng?',
      'Trong nhà mình có nếp nào cần giữ mãi không ạ?'
    ]
  },
  {
    id: 'nghe_nghiep',
    label: 'Công việc & nghề nhà',
    questions: [
      'Nghề chính của gia đình mình ngày trước là gì?',
      'Người đã học nghề đó từ ai?',
      'Có bí quyết nào trong nghề mà muốn truyền lại?'
    ]
  }
] as const
