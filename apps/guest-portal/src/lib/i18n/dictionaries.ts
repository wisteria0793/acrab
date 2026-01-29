import { Language } from "@/lib/store/language";

export const dictionaries: Record<Language, any> = {
    ja: {
        common: {
            loading: "読み込み中...",
            continue: "次へ",
            back: "戻る",
            confirm: "確認",
            required: "必須",
        },
        dashboard: {
            welcome: "ようこそ",
            title: "ゲストハウス巴.com",
            checkIn: {
                title: "チェックイン",
                desc: "記帳と本人確認を行ってください",
                required: "必須",
                action: "手続きを開始",
                locked: "チェックインを完了してください",
            },
            amenities: {
                title: "アメニティ",
                desc: "備品のリクエスト",
            },
            guide: {
                title: "観光ガイド",
                desc: "周辺のおすすめスポット",
            },
            chat: {
                title: "AIコンシェルジュ",
                desc: "ご質問はこちらへ",
            },
            checkedInMessage: "チェックイン完了済みです。ごゆっくりお過ごしください。",
            checkOut: {
                title: "チェックアウト",
                action: "手続きへ進む",
                confirm: {
                    title: "チェックアウトしますか？",
                    desc: "お帰りの準備はできましたか？",
                    action: "チェックアウトを完了する",
                },
                complete: {
                    title: "ご利用ありがとうございました",
                    desc: "またのご利用をお待ちしております。",
                    back: "トップへ戻る"
                }
            }
        },
        checkIn: {
            steps: {
                identify: "予約検索",
                verify: "確認",
                register: "記帳",
                payment: "宿泊税",
                complete: "完了",
            },
            identify: {
                title: "予約の検索",
                desc: "予約番号または電話番号を入力してください",
                label: "予約番号",
                placeholder: "例: #12345",
                help: "お困りですか？",
                concierge: "コンシェルジュに聞く",
            },
            verify: {
                title: "予約内容の確認",
                welcome: "ようこそ",
                checkIn: "チェックイン",
                checkOut: "チェックアウト",
                guests: "名様",
                yes: "はい、間違いありません",
                no: "違う予約ですか？再検索",
            },
            register: {
                title: "宿泊者名簿",
                desc: "旅館業法により記入が義務付けられています",
                name: "氏名",
                nationality: "国籍",
                occupation: "職業",
                address: "住所",
                passport: "パスポート番号 (日本国内に住所を有しない方)",
                email: "メールアドレス",
                phone: "電話番号",
                confirmPay: "確認して税金を支払う",
            },
            payment: {
                title: "宿泊税のお支払い",
                desc: "条例により宿泊税の納付が必要です",
                total: "支払い金額",
                note: "この支払いは宿泊税のみです。宿泊料金は精算済みです。",
                card: "クレジットカード",
                pay: "支払う",
                payLocal: "フロントで支払う",
                processing: "処理中...",
            },
            complete: {
                title: "チェックイン完了！",
                desc: "お手続きありがとうございました。ごゆっくりお過ごしください。",
                access: "入室情報",
                doorCode: "ドアコード",
                wifi: "Wi-Fi",
                dashboard: "ダッシュボードへ",
            },
        }
    },
    en: {
        common: {
            loading: "Loading...",
            continue: "Continue",
            back: "Back",
            confirm: "Confirm",
            required: "Required",
        },
        dashboard: {
            welcome: "Welcome to",
            title: "GuestHouse Tomoe.com",
            checkIn: {
                title: "Check In",
                desc: "Complete registration and get access.",
                required: "Required",
                action: "Start Process",
                locked: "Please complete check-in first",
            },
            amenities: {
                title: "Amenities",
                desc: "Request items",
            },
            guide: {
                title: "Guide",
                desc: "Local spots",
            },
            chat: {
                title: "AI Concierge",
                desc: "Ask me anything",
            },
            checkedInMessage: "You are checked in. Enjoy your stay!",
            checkOut: {
                title: "Check Out",
                action: "Proceed",
                confirm: {
                    title: "Ready to Check Out?",
                    desc: "Are you leaving now?",
                    action: "Confirm Check Out",
                },
                complete: {
                    title: "Thank You!",
                    desc: "We hope to see you again soon.",
                    back: "Back to Home"
                }
            }
        },
        checkIn: {
            steps: {
                identify: "Find Booking",
                verify: "Verify",
                register: "Register",
                payment: "Tax",
                complete: "Complete",
            },
            identify: {
                title: "Find Your Booking",
                desc: "Enter your booking reference or phone number.",
                label: "Booking Reference",
                placeholder: "e.g. #12345",
                help: "Having trouble?",
                concierge: "Ask the concierge",
            },
            verify: {
                title: "Confirm Details",
                welcome: "Welcome back,",
                checkIn: "Check In",
                checkOut: "Check Out",
                guests: "Guests",
                yes: "Yes, this is me",
                no: "Wrong booking? Search again",
            },
            register: {
                title: "Guest Register",
                desc: "Required by Japanese Law (Lodging Business Act).",
                name: "Full Name",
                nationality: "Nationality",
                occupation: "Occupation",
                address: "Address",
                passport: "Passport Number (Non-Residents)",
                email: "Email",
                phone: "Phone",
                confirmPay: "Confirm & Pay Tax",
            },
            payment: {
                title: "Accommodation Tax",
                desc: "Payment required by local ordinance.",
                total: "Total Amount",
                note: "This payment is for the Accommodation Tax only. The room charge has already been settled.",
                card: "Credit Card",
                pay: "Pay",
                payLocal: "Pay at Front Desk",
                processing: "Processing...",
            },
            complete: {
                title: "Check-in Complete!",
                desc: "Thank you for submitting your details. Enjoy your stay!",
                access: "Access Information",
                doorCode: "Door Code",
                wifi: "Wi-Fi",
                dashboard: "Go to Dashboard",
            },
        }
    },
    zh: {
        common: {
            loading: "加载中...",
            continue: "继续",
            back: "返回",
            confirm: "确认",
            required: "必须",
        },
        dashboard: {
            welcome: "欢迎来到",
            title: "贵宾门户",
            checkIn: {
                title: "办理入住",
                desc: "完成登记并获取访问权限",
                required: "必须",
                action: "开始办理",
                locked: "请先完成入住手续",
            },
            amenities: {
                title: "便利设施",
                desc: "请求物品",
            },
            guide: {
                title: "向导",
                desc: "当地景点",
            },
            chat: {
                title: "AI 礼宾",
                desc: "随时提问",
            },
            checkedInMessage: "您均已办理入住。祝您入住愉快！",
        },
        checkIn: {
            steps: {
                identify: "查找预订",
                verify: "确认",
                register: "登记",
                payment: "税费",
                complete: "完成",
            },
            identify: {
                title: "查找您的预订",
                desc: "输入您的预订参考号或电话号码。",
                label: "预订参考号",
                placeholder: "例如：#12345",
                help: "遇到问题？",
                concierge: "询问礼宾员",
            },
            verify: {
                title: "确认详情",
                welcome: "欢迎回来，",
                checkIn: "入住",
                checkOut: "退房",
                guests: "位客人",
                yes: "是的，就是我",
                no: "预订有误？重新搜索",
            },
            register: {
                title: "宾客登记",
                desc: "日本法律（旅馆业法）要求。",
                name: "姓名",
                nationality: "国籍",
                occupation: "职业",
                address: "地址",
                passport: "护照号码（非居民）",
                email: "电子邮件",
                phone: "电话",
                confirmPay: "确认并支付税费",
            },
            payment: {
                title: "住宿税",
                desc: "当地条例要求支付。",
                total: "总金额",
                note: "此付款仅用于住宿税。房费已结清。",
                card: "信用卡",
                pay: "支付",
                payLocal: "在前台支付",
                processing: "处理中...",
            },
            complete: {
                title: "入住完成！",
                desc: "感谢您提交详细信息。祝您入住愉快！",
                access: "访问信息",
                doorCode: "门锁密码",
                wifi: "无线网络",
                dashboard: "前往仪表板",
            },
        }
    },
    ko: {
        common: {
            loading: "로딩 중...",
            continue: "계속",
            back: "뒤로",
            confirm: "확인",
            required: "필수",
        },
        dashboard: {
            welcome: "환영합니다",
            title: "게스트 포털",
            checkIn: {
                title: "체크인",
                desc: "등록을 완료하고 이용하세요",
                required: "필수",
                action: "시작하기",
                locked: "먼저 체크인을 완료해주세요",
            },
            amenities: {
                title: "어메니티",
                desc: "비품 요청",
            },
            guide: {
                title: "가이드",
                desc: "주변 명소",
            },
            chat: {
                title: "AI 컨시어지",
                desc: "무엇이든 물어보세요",
            },
            checkedInMessage: "체크인이 완료되었습니다. 편안한 시간 되세요!",
        },
        checkIn: {
            steps: {
                identify: "예약 찾기",
                verify: "확인",
                register: "등록",
                payment: "세금",
                complete: "완료",
            },
            identify: {
                title: "예약 찾기",
                desc: "예약 번호 또는 전화번호를 입력하세요.",
                label: "예약 번호",
                placeholder: "예: #12345",
                help: "문제가 있나요?",
                concierge: "컨시어지에게 문의",
            },
            verify: {
                title: "상세 정보 확인",
                welcome: "환영합니다,",
                checkIn: "체크인",
                checkOut: "체크아웃",
                guests: "명",
                yes: "네, 맞습니다",
                no: "잘못된 예약인가요? 다시 검색",
            },
            register: {
                title: "게스트 등록",
                desc: "일본 법률(숙박업법)에 따라 필수입니다.",
                name: "성명",
                nationality: "국적",
                occupation: "직업",
                address: "주소",
                passport: "여권 번호 (비거주자)",
                email: "이메일",
                phone: "전화번호",
                confirmPay: "확인 및 세금 결제",
            },
            payment: {
                title: "숙박세",
                desc: "지역 조례에 따라 납부가 필요합니다.",
                total: "총 금액",
                note: "이 결제는 숙박세 전용입니다. 객실 요금은 이미 정산되었습니다.",
                card: "신용카드",
                pay: "결제하기",
                payLocal: "프론트에서 결제",
                processing: "처리 중...",
            },
            complete: {
                title: "체크인 완료!",
                desc: "정보를 제출해 주셔서 감사합니다. 즐거운 시간 되세요!",
                access: "입실 정보",
                doorCode: "도어 코드",
                wifi: "와이파이",
                dashboard: "대시보드로 이동",
            },
        }
    },
    th: {
        common: {
            loading: "กำลังโหลด...",
            continue: "ดำเนินการต่อ",
            back: "ย้อนกลับ",
            confirm: "ยืนยัน",
            required: "จำเป็น",
        },
        dashboard: {
            welcome: "ยินดีต้อนรับสู่",
            title: "พอร์ทัลผู้เข้าพัก",
            checkIn: {
                title: "เช็คอิน",
                desc: "ลงทะเบียนให้เสร็จสิ้นเพื่อเข้าใช้งาน",
                required: "จำเป็น",
                action: "เริ่มดำเนินการ",
                locked: "กรุณาเช็คอินให้เสร็จสิ้นก่อน",
            },
            amenities: {
                title: "สิ่งอำนวยความสะดวก",
                desc: "ขออุปกรณ์",
            },
            guide: {
                title: "คู่มือ",
                desc: "สถานที่แนะนำ",
            },
            chat: {
                title: "AI คอนเซียร์จ",
                desc: "ถามอะไรก็ได้",
            },
            checkedInMessage: "คุณเช็คอินเรียบร้อยแล้ว ขอให้มีความสุขกับการเข้าพัก!",
        },
        checkIn: {
            steps: {
                identify: "ค้นหาการจอง",
                verify: "ตรวจสอบ",
                register: "ลงทะเบียน",
                payment: "ภาษี",
                complete: "เสร็จสิ้น",
            },
            identify: {
                title: "ค้นหาการจองของคุณ",
                desc: "ป้อนรหัสการจองหรือหมายเลขโทรศัพท์ของคุณ",
                label: "รหัสการจอง",
                placeholder: "เช่น #12345",
                help: "มีปัญหา?",
                concierge: "ถามคอนเซียร์จ",
            },
            verify: {
                title: "ยืนยันรายละเอียด",
                welcome: "ยินดีต้อนรับกลับ,",
                checkIn: "เช็คอิน",
                checkOut: "เช็คเอาท์",
                guests: "ท่าน",
                yes: "ใช่ ข้อมูลถูกต้อง",
                no: "การจองผิดพลาด? ค้นหาใหม่",
            },
            register: {
                title: "ลงทะเบียนผู้เข้าพัก",
                desc: "จำเป็นตามกฎหมายญี่ปุ่น (พ.ร.บ. ธุรกิจโรงแรม)",
                name: "ชื่อ-นามสกุล",
                nationality: "สัญชาติ",
                occupation: "อาชีพ",
                address: "ที่อยู่",
                passport: "หมายเลขหนังสือเดินทาง (ผู้ที่ไม่ได้อาศัยในญี่ปุ่น)",
                email: "อีเมล",
                phone: "โทรศัพท์",
                confirmPay: "ยืนยันและชำระภาษี",
            },
            payment: {
                title: "ภาษีที่พัก",
                desc: "จำเป็นต้องชำระตามกฎหมายท้องถิ่น",
                total: "ยอดรวม",
                note: "การชำระเงินนี้สำหรับภาษีที่พักเท่านั้น ค่าห้องพักได้ชำระเรียบร้อยแล้ว",
                card: "บัตรเครดิต",
                pay: "ชำระเงิน",
                payLocal: "ชำระที่แผนกต้อนรับ",
                processing: "กำลังดำเนินการ...",
            },
            complete: {
                title: "เช็คอินเสร็จสมบูรณ์!",
                desc: "ขอบคุณที่ส่งข้อมูล ขอให้มีความสุขกับการเข้าพัก!",
                access: "ข้อมูลการเข้าถึง",
                doorCode: "รหัสประตู",
                wifi: "ไวไฟ",
                dashboard: "ไปที่แดชบอร์ด",
            },
        }
    }
};

export const useTranslation = (lang: Language) => {
    return dictionaries[lang];
}
