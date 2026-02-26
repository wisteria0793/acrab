/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Info, MessageSquare, Menu, Globe, ChevronRight, X, Volume2, Clock, Calendar, Map, CheckCircle, Wifi, Loader2, Sparkles, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskSetup } from '@/hooks/useKioskSetup';
import GachaModal from '@/components/GachaModal';

// 言語定義
const LANGUAGES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh-hans', label: '简体中文' },
  { code: 'zh-hant', label: '繁體中文' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
];

// 翻訳辞書 (簡易実装)
const translate = (key: string, lang: string, params: Record<string, string> = {}): string => {
  const dict: Record<string, Record<string, string>> = {
    welcome: {
      ja: `{facility}へようこそ。
ご到着ありがとうございます。`,
      en: `Welcome to {facility}.
Thank you for arriving.`,
      "zh-hans": `欢迎来到 {facility}。
欢迎您的到来。`,
      "zh-hant": `歡迎來到 {facility}。
歡迎您的到來。`,
      ko: `{facility}에 오신 것을 환영합니다.
도착해 주셔서 감사합니다.`,
      th: `ยินดีต้อนรับสู่ {facility}
ขอบคุณที่เลือกเดินทางมาถึง`
    },
    checkInTitle: {
      ja: "チェックイン",
      en: "Check-in",
      "zh-hans": "入住",
      "zh-hant": "入住",
      ko: "체크인",
      th: "เช็คอิน"
    },
    welcomeGuest: {
      ja: "{name}様",
      en: "{name}",
      "zh-hans": "{name}",
      "zh-hant": "{name}",
      ko: "{name}님",
      th: "{name}"
    },
    checkInDesc: {
      ja: `お手元のスマートフォンで右のQRコードを読み取り、
チェックイン手続きをお済ませください。`,
      en: `Please scan the QR code on the right with your smartphone
to complete the check-in process.`,
      "zh-hans": `请使用您的智能手机扫描右侧的二维码，
以完成入住手续。`,
      "zh-hant": `請使用您的智能手機掃描右側の二維碼，
以完成入住手續。`,
      ko: `스마트폰으로 오른쪽 QR 코드를 스캔하여
체크인 절차를 완료해 주십시오。`,
      th: `โปรดสแกนรหัส QR ทางด้านขวาด้วยสมาร์ทโฟนของคุณ
เพื่อทำกระบวนการเช็คอินให้เสร็จสิ้น`
    },
    langHint: {
      ja: "スマートフォン上で選んだ言語 ({lang}) のまま手続きが進みます",
      en: "The process will continue in your selected language ({lang}) on your smartphone.",
      "zh-hans": "办理手续将继续在您的智能手机上以您选择の语言 ({lang}) 进行。",
      "zh-hant": "辦理手續將繼續在您的智能手機上以您選択の言語 ({lang}) 進行。",
      ko: "스마트폰에서 선택하신 언어({lang})로 절차가 계속 진행됩니다。",
      th: "กระบวนการจะดำเนินต่อไปในภาษาที่คุณเลือก ({lang}) บนสมาร์ทフォノของคุณ"
    },
    scanHere: {
      ja: "Scan Here",
      en: "Scan Here",
      "zh-hans": "扫码",
      "zh-hant": "掃碼",
      ko: "スキャン하기",
      th: "สแกนที่นี่"
    },
    nextStep: {
      ja: "QRコードを読み取ったら次へ",
      en: "Next after scanning",
      "zh-hans": "扫码后下一步",
      "zh-hant": "掃碼後下一步",
      ko: "QR 코드 スキャン 後 次へ",
      th: "ถัดไปหลังจากสแกน"
    },
    notSet: {
      ja: "未設定",
      en: "Not set",
      "zh-hans": "未设置",
      "zh-hant": "未設置",
      ko: "미설정",
      th: "ยังไม่ได้ตั้งค่า"
    },
    facilityGuideBtn: {
      ja: "施設のご案内・ルール",
      en: "Facility Guide & Rules",
      "zh-hans": "设施指南与規則",
      "zh-hant": "設施指南與規則",
      ko: "시설 안내 및 규칙",
      th: "คู่มือสิ่งอำเนวยความสะดวกและกฎเกณฑ์"
    },
    aiConciergeBtn: {
      ja: "Discover ガチャ",
      en: "Discover Gacha",
      "zh-hans": "发现扭蛋",
      "zh-hant": "發現扭蛋",
      ko: "디스커버 가챠",
      th: "กาชาดิสคัฟเวอรี"
    },
    aiConciergeDesc: {
      ja: "スタッフ厳選の隠れた魅力、体験をランダムに提案",
      en: "Random hidden gems & experiences curated by staff",
      "zh-hans": "随机推荐员工严选的隐藏魅力与体验",
      "zh-hant": "隨機推薦員工嚴選的隱藏魅力與體驗",
      ko: "스태프가 엄선한 숨은 매력과 경험을 랜덤으로 제안",
      th: "คำแนะนำแบบสุ่มเกี่ยวกับเสน่ห์และประสบการณ์ที่คัดสรรโดยเจ้าหน้าที่"
    },
    nearbyMapBtn: {
      ja: "周辺マップをひらく",
      en: "Open nearby map",
      "zh-hans": "打开周边地图",
      "zh-hant": "打開週邊地圖",
      ko: "주변 지도 열기",
      th: "เปิดแผนที่บริเวณใกล้เคียง"
    },
    preparing: {
      ja: "※現在準備中です",
      en: "*In preparation",
      "zh-hans": "*准备中",
      "zh-hant": "*準備中",
      ko: "*준비 중입니다",
      th: "*อยู่ระหว่างการเตรียมการ"
    },
    close: {
      ja: "閉じる",
      en: "Close",
      "zh-hans": "关闭",
      "zh-hant": "關閉",
      ko: "닫기",
      th: "ปิด"
    },
    modalTitle: {
      ja: "施設のご案内とハウスルール",
      en: "Facility Guide & House Rules",
      "zh-hans": "设施指南与房规",
      "zh-hant": "設施指南與房規",
      ko: "시설 안내 및 하우스 규칙",
      th: "คู่มือสิ่งอำぬวยความสะดวกและกฎของบ้าน"
    },
    modalDesc: {
      ja: "当施設を快適にご利用いただくためのご案内です。",
      en: "Information for a comfortable stay.",
      "zh-hans": "为您提供舒适住宿的相关指南。",
      "zh-hant": "為您提供舒適住宿的相關指南。",
      ko: "편안한 숙박을 위한 안내입니다。",
      th: "ข้อมูลเพื่อการเข้าพักที่สะดวกสบาย"
    },
    aboutKeys: {
      ja: "鍵について",
      en: "About Keys",
      "zh-hans": "关于钥匙",
      "zh-hant": "關於鑰匙",
      ko: "열쇠에 대하여",
      th: "เกี่ยวกับกุญแจ"
    },
    wifiDetails: {
      ja: "Wi-Fi情報の詳細",
      en: "Wi-Fi Details",
      "zh-hans": "Wi-Fi详情",
      "zh-hant": "Wi-Fi詳情",
      ko: "Wi-Fi 정보 상세",
      th: "รายละเอียด Wi-Fi"
    },
    trashInstructions: {
      ja: "ゴミの捨て方",
      en: "Trash Disposal",
      "zh-hans": "垃圾处理方法",
      "zh-hant": "垃圾處理方法",
      ko: "쓰레기 버리는 방법",
      th: "วิธีการทิ้งขยะ"
    },
    aboutCheckout: {
      ja: "チェックアウトについて",
      en: "About Check-out",
      "zh-hans": "关于退房",
      "zh-hant": "關於退房",
      ko: "체크아웃에 대하여",
      th: "เกี่ยวกับการเช็คเอาท์"
    },
    checkoutBy: {
      ja: "までにチェックアウトをお願いします。",
      en: "please check out by this time.",
      "zh-hans": "在此时间前办理退房手续。",
      "zh-hant": "在此時間前辦理退房手續。",
      ko: "까지 체크아웃을 부탁드립니다。",
      th: "โปรดเช็คเอาท์ภายในเวลานี้"
    },
    houseRulesAndNotes: {
      ja: "ハウスルール・特記事項",
      en: "House Rules & Notes",
      "zh-hans": "房规与注意事项",
      "zh-hant": "房規與注意事項",
      ko: "하우스 규칙 및 특이사항",
      th: "กฎของบ้านและหมายเหตุพิเศษ"
    },
    confirm: {
      ja: "確認しました",
      en: "Confirmed",
      "zh-hans": "知道了",
      "zh-hant": "我知道了",
      ko: "확인했습니다",
      th: "ยืนยันแล้ว"
    }
  };

  let text = dict[key]?.[lang] || dict[key]?.['en'] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  });
  return text;
};

export default function KioskPage() {
  const router = useRouter();
  const { facilityId, isLoaded } = useKioskSetup();

  const [mode, setMode] = useState<'empty' | 'concierge' | 'thankyou'>('empty');
  const [selectedLang, setSelectedLang] = useState('ja');
  const [guideData, setGuideData] = useState<any>(null);
  const [activeReservation, setActiveReservation] = useState<any>(null);
  const [clickCount, setClickCount] = useState(0);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const [showGacha, setShowGacha] = useState(false); // Renamed from showVoiceChat
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // チェックアウト後、一定時間経過したら自動的にチェックイン画面（emptyモード）に戻る
  useEffect(() => {
    if (mode === 'thankyou') {
      const timer = setTimeout(() => {
        setMode('empty');
        setActiveReservation(null);
      }, 30000); // 30秒後に自動リセット
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const formatDate = (date: Date) => {
    // 年を省いた全世界標準形式
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const w = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${m}/${d} (${w})`;
  };

  const closeRuleModal = () => {
    setSelectedRule(null);
  };

  const closeFullGuide = () => {
    setShowFullGuide(false);
    if (mode === 'empty') {
      setMode('concierge');
    }
  };

  // 隠しコマンド（タイトルを5回連続タップで設定画面へ）
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      router.push('/setup');
    } else {
      // 3秒間タップが途切れたらリセット
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  // 1. facility_idの確認とデータ取得
  useEffect(() => {
    if (!isLoaded) return;

    // 未設定の場合は初期キッティング画面へ
    if (!facilityId) {
      router.push('/setup');
      return;
    }

    // バックエンドからガイドデータを取得
    const fetchGuide = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/kiosk/guides/?facility_id=${facilityId}`);
        if (!res.ok) throw new Error('Failed to fetch guide');
        const data = await res.json();
        if (data && data.length > 0) {
          setGuideData(data[0]);
        }
      } catch (err) {
        console.error("Error fetching kiosk guide:", err);
      } finally {
        setIsLoadingGuide(false);
      }
    };

    // 現在のアクティブな予約を取得
    const fetchActiveReservation = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/reservations/active/?facility_id=${facilityId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setActiveReservation(data);
          } else {
            setActiveReservation(null);
          }
        }
      } catch (err) {
        console.error("Error fetching active reservation:", err);
      }
    };

    fetchGuide();
    fetchActiveReservation();
  }, [isLoaded, facilityId, router]);

  const handleCheckout = async () => {
    if (!activeReservation || !activeReservation.id || isCheckingOut) return;

    if (!confirm(selectedLang === 'ja' ? 'チェックアウトしますか？' : 'Do you want to check out?')) {
      return;
    }

    setIsCheckingOut(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/reservations/${activeReservation.id}/checkout/`, {
        method: 'POST',
      });
      if (res.ok) {
        setMode('thankyou');
      } else {
        alert('Checkout failed. Please try again or contact staff.');
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert('Error connecting to server.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isLoaded || isLoadingGuide) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Globe className="h-8 w-8 text-neutral-600" />
        </motion.div>
      </div>
    );
  }

  // もしデータがない場合のフォールバック（デバッグ用）
  const fallbackGuide = {
    welcome_message: "ようこそ！以下のQRコードを...",
    concierge_welcome_message: "ごゆっくりお過ごしください。ご不明な点はAIコンシェルジュがお答えします。",
    house_rules: [],
    facility_name: "施設"
  };

  const activeGuide = guideData || fallbackGuide;

  // Custom Welcome Message Overlay: 
  // If backend provides a custom greeting, show it, but also try to translate if it's the default one.
  const isDefaultWelcome = activeGuide.welcome_message.includes("ようこそ！以下のQRコード") || activeGuide.welcome_message.includes("Welcome to Lesath") || activeGuide.welcome_message.includes("ご到着ありがとうございます");
  const displayWelcome = isDefaultWelcome
    ? translate('welcome', selectedLang, { facility: activeGuide.facility_name || '当施設' })
    : (selectedLang !== 'ja' && activeGuide.translations?.[selectedLang]?.welcome_message
      ? activeGuide.translations[selectedLang].welcome_message
      : activeGuide.welcome_message);

  // 動的なQRコードURL (Facility ID と 選択言語 を引き継ぐ)
  // もし Google Form 等の URL が設定されていればそれを使用、なければ従来のチェックイン用
  const qrUrl = activeGuide.survey_url || `https://guest-portal.lesath.com/?facility_id=${facilityId}&lang=${selectedLang}`;

  return (
    <div className="w-full h-full bg-black text-white relative flex flex-col items-center justify-center overflow-hidden font-sans">


      <AnimatePresence mode="wait">

        {/* ————————————————————————————————
            モード: EMPTY (チェックイン前)
            ———————————————————————————————— */}
        {mode === 'empty' && (
          <motion.div
            key="empty-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center w-full max-w-4xl px-8"
          >
            {/* 言語選択ヘッダー */}
            <div className="flex gap-4 mb-16">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-6 py-3 rounded-full text-lg transition-all duration-300 ${selectedLang === lang.code
                    ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="text-center space-y-6 mb-16">
              <h1
                className="text-4xl md:text-5xl font-light text-neutral-100 tracking-tight leading-relaxed whitespace-pre-line cursor-default"
                onClick={handleSecretClick}
              >
                {displayWelcome}
              </h1>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl p-10 rounded-3xl flex flex-col items-center justify-center w-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="flex w-full items-center justify-between mb-10">
                <div className="flex-1 pr-10 space-y-4">
                  <h3 className="text-2xl font-medium text-white mb-2">{translate('checkInTitle', selectedLang)}</h3>
                  <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-line">
                    {translate('checkInDesc', selectedLang)}
                  </p>
                  <div className="mt-6 flex items-center text-blue-400 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 mr-2"><Globe size={14} /></span>
                    {translate('langHint', selectedLang, { lang: LANGUAGES.find(l => l.code === selectedLang)?.label || '' })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center relative flex-shrink-0">
                  <QrCode size={180} className="text-black" strokeWidth={1.5} />
                  <div className="absolute -bottom-4 bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg flex items-center">
                    {translate('scanHere', selectedLang)} <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Action to proceed to the next page (House Rules) */}
              <div className="w-full pt-8 border-t border-neutral-800 flex justify-center">
                <button
                  onClick={() => setShowFullGuide(true)}
                  className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-medium text-xl transition shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-pulse"
                >
                  {translate('nextStep', selectedLang)}
                  <ChevronRight size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ————————————————————————————————
            モード: CONCIERGE (滞在中)
            ———————————————————————————————— */}
        {mode === 'concierge' && (
          <motion.div
            key="concierge-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-col"
          >
            {/* 滞在モード用ヘッダー */}
            <div className="flex justify-center items-center gap-12 md:gap-24 px-8 md:px-12 py-6 bg-black/20 backdrop-blur-sm border-b border-white/5">
              <div className="flex flex-col items-center gap-1">
                {activeReservation?.guest_name && (
                  <>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-center gap-3">
                      {translate('welcomeGuest', selectedLang, { name: activeReservation.guest_name })}
                    </h2>
                    {activeReservation.check_in && activeReservation.check_out && (
                      <div className="text-neutral-400 text-lg md:text-2xl font-medium flex items-center gap-3 mt-2">
                        <Calendar size={20} className="text-neutral-500" />
                        <span>
                          {(() => {
                            const [y, m, d] = activeReservation.check_in.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString(selectedLang === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' });
                          })()}
                        </span>
                        <span className="text-neutral-600">〜</span>
                        <span>
                          {(() => {
                            const [y, m, d] = activeReservation.check_out.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString(selectedLang === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' });
                          })()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-center gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${selectedLang === lang.code
                      ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                      : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* メインコンテンツエリア (ダッシュボード) */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col justify-center">
              <div className="w-full h-full max-h-[1600px] grid grid-cols-2 gap-6 grid-rows-3 pb-8">

                {/* ---------- 1段目 ---------- */}
                {/* 左：時計 */}
                <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-neutral-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[200px]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="flex items-center justify-center gap-3 text-blue-400 mb-4 font-medium text-2xl md:text-4xl tracking-widest drop-shadow-sm">
                      <Calendar size={32} className="md:w-10 md:h-10" />
                      {formatDate(currentTime)}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white drop-shadow-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(currentTime)}
                    </h1>
                  </div>
                </div>

                {/* 右：チェックアウト */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-center relative overflow-hidden group h-full min-h-[200px] text-left transition-all hover:bg-rose-900/10 hover:border-rose-500/30"
                >
                  <div className="absolute -bottom-4 -right-4 text-neutral-800 group-hover:text-neutral-700 transition duration-500"><Clock size={100} /></div>
                  <h3 className="text-xl md:text-2xl text-neutral-400 mb-6 flex items-center gap-2 relative z-10 font-medium"><div className="p-3 rounded-full bg-rose-500/20"><CheckCircle size={24} className="text-rose-400" /></div> Check-out</h3>
                  <div className="z-10 flex flex-col items-center justify-center bg-black/30 w-full rounded-2xl p-6 mt-auto h-full space-y-3">
                    {isCheckingOut ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-rose-400" size={32} />
                        <span className="text-rose-400 text-sm font-bold animate-pulse">Processing...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center">
                          <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-1">Check-out Date & Time</span>
                          {activeReservation?.check_out ? (
                            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                              {(() => {
                                const [y, m, d] = activeReservation.check_out.split('-').map(Number);
                                return new Date(y, m - 1, d).toLocaleDateString(selectedLang === 'ja' ? 'ja-JP' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  weekday: 'short'
                                });
                              })()}
                            </div>
                          ) : null}
                          {activeGuide.checkout_time ? (
                            <div className="text-4xl md:text-6xl font-black text-rose-400 tracking-tighter drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                              {activeGuide.checkout_time.slice(0, 5)}
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-xl">{translate('notSet', selectedLang)}</span>
                          )}
                        </div>
                        <div className="pt-2 border-t border-white/5 w-full text-center">
                          <div className="text-xs text-rose-400 font-bold uppercase tracking-widest group-hover:scale-110 transition-transform">Tap to Check-out</div>
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* ---------- 2段目 ---------- */}
                {/* 左：Wi-Fi */}
                <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-center relative overflow-hidden group h-full min-h-[200px]">
                  <div className="absolute top-0 right-0 p-6 text-neutral-800 group-hover:text-neutral-700 transition duration-500"><Wifi size={80} /></div>
                  <h3 className="text-xl md:text-2xl text-neutral-400 mb-6 flex items-center gap-2 relative z-10 font-medium"><div className="p-3 rounded-full bg-emerald-500/20"><Wifi size={24} className="text-emerald-400" /></div> Wi-Fi</h3>
                  {activeGuide.wifi_ssid || activeGuide.wifi_password ? (
                    <div className="space-y-4 z-10 w-full mt-auto">
                      {activeGuide.wifi_ssid && (
                        <div className="flex justify-between items-center bg-black/30 px-5 py-4 rounded-2xl">
                          <span className="text-neutral-400 text-base font-medium">SSID</span>
                          <span className="text-white font-bold text-xl md:text-2xl truncate ml-4">{activeGuide.wifi_ssid}</span>
                        </div>
                      )}
                      {activeGuide.wifi_password && (
                        <div className="flex justify-between items-center bg-black/30 px-5 py-4 rounded-2xl">
                          <span className="text-neutral-400 text-base font-medium">PASS</span>
                          <span className="text-white font-mono text-xl md:text-2xl ml-4">{activeGuide.wifi_password}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-lg relative z-10 mt-auto text-center">{translate('notSet', selectedLang)}</p>
                  )}
                </div>

                {/* 右：ハウスルール(施設案内)ボタン */}
                <button
                  onClick={() => setShowFullGuide(true)}
                  className="bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300 p-8 flex flex-col items-center justify-center gap-4 rounded-3xl group h-full min-h-[200px]"
                >
                  <div className="p-5 bg-blue-500/20 rounded-full text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <Info size={48} />
                  </div>
                  <span className="text-2xl font-medium text-blue-100 tracking-wide">{translate('facilityGuideBtn', selectedLang)}</span>
                  <span className="text-base text-blue-400/70">{translate('facilityGuideDesc', selectedLang)}</span>
                </button>

                {/* ---------- 3段目 ---------- */}
                {/* 左：ガチャ機能 */}
                <button
                  onClick={() => setShowGacha(true)}
                  className="bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all duration-300 p-8 flex flex-col items-center justify-center gap-4 rounded-3xl group relative overflow-hidden h-full min-h-[200px]"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                  <div className="p-5 bg-purple-500/20 rounded-full text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 relative z-10">
                    <Sparkles size={48} />
                  </div>
                  <span className="text-2xl font-medium text-purple-100 tracking-wide relative z-10">{translate('aiConciergeBtn', selectedLang)}</span>
                  <span className="text-base text-purple-400/70 relative z-10">{translate('aiConciergeDesc', selectedLang)}</span>
                </button>

                {/* 右：周辺マップ */}
                <button
                  className="bg-orange-600/10 border border-orange-500/30 hover:bg-orange-600/20 hover:border-orange-500/50 transition-all duration-300 p-8 flex flex-col items-center justify-center gap-4 rounded-3xl group cursor-not-allowed opacity-80 h-full min-h-[200px]"
                >
                  <div className="p-5 bg-orange-500/20 rounded-full text-orange-400 group-hover:scale-105 transition-all duration-300">
                    <Map size={48} />
                  </div>
                  <span className="text-2xl font-medium text-orange-100 tracking-wide">{translate('nearbyMapBtn', selectedLang)}</span>
                  <span className="text-base text-orange-400/70">{translate('preparing', selectedLang)}</span>
                </button>
              </div>
            </main>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ————————————————————————————————
          モード: THANK YOU (チェックアウト完了)
          ———————————————————————————————— */}
      <AnimatePresence>
        {mode === 'thankyou' && (
          <motion.div
            key="thankyou-mode"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-neutral-900 flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 space-y-12 max-w-4xl"
            >
              <div className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={80} />
              </div>

              <h1 className="text-6xl font-bold text-white tracking-tight">
                {selectedLang === 'ja' ? 'チェックアウトが完了しました' : 'Check-out Complete'}
              </h1>

              <p className="text-3xl text-neutral-400 leading-relaxed">
                {selectedLang === 'ja'
                  ? `${activeGuide.facility_name}をご利用いただきありがとうございました。\nまたのお越しを心よりお待ちしております。`
                  : `Thank you for staying at ${activeGuide.facility_name}.\nWe look forward to seeing you again.`}
              </p>

              <div className="bg-white p-10 rounded-[48px] inline-block shadow-2xl mt-12 mb-8 border-[12px] border-neutral-800/50">
                <QrCode size={300} className="text-black" />
                <div className="mt-6 text-black font-bold text-2xl tracking-widest uppercase">Thank you</div>
              </div>

              <p className="text-2xl text-neutral-500">
                {selectedLang === 'ja'
                  ? 'アンケートへのご協力をお願いいたします'
                  : 'Please help us by completing our survey'}
              </p>

              <button
                onClick={() => {
                  setMode('empty');
                  setActiveReservation(null);
                }}
                className="mt-16 px-10 py-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl text-xl transition-all border border-neutral-700"
              >
                {selectedLang === 'ja' ? 'トップに戻る' : 'Back to Home'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ハウスルールの詳細＆説明モーダル */}
      <AnimatePresence>
        {selectedRule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-neutral-900"
          >
            <div className="w-full h-full flex flex-col relative overflow-hidden">
              {/* Header */}
              <div className="p-10 border-b border-neutral-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
                <div className="flex items-center gap-6">
                  <div className="p-5 rounded-full bg-blue-500/20 text-blue-400">
                    <Info size={48} />
                  </div>
                  <h2 className="text-6xl font-bold text-white tracking-tight">
                    {selectedLang !== 'ja' && selectedRule.translations?.[selectedLang]?.title
                      ? selectedRule.translations[selectedLang].title
                      : selectedRule.title}
                  </h2>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-16 md:p-24 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-16">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-5xl md:text-6xl leading-[1.6] text-neutral-200 whitespace-pre-line font-light">
                      {selectedLang !== 'ja' && selectedRule.translations?.[selectedLang]?.description
                        ? selectedRule.translations[selectedLang].description
                        : selectedRule.description}
                    </p>
                  </div>

                  {selectedRule.images && selectedRule.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {selectedRule.images.map((img: any) => {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                        const imgSrc = img.image.startsWith('http') ? img.image : `${baseUrl}${img.image}`;
                        return (
                          <div key={img.id} className="group relative rounded-[48px] overflow-hidden border border-white/10 shadow-2xl transition-transform hover:scale-[1.02]">
                            <img
                              src={imgSrc}
                              className="w-full h-auto object-cover aspect-video"
                              alt="Rule visual"
                            />
                            {img.caption && (
                              <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/60 backdrop-blur-md text-white text-2xl font-medium">
                                {img.caption}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-12 border-t border-neutral-800 bg-black/20 flex justify-center">
                <button
                  onClick={closeRuleModal}
                  className="px-16 py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] text-3xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  {translate('confirm', selectedLang)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 施設のご案内 (一括表示) モーダル */}
      <AnimatePresence>
        {showFullGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-neutral-900 flex flex-col"
          >
            {/* Header */}
            <div className="p-10 border-b border-neutral-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
              <div className="flex items-center gap-8">
                <div className="p-5 rounded-full bg-blue-600/20 text-blue-400">
                  <Info size={48} />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white tracking-tight mb-2">{translate('modalTitle', selectedLang)}</h2>
                  <p className="text-2xl text-neutral-400 font-light">{translate('modalDesc', selectedLang)}</p>
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar">
              <div className="max-w-7xl mx-auto space-y-16">

                {/* 鍵について */}
                {activeGuide.key_instructions_text && (
                  <section>
                    <h3 className="text-3xl font-medium text-white mb-6 border-l-4 border-yellow-500 pl-4 py-1">{translate('aboutKeys', selectedLang)}</h3>
                    <div className="bg-neutral-800/40 rounded-2xl p-8 text-neutral-300 text-xl leading-relaxed whitespace-pre-line border border-neutral-800/80">
                      {selectedLang !== 'ja' && activeGuide.translations?.[selectedLang]?.key_instructions_text
                        ? activeGuide.translations[selectedLang].key_instructions_text
                        : activeGuide.key_instructions_text}
                    </div>
                  </section>
                )}

                {/* Wi-Fi情報 */}
                {(activeGuide.wifi_ssid || activeGuide.wifi_password) && (
                  <section>
                    <h3 className="text-3xl font-medium text-white mb-6 border-l-4 border-emerald-500 pl-4 py-1">{translate('wifiDetails', selectedLang)}</h3>
                    <div className="bg-neutral-800/40 rounded-2xl p-8 text-neutral-300 text-xl leading-relaxed border border-neutral-800/80 font-mono flex flex-col gap-4">
                      {activeGuide.wifi_ssid && (
                        <div className="flex items-center gap-4">
                          <span className="text-neutral-500 w-32">SSID:</span>
                          <span className="text-white font-bold">{activeGuide.wifi_ssid}</span>
                        </div>
                      )}
                      {activeGuide.wifi_password && (
                        <div className="flex items-center gap-4">
                          <span className="text-neutral-500 w-32">Password:</span>
                          <span className="text-white font-bold">{activeGuide.wifi_password}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ゴミの捨て方 */}
                {activeGuide.trash_instructions_text && (
                  <section>
                    <h3 className="text-3xl font-medium text-white mb-6 border-l-4 border-orange-500 pl-4 py-1">{translate('trashInstructions', selectedLang)}</h3>
                    <div className="bg-neutral-800/40 rounded-2xl p-8 text-neutral-300 text-xl leading-relaxed whitespace-pre-line border border-neutral-800/80">
                      {selectedLang !== 'ja' && activeGuide.translations?.[selectedLang]?.trash_instructions_text
                        ? activeGuide.translations[selectedLang].trash_instructions_text
                        : activeGuide.trash_instructions_text}
                    </div>
                  </section>
                )}

                {/* チェックアウトについて */}
                {(activeGuide.checkout_instructions_text || activeGuide.checkout_time) && (
                  <section>
                    <h3 className="text-3xl font-medium text-white mb-6 border-l-4 border-rose-500 pl-4 py-1">{translate('aboutCheckout', selectedLang)}</h3>
                    <div className="bg-neutral-800/40 rounded-2xl p-8 text-neutral-300 text-xl leading-relaxed whitespace-pre-line border border-neutral-800/80">
                      {activeGuide.checkout_time && (
                        <div className="flex items-center gap-3 mb-4 text-rose-400 font-medium">
                          <span className="bg-rose-500/20 px-6 py-3 rounded-xl text-3xl font-bold tracking-wider">
                            {activeGuide.checkout_time.slice(0, 5)}
                          </span>
                          <span className="text-2xl">{translate('checkoutBy', selectedLang)}</span>
                        </div>
                      )}
                      {activeGuide.checkout_instructions_text && (
                        <div className="text-neutral-300">
                          {selectedLang !== 'ja' && activeGuide.translations?.[selectedLang]?.checkout_instructions_text
                            ? activeGuide.translations[selectedLang].checkout_instructions_text
                            : activeGuide.checkout_instructions_text}
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ハウスルールの列挙 */}
                {activeGuide.house_rules && activeGuide.house_rules.length > 0 && (
                  <section>
                    <h3 className="text-3xl font-medium text-white mb-6 border-l-4 border-purple-500 pl-4 py-1">{translate('houseRulesAndNotes', selectedLang)}</h3>

                    <div className="space-y-6">
                      {activeGuide.house_rules.map((rule: any, index: number) => (
                        <div key={rule.id} className="bg-neutral-800/40 rounded-2xl p-10 border border-neutral-800/80">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-700 text-white font-bold text-lg">
                              {index + 1}
                            </span>
                            <h4 className="text-2xl font-medium text-white">
                              {selectedLang !== 'ja' && rule.translations?.[selectedLang]?.title
                                ? rule.translations[selectedLang].title
                                : rule.title}
                            </h4>
                          </div>

                          <p className="text-neutral-300 text-xl leading-relaxed whitespace-pre-line mb-6 ml-14">
                            {selectedLang !== 'ja' && rule.translations?.[selectedLang]?.description
                              ? rule.translations[selectedLang].description
                              : rule.description}
                          </p>

                          {rule.images && rule.images.length > 0 && (
                            <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {rule.images.map((img: any) => {
                                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                const imgSrc = img.image.startsWith('http') ? img.image : `${baseUrl}${img.image}`;
                                return (
                                  <img
                                    key={img.id}
                                    src={imgSrc}
                                    className="w-full h-48 object-cover rounded-xl border border-neutral-700"
                                    alt="Rule visual"
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800 flex justify-center flex-shrink-0">
                <button
                  onClick={closeFullGuide}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-medium text-lg transition shadow-lg shadow-blue-900/20 w-1/2"
                >
                  {translate('confirm', selectedLang)}
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Gacha Modal */}
      <GachaModal
        isOpen={showGacha}
        onClose={() => setShowGacha(false)}
        selectedLang={selectedLang}
      />

    </div>
  );
}
