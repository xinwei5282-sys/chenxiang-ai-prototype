import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircledIcon,
  CheckIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  DotsHorizontalIcon,
  HomeIcon,
  IdCardIcon,
  Link2Icon,
  MagicWandIcon,
  PersonIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons";
import { FileCheck, FileText, ShieldCheck, Sprout } from "lucide-react";
import { BottomSheet, Carousel, FlowStack, KeyboardTextarea, MobileScroll, useKeyboard, useKeyboardInsets, useMobileDevice, useScreenPortal, type FlowScreen } from "./mobile";

const product = "/assets/product/agarwood-bracelet-hero.png";
const officialLogo = "/assets/product/guangken-logo.png";

type CertificateAppraisal = { image: string; sampleName: string; certificateNumber: string; weight: string; conclusion: string; taxonomy: string; note: string; inspection: string; standard: string; queryCode: string };
type CertificateRecord = { key: string; name: string; image: string; spec: string; certificate?: CertificateAppraisal };
const certificateRecords: readonly CertificateRecord[] = [
  { key: "cx-2018-072", name: "奇楠沉香算盘珠手串", image: "/assets/customer-feedback/collection-bracelet-thumbnail.png", spec: "18mm · 16颗", certificate: { image: "/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg", sampleName: "奇楠沉香算盘珠手串", certificateNumber: "ZHTC26063030124", weight: "4.3g+", conclusion: "符合奇楠沉香构造特征", taxonomy: "瑞香科沉香属", note: "无", inspection: "横切面构造", standard: "T/DBCX010-2025", queryCode: "1706" } },
  { key: "cx-2024-116", name: "琼南蜜韵沉香手串", image: "/assets/product/agarwood-bracelet-hero.png", spec: "16mm · 18颗" },
  { key: "cx-2025-031", name: "岭南雅韵沉香手串", image: "/assets/home-selection/bracelet-background-v2.png", spec: "14mm · 20颗" },
];

// Source: AI沉香 溯源环节（整理）.docx, supplied 2026-09-15; all record values are examples.
const provenanceStages = [
  {
    "title": "种苗培育",
    "label": "生命起点",
    "date": "约 12 个月",
    "body": "甄选优质母树种子，采用组培苗技术，于标准化苗圃恒温育苗，严控种苗基因与成活率。从源头把控每一株沉香苗的品质根基。",
    "fields": [
      [
        "种苗批次",
        "GK-YM-2018-03"
      ],
      [
        "育苗基地",
        "广东农垦热带作物科学研究所"
      ],
      [
        "育苗周期",
        "约 12 个月"
      ],
      [
        "出苗标准",
        "苗高 ≥ 60cm，根系完整"
      ]
    ],
    "photos": [
      [
        "image1.png",
        "沉香组培苗"
      ],
      [
        "image2.png",
        "标准化苗圃"
      ]
    ]
  },
  {
    "title": "种植管理",
    "label": "园林生长",
    "date": "2019.04",
    "body": "移植至原生态沉香种植林，依山势自然生长。采用科学管护方案，定期除草、修枝、水肥养护，让树木在自然环境中成材。",
    "fields": [
      [
        "种植基地",
        "广东垦沉香高效种植示范基地（1队）"
      ],
      [
        "种植时间",
        "2019 年 4 月"
      ],
      [
        "种植地块",
        "担杆岭"
      ],
      [
        "林地海拔",
        "待补充"
      ],
      [
        "管护方式",
        "原生态管护 + 定期巡检"
      ]
    ],
    "photos": [
      [
        "image3.jpeg",
        "沉香种植林航拍"
      ],
      [
        "image5.jpeg",
        "种植林与树木挂牌"
      ]
    ]
  },
  {
    "title": "打孔造香",
    "label": "引香入木",
    "date": "2023.06",
    "body": "遵循传统古法与科学工艺，人工在树干上规律打孔，诱导树木自然分泌油脂自我愈合。沉香是树木历经岁月，在伤口处逐渐凝结的“香之结晶”。",
    "fields": [
      [
        "造香工艺",
        "人工物理打孔法"
      ],
      [
        "打孔时间",
        "2023 年 6 月"
      ],
      [
        "造香孔数",
        "待补充"
      ],
      [
        "结香方式",
        "自然结香"
      ]
    ],
    "photos": [
      [
        "image9.jpeg",
        "人工打孔造香现场"
      ]
    ]
  },
  {
    "title": "采收取香",
    "label": "择时采香",
    "date": "2025.11",
    "body": "待油脂充分凝结、色泽深褐后，由经验丰富的香农择期采香。只选取油脂饱满、质地致密的沉香结香部位，剔除白木与杂质，保留精华。",
    "fields": [
      [
        "采香日期",
        "2025 年 11 月"
      ],
      [
        "原料等级",
        "A 级结香料"
      ],
      [
        "单棵取香量",
        "待补充"
      ],
      [
        "采香人员",
        "温国波 · NM018（工号）"
      ]
    ],
    "photos": [
      [
        "image13.jpeg",
        "采香现场"
      ],
      [
        "image15.jpeg",
        "采收原料切段"
      ]
    ]
  },
  {
    "title": "精工淳化",
    "label": "精工淳化",
    "date": "淳化约 90 天",
    "body": "原料经筛选、开料、打孔、精细打磨成珠，再放入恒温恒湿仓静置淳化。去除新料火气与杂味，让香韵逐步沉淀内敛，呈现沉香本真气息。",
    "fields": [
      [
        "加工周期",
        "约 30 天"
      ],
      [
        "淳化时长",
        "约 90 天"
      ],
      [
        "加工工艺",
        "手工打磨 + 恒温淳化"
      ],
      [
        "质检标准",
        "大小规格标准、油脂线均匀、无开裂、无补痕"
      ]
    ],
    "photos": [
      [
        "image19.jpeg",
        "珠料手工加工"
      ],
      [
        "image21.jpeg",
        "珠粒打磨加工"
      ],
      [
        "image23.jpeg",
        "沉香加工车间"
      ]
    ]
  },
  {
    "title": "成品成串",
    "label": "一珠一码",
    "date": "2026.09.10",
    "body": "精选颗颗油脂饱满的珠粒，手工穿串成链，内嵌 AI 溯源芯片。从此刻起，这串沉香拥有了唯一数字身份。扫描芯片，即可回看它从一粒种子到手腕之珠的完整旅程。",
    "fields": [
      [
        "成品编号",
        "GKCX-20260915"
      ],
      [
        "珠径 / 颗数",
        "16mm / 14 颗"
      ],
      [
        "出厂日期",
        "2026 年 9 月 10 日"
      ],
      [
        "质检结论",
        "合格（示例）"
      ],
      [
        "芯片 UID",
        "待补充"
      ]
    ],
    "photos": []
  }
];

const productDocPages = {
  home: {
    label: "P-01 首页", guideHeading: "DOC-P-01 首页", specHeading: "P-01 首页",
    flowHeadings: ["FLOW-01 芯片识别到首页"], stateHeadings: [], requirementPrefixes: ["FR-ID-", "FR-CONTENT-"],
    apiHeadings: ["`GET /v1/bracelets/resolve?scan_token={token}`", "`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-ID-", "AC-HOME-", "AC-COMPAT-"],
  },
  "authorization-sheet": {
    label: "P-02 登录确认层", guideHeading: "DOC-P-02 登录确认层", specHeading: "P-02 登录确认层",
    flowHeadings: ["FLOW-02 首次问帖登录"], stateHeadings: ["会话状态"], requirementPrefixes: ["FR-AUTH-"],
    apiHeadings: ["`POST /v1/auth/wechat-session`"], acceptancePrefixes: ["AC-AUTH-"],
  },
  interpret: {
    label: "P-03 AI问事", guideHeading: "DOC-P-03 AI问事", specHeading: "P-03 AI问事",
    flowHeadings: ["FLOW-03 新问帖与主动追问"], stateHeadings: [], requirementPrefixes: ["FR-AI-", "FR-AUTH-"],
    apiHeadings: ["`POST /v1/conversations`", "`POST /v1/conversations/{conversation_id}/messages`"], acceptancePrefixes: ["AC-AI-", "AC-SAFE-", "AC-AUTH-"],
  },
  profile: {
    label: "P-04 我的", guideHeading: "DOC-P-04 我的", specHeading: "P-04 我的",
    flowHeadings: [], stateHeadings: ["会话状态"], requirementPrefixes: ["FR-AUTH-", "FR-HISTORY-", "FR-ID-"],
    apiHeadings: ["`POST /v1/auth/wechat-session`", "`POST /v1/auth/logout`", "`GET /v1/conversations?cursor={cursor}&limit=20`", "`GET /v1/bracelets/{bracelet_id}`"], acceptancePrefixes: ["AC-AUTH-", "AC-HISTORY-", "AC-ID-", "AC-COMPAT-"],
  },
  "reading-records": {
    label: "P-05 问帖记录", guideHeading: "DOC-P-05 问帖记录", specHeading: "P-05 问帖记录",
    flowHeadings: ["FLOW-04 历史记录与继续追问"], stateHeadings: ["会话状态"], requirementPrefixes: ["FR-HISTORY-", "FR-AUTH-"],
    apiHeadings: ["`GET /v1/conversations?cursor={cursor}&limit=20`", "`DELETE /v1/conversations`"], acceptancePrefixes: ["AC-HISTORY-", "AC-AUTH-", "AC-ERROR-"],
  },
  "reading-record-detail": {
    label: "P-06 问帖详情", guideHeading: "DOC-P-06 问帖详情", specHeading: "P-06 问帖详情",
    flowHeadings: ["FLOW-04 历史记录与继续追问"], stateHeadings: ["AI 对话状态"], requirementPrefixes: ["FR-HISTORY-", "FR-AI-"],
    apiHeadings: ["`GET /v1/conversations/{conversation_id}`", "`POST /v1/conversations/{conversation_id}/messages`", "`DELETE /v1/conversations/{conversation_id}`"], acceptancePrefixes: ["AC-HISTORY-", "AC-AI-"],
  },
  provenance: {
    label: "P-17 防伪溯源", guideHeading: "DOC-P-17 防伪溯源", specHeading: "P-17 防伪溯源",
    flowHeadings: ["FLOW-01 芯片识别到首页"], stateHeadings: [], requirementPrefixes: ["FR-ID-"],
    apiHeadings: ["`GET /v1/bracelets/{bracelet_id}`"], acceptancePrefixes: ["AC-ID-", "AC-CERT-"],
  },
  certificate: {
    label: "P-07 证书详情", guideHeading: "DOC-P-07 证书详情", specHeading: "P-07 证书详情",
    flowHeadings: ["FLOW-01 芯片识别到首页"], stateHeadings: [], requirementPrefixes: ["FR-ID-", "FR-CONTENT-"],
    apiHeadings: ["`GET /v1/bracelets/{bracelet_id}`", "`GET /v1/certificates/{certificate_id}`"], acceptancePrefixes: ["AC-ID-", "AC-AUTH-", "AC-CONTENT-"],
  },
  care: {
    label: "P-08 佩戴养护", guideHeading: "DOC-P-08 佩戴养护", specHeading: "P-08 佩戴养护",
    flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-HOME-", "AC-CONTENT-", "AC-ERROR-"],
  },
  knowledge: {
    label: "P-09 沉香知识", guideHeading: "DOC-P-09 沉香知识", specHeading: "P-09 沉香知识",
    flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-HOME-", "AC-CONTENT-", "AC-ERROR-"],
  },
  "chip-help": {
    label: "P-11 芯片识别说明", guideHeading: "DOC-P-11 芯片识别说明", specHeading: "P-11 芯片识别说明",
    flowHeadings: ["FLOW-01 芯片识别到首页"], stateHeadings: [], requirementPrefixes: ["FR-ID-"],
    apiHeadings: ["`GET /v1/bracelets/resolve?scan_token={token}`", "`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-ID-", "AC-ERROR-"],
  },
  "certificate-list": {
    label: "P-12 我的手串", guideHeading: "DOC-P-12 我的手串", specHeading: "P-12 我的手串",
    flowHeadings: ["FLOW-05 多手串证书"], stateHeadings: [], requirementPrefixes: ["FR-CERT-", "FR-AUTH-"],
    apiHeadings: ["`GET /v1/users/me/bracelets`"], acceptancePrefixes: ["AC-CERT-", "AC-COMPAT-"],
  },
  "collection-archive": {
    label: "P-13 手串档案", guideHeading: "DOC-P-13 手串档案", specHeading: "P-13 手串档案",
    flowHeadings: ["FLOW-06 藏品档案与电子证书"], stateHeadings: [], requirementPrefixes: ["FR-COLLECTION-", "FR-CERT-"],
    apiHeadings: ["`GET /v1/bracelets/{bracelet_id}`", "`GET /v1/certificates/{certificate_id}`"], acceptancePrefixes: ["AC-COLLECTION-", "AC-ERROR-"],
  },
  "industrial-park": {
    label: "P-15 源头产业园", guideHeading: "DOC-P-15 源头产业园", specHeading: "P-15 源头产业园",
    flowHeadings: ["FLOW-07 内容阅读"], stateHeadings: [], requirementPrefixes: ["FR-PARK-", "FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-PARK-", "AC-CONTENT-", "AC-ERROR-"],
  },
  "knowledge-article": {
    label: "P-16 沉香小知识文章", guideHeading: "DOC-P-16 沉香小知识文章", specHeading: "P-16 沉香小知识文章",
    flowHeadings: ["FLOW-07 内容阅读"], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-", "AC-COMPAT-"],
  },
} as const;

type ProductDocPageKey = keyof typeof productDocPages;

type PagePrd = { goal: string; roles: string; entry: string; permission: string; rules: string[]; fields: [string, string, string, string][]; actions: [string, string, string, string][]; boundary: string; states: string; logs: string; empty: string; acceptance: string[]; tech: string[] };
const pagePrdDefaults: Record<ProductDocPageKey, PagePrd> = {
  home: { goal: "以广垦沉香品牌内容建立信任，并让用户进入问帖、手串藏品、证书、养护、知识、外部认种小程序和产业园。", roles: "匿名用户和已授权用户", entry: "芯片识别成功；根导航首页；小程序常规入口", permission: "品牌、证书与内容匿名可读；问帖和个人记录需微信授权", rules: ["页面按品牌主视觉、AI 问帖、广垦甄选、我的藏品、四项服务、源头产业园、沉香小知识和版权顺序纵向滚动。", "首页证书服务直达当前手串；我的证书数量先进入手串列表。", "商城与甄选入口本期只提示即将上线；认种沉香树直接跳转外部认种小程序，不建设内部认种档案。"], fields: [["品牌主视觉", "图文 Banner", "首屏必显", "展示广垦沉香 Logo、海南琼南沉香手串与品牌画面"],["AI 问帖主入口", "按钮", "必显", "文案为开始问帖，每次进入新对话"],["广垦沉香甄选", "商品预告", "固定展示", "展示四项甄选内容，点击只提示即将上线"],["我的藏品", "单个手串卡片", "有演示数据展示", "仅展示海南琼南沉香手串，可进手串档案或下载电子证书"],["服务入口", "四项宫格", "固定展示", "证书查询、佩戴养护、防伪溯源、认种沉香树"],["源头产业园", "图文入口", "固定展示", "进入四图图集与模拟视频"],["沉香小知识", "文章列表", "两篇固定展示", "分别进入公众号式纯展示文章"],["公司版权", "页脚文本", "页面末尾展示", "展示运营主体，不承载操作"]], actions: [["开始问帖", "始终展示", "未授权打开登录确认层；已授权创建新对话", "记录入口来源和 pending_intent"],["查看证书查询", "当前手串有效", "直达当前手串证书详情", "记录 bracelet_id"],["查看藏品", "手串藏品存在", "进入对应手串档案", "记录 collection_id"],["认种沉香树", "始终展示", "跳转外部认种小程序", "生产使用 wx.navigateToMiniProgram 并记录成功或失败"],["佩戴养护 / 沉香知识", "内容可用", "进入对应内容页", "匿名可用，记录 content_key"],["走进产业园", "固定展示", "进入产业园图集与视频页", "记录内容曝光与播放"]], boundary: "本页不建设交易闭环或内部认种档案；认种商品、记录、证书和交易归属外部小程序。AI 只作传统文化角度参考，不作鉴定、医疗、法律、财务或投资承诺。", states: "页面加载→分模块成功/失败；开始问帖→授权确认/新对话；商城入口→即将上线提示；认种入口→外部小程序/失败留在首页重试。", logs: "记录 scan_token、页面曝光、模块点击、下载结果、外部小程序跳转结果和错误码；未授权时不记录个人身份。", empty: "单个模块失败不阻塞其他模块；无手串上下文时隐藏直达证书并提供重新识别；外部认种小程序无法打开时留在首页并提示重试。", acceptance: ["模块顺序与已确认首页一致，底部导航不遮挡版权。", "未授权点击问帖先进入微信授权确认，成功后恢复问帖意图。", "认种沉香树不进入内部档案，原型提示正在打开外部小程序并保持首页。"], tech: ["识别结果与 current_bracelet_id 必须绑定。", "生产认种入口使用可配置 AppID 和路径调用 wx.navigateToMiniProgram。", "模块接口独立降级，图片需有替代文本和缓存策略。"] },
  "authorization-sheet": { goal: "解释微信授权用途并在确认后恢复用户刚才的操作。", roles: "首次发起问帖的消费者", entry: "点击开始问帖；点击我的中的授权登录", permission: "未授权用户可见", rules: ["授权说明必须先于微信授权动作展示。", "取消不丢失原入口意图，再次点击可重新唤起。"], fields: [["授权说明", "说明文本", "必填展示", "仅说明头像、昵称和问帖记录用途"],["微信授权登录", "按钮", "必填展示", "唯一确认动作"],["取消", "按钮", "必填展示", "关闭弹层并返回原页面"]], actions: [["微信授权登录", "弹层打开", "唤起授权并恢复原意图", "记录授权结果"],["取消", "弹层打开", "关闭弹层", "记录取消事件"]], boundary: "不得暗示授权后获得超出实际范围的权益。", states: "打开→授权中→成功/失败；取消→关闭。", logs: "记录授权发起、成功、失败原因与恢复目标。", empty: "授权失败保留弹层并提供重试。", acceptance: ["授权后回到用户原本要去的页面。", "取消后页面状态不改变。"], tech: ["授权回调需幂等。", "意图参数需安全白名单化。"] },
  interpret: { goal: "用简洁的移动对话完成自由提问、必要追问和传统文化角度参考。", roles: "已授权消费者", entry: "首页开始问帖；根导航问帖；历史详情开启新问帖", permission: "微信授权后", rules: ["每次正常进入均创建新的对话，不自动带入上一段历史。", "默认展示广垦沉香 Logo、今天想问什么及事业/感情/财运三个快捷主题。", "仅支持文字输入和发送，不提供图片、文件、附件、相机、麦克风或语音。"], fields: [["新对话空态", "Logo＋引导", "无消息时展示", "展示今天想问什么、说明和三个快捷主题"],["对话消息", "消息列表", "有消息展示", "按时间顺序展示用户与 AI 内容"],["AI 回答", "结构化文本", "生成完成展示", "使用判断、提醒、建议三个层次"],["输入框", "文本框", "固定底部展示", "支持中文文本，避让键盘与手机安全区"],["发送", "按钮", "输入非空且非生成中可用", "发送后展示处理中状态"],["免责声明", "说明文本", "AI 内容中必显", "固定文案：内容由 AI 生成，仅供娱乐参考"]], actions: [["快捷主题", "新对话空态", "直接发送对应主题", "记录 starter_topic"],["发送", "输入非空", "创建消息并返回 AI 回复", "记录 conversation_id、message_id 与耗时"],["返回", "始终展示", "回到来源页面", "已产生消息的对话进入历史记录"]], boundary: "回答不得形成确定性预测、转运承诺或医疗、法律、财务等专业结论。", states: "新对话空态→用户发送→AI 追问/回答→继续追问；请求失败→保留用户消息并重试。", logs: "记录会话创建、消息发送、耗时、错误与安全拦截，不记录图片或音频数据。", empty: "新对话展示 Logo 与快捷主题；网络失败保留用户消息和输入草稿。", acceptance: ["每次进入均为无旧消息的新对话。", "发送后用户消息与 AI 回复顺序正确，回答包含判断、提醒和建议。", "输入框不贴手机边缘且键盘打开后仍可见。"], tech: ["消息接口需支持幂等、主动追问和流式/轮询扩展。", "输入输出必须经过安全策略并保存策略版本。"] },
  profile: { goal: "用重点明确的账号 Banner 集中承载授权状态、问帖记录、证书数量和芯片说明。", roles: "匿名用户和已授权消费者", entry: "根导航我的", permission: "访客可看授权入口；问帖记录和绑定手串需授权", rules: ["Banner 通铺至状态栏并左右贴边，头像、账号文案和授权状态保持同一横排。", "Banner 下半部只展示问帖记录与证书数量，数量在上、标题在下并支持整块点击。", "证书数量采用列表优先路径；Banner 下只保留芯片识别说明。"], fields: [["头像与账号", "身份区", "Banner 上部必显", "未授权展示微信账号，授权后展示微信用户"],["微信授权登录", "按钮/状态", "未授权展示按钮", "点击打开手机内授权确认层，授权后显示已登录"],["问帖记录", "统计入口", "固定展示", "原型显示 1 条，点击进入记录列表"],["证书数量", "统计入口", "固定展示", "原型显示 3 串，点击进入我的手串列表"],["芯片识别说明", "单行入口", "Banner 下唯一列表项", "进入 NFC 识别说明"]], actions: [["微信授权登录", "未授权", "打开授权确认层", "记录来源意图"],["问帖记录", "固定展示", "未授权先授权；已授权进入记录列表", "校验当前用户"],["证书数量", "固定展示", "进入我的手串列表", "生产环境校验绑定关系"],["芯片识别说明", "始终展示", "进入识别说明页", "匿名可用"]], boundary: "不重复展示记录、证书或传统文化解读帮助入口，不泄露其他用户数据。", states: "未授权→授权确认/取消；已授权→计数加载→数据/空态/失败。", logs: "记录授权、两个统计入口点击、手串列表加载与错误。", empty: "计数失败显示 --；无手串或无问帖显示 0，并在目标页给出明确空态。", acceptance: ["头像、账号和登录状态同一行，登录状态右对齐。", "问帖记录和证书数量均为数量在上、标题在下并可点击。", "Banner 下仅保留芯片识别说明。"], tech: ["统计数据与绑定关系按用户隔离。", "Banner 与状态栏安全区需适配 iPhone 和 Pixel。"] },
  "reading-records": { goal: "让用户查找已保存问帖并进入只读详情。", roles: "已授权消费者", entry: "我的→问帖记录", permission: "微信授权后", rules: ["列表按最近更新时间倒序。", "点击记录只进入历史详情，不直接继续旧对话。"], fields: [["问帖标题", "文本", "每条必显", "标题为空时使用首条用户消息摘要"],["相对时间", "时间文本", "每条必显", "依据 updated_at 生成"],["回答摘要", "文本", "有内容展示", "展示最近一条 AI 回答摘要"],["空态", "提示", "无记录展示", "引导开始新的问帖"]], actions: [["问帖记录项", "有记录", "进入只读问帖详情", "记录 conversation_id 并校验归属"],["开始新问帖", "空态展示", "创建全新对话", "记录来源为空态"]], boundary: "本页不提供删除、编辑或继续旧会话输入。", states: "加载→有记录/空态/失败；点击记录→只读详情。", logs: "记录列表查询、记录打开、分页和错误。", empty: "无记录时展示明确空态与开始新问帖入口；失败保留已加载数据并可重试。", acceptance: ["列表按最近更新时间稳定排序。", "点击记录进入只读详情，不直接进入新问帖。"], tech: ["生产列表使用 cursor 分页并按账号隔离。"] },
  "reading-record-detail": { goal: "完整呈现历史问帖上下文，并让用户从独立入口开启新问帖。", roles: "已授权消费者", entry: "问帖记录列表", permission: "仅记录所属用户", rules: ["历史消息只读，不展示输入框。", "开启新问帖必须创建新的 conversation_id，不续接当前历史。"], fields: [["问帖主题", "文本", "必显", "展示历史问题标题"],["消息时间线", "只读列表", "有记录展示", "保留问答顺序、角色与内容"],["AI 免责声明", "说明文本", "AI 内容必显", "内容由 AI 生成，仅供娱乐参考"],["开启新问帖", "按钮", "固定展示", "进入全新对话"]], actions: [["开启新问帖", "始终展示", "创建新会话并进入问帖空态", "记录来源 conversation_id，不复用该 ID"],["返回", "始终展示", "返回问帖记录列表", "保留列表位置"]], boundary: "历史内容只读，不代表当前专业结论，也不能在本页继续发送消息。", states: "加载→详情/不存在/越权；开启新问帖→全新对话。", logs: "记录详情查看、越权拦截和新问帖点击。", empty: "记录不存在或越权统一提示这条问帖记录已不存在，并返回列表。", acceptance: ["历史页不展示输入框。", "开启新问帖后进入无旧消息的新对话。"], tech: ["服务端校验 conversation_id 所属关系。", "不存在与越权使用统一外显错误。"] },
  provenance: { goal: "展示当前或所选手串的数字身份与溯源时间线。", roles: "持有效扫描会话的匿名用户；已绑定手串的用户", entry: "首页防伪溯源", permission: "有效扫描会话可读；个人列表校验绑定归属", rules: ["名称、唯一编号、六站记录与图片必须归属所选 bracelet_id，不跨串复用。", "原型依据用户提供的六环节文档展示示例，不代表已完成真实防伪核验。", "证书原件缺失不阻止查看本串溯源。"], fields: [["手串编号", "文本", "必显", "与所选手串一致"],["种植地块、规格与出厂日期", "文本", "有数据展示", "使用来源文档示例；未知值待补充"],["溯源时间线", "节点列表", "有数据展示", "种苗培育、种植管理、打孔造香、采收取香、精工淳化、成品成串；现场照片和默认完整展示的详细数据"]], actions: [["返回", "始终展示", "返回原入口", "保留来源上下文"]], boundary: "真实防伪核验与生产溯源接口尚未接入；不恢复内部认种档案。", states: "进入→本串身份及时间线/信息待补充→返回首页。", logs: "记录所选 bracelet_id、入口来源和查询结果。", empty: "缺少时间线时显示溯源信息待补充，不借用其他手串记录。", acceptance: ["首页第三项为防伪溯源，证书查询仍独立。", "第二、第三串不混用第一串编号或时间线。", "六站详细数据默认全部展示，支持滚动阅读并返回。"], tech: ["正式环境需按 bracelet_id 接入身份及溯源接口。", "失败、未绑定与无记录状态不得显示已核验。"] },
  certificate: { goal: "展示证书原件与结构化检验字段，并按手串独立绑定。", roles: "持有效扫描会话的匿名用户；拥有绑定关系的已授权用户", entry: "首页证书查询；我的→我的手串", permission: "公开扫描证书可读；绑定列表来源需校验账号归属", rules: ["展示证书原件和结构化检验字段；证书与防伪溯源分别从首页进入，不提供互相跳转按钮。", "首页使用 current_bracelet_id，列表使用 selected_bracelet_id，证书对象必须归属对应手串。", "缺少原件时显示待补充，不得复用其他手串证书。"], fields: [["证书原件", "图片", "有原件展示", "完整展示并支持适应宽度与 2× 查看"],["样品名称", "文本", "有证书展示", "与证书原件一致"],["证书编号", "文本", "有证书展示", "唯一证书标识"],["样品重量与检验结论", "文本", "有证书展示", "按证书原文展示"],["科属、备注与放大检查", "文本", "有证书展示", "按证书原文展示"],["执行标准与查询码", "文本", "有证书展示", "查询码本期只展示"]], actions: [["查看证书原件", "原件已收录", "打开手机内原图查看层", "点击切换适应宽度与 2×"],["关闭原件", "查看层打开", "返回证书详情", "支持按钮与 Esc"],["返回", "始终展示", "返回首页或我的手串", "保留来源上下文"]], boundary: "防伪溯源在独立页面展示；本期不建设证书查询接口、复制动作或二维码生成，也不把证书表述为功效、价格或投资价值承诺。", states: "详情→原件查看/图片失败；多手串→完整证书或原件待补充。", logs: "记录 bracelet_id、certificate_id、查看来源、原图查看和图片失败，不记录原件外的推断字段。", empty: "图片加载失败显示证书原件暂时无法加载，结构化字段仍可阅读；无原件显示证书原件待补充。", acceptance: ["证书原件完整可查看，并可在适应宽度与 2× 之间切换。", "无原件手串不复用其他手串证书。", "iPhone 与 Pixel 均无横向溢出或关键内容遮挡。"], tech: ["证书对象必须归属对应 bracelet_id。", "原图资源失败时必须独立降级，不影响字段展示。"] },
  care: { goal: "提供连续、易执行的佩戴和养护指南。", roles: "沉香手串消费者", entry: "首页佩戴养护", permission: "公开可读", rules: ["按七个步骤连续阅读。", "明确避化学品、避高温、密封收存等风险。"], fields: [["养护步骤", "长文列表", "必填展示", "标题、说明和注意事项"],["步骤序号", "序号", "必填展示", "保持阅读顺序"]], actions: [["返回", "始终展示", "返回来源页", "无业务记录"]], boundary: "仅为日常保养建议，不替代专业维修。", states: "加载→正文/失败。", logs: "记录内容曝光和阅读完成。", empty: "内容缺失展示重试。", acceptance: ["七步内容顺序正确且无截断。"], tech: ["正文支持版本化和缓存。"] },
  knowledge: { goal: "提供沉香形成、闻香与产区差异三项基础知识。", roles: "消费者、文化内容读者", entry: "首页沉香知识或查看更多", permission: "公开可读", rules: ["知识页只展示三项基础知识。", "产业源头和园区介绍统一由首页走进产业园承接。"], fields: [["基础知识", "正文", "三项完整展示", "沉香如何形成、怎样闻香、常见产区差异"]], actions: [["返回", "始终展示", "返回首页", "无业务写操作"]], boundary: "不展示产业源头或农垦故事入口。", states: "加载→内容/空态/失败。", logs: "记录内容曝光与版本。", empty: "无内容展示稍后再看。", acceptance: ["三项知识可读，产业入口已移除。"], tech: ["内容 key 与版本需稳定。"] },
  "chip-help": { goal: "说明 NFC 识别步骤，并为失败用户提供重试路径。", roles: "首次识别用户、售后人员", entry: "识别失败提示；首页识别说明", permission: "公开可读", rules: ["说明必须短、可操作，失败时优先给重试。", "芯片识别说明下不再放重复说明文字。"], fields: [["识别步骤", "步骤列表", "必填展示", "靠近、保持、等待"],["重新识别", "按钮", "识别失败展示", "重新发起 NFC 识别"]], actions: [["重新识别", "失败状态", "再次调用识别能力", "记录失败与重试次数"]], boundary: "无法识别不等于商品异常，需提供人工核验渠道。", states: "待识别→识别中→成功/失败。", logs: "记录设备能力、耗时、结果码和重试次数。", empty: "设备不支持 NFC 时提示兼容方案。", acceptance: ["用户能理解下一步并完成重试。"], tech: ["兼容 NFC 不可用与权限拒绝。"] },
  "certificate-list": { goal: "让多手串用户先选择手串，再查看所选手串的证书详情或原件待补充状态。", roles: "拥有绑定手串的已授权消费者", entry: "我的→证书数量", permission: "微信授权后，仅本人绑定数据", rules: ["导航标题下直接开始全宽列表，不显示眉题、大标题、数量说明或引导文案。", "点击任一手串整行进入该手串的证书详情。", "有证书显示编号、重量与原件已收录；无证书显示规格与原件待补充。"], fields: [["缩略图", "图片", "每行必显", "与 bracelet_id 对应"],["手串名称", "文本", "每行必显", "使用绑定记录名称"],["证书摘要", "状态文本", "每行必显", "按当前手串显示已收录或待补充，不跨手串复用"]], actions: [["手串列表项", "有绑定数据", "进入所选手串的证书详情", "记录 bracelet_id 并校验归属"],["返回", "始终展示", "回到我的", "保留列表位置"]], boundary: "只展示当前账号已绑定手串；不在详情内增加左右滑动或相邻证书切换。", states: "加载→手串列表/空态/失败；选择手串→证书详情/原件待补充。", logs: "记录列表查看、所选 bracelet_id 和加载错误。", empty: "无绑定手串时展示空态和芯片识别说明；单串无证书时显示原件待补充。", acceptance: ["原型恰好展示三条手串记录。", "点击第二、第三条后不得显示第一条证书数据。", "列表行触控高度不小于 76px。"], tech: ["列表接口需支持分页、绑定状态和账号隔离。", "证书详情必须使用所选 bracelet_id 查询。"] },
  "collection-archive": { goal: "展示首页藏品中的手串档案和可下载电子证书。", roles: "查看本人藏品的消费者", entry: "首页我的藏品→手串卡片", permission: "原型可直接查看；生产个人档案需授权并校验归属", rules: ["档案数据必须与首页藏品卡片一致。", "电子证书使用对应藏品文件名，下载失败不得离开页面。"], fields: [["手串图片", "图片", "必显", "与首页藏品图一致"],["名称与档案编号", "文本", "必显", "原型为海南琼南沉香手串 / CX-2018-072"],["材质与规格", "属性", "必显", "展示档案登记信息"],["档案状态", "状态", "必显", "已认证或异常"],["电子证书", "PDF 文件", "有证书展示", "文件名与藏品一致"]], actions: [["下载电子证书", "证书可用", "开始下载 PDF 并提示结果", "记录 collection_id、文件版本与结果"]], boundary: "档案和证书不构成功效、价格或投资价值承诺。", states: "加载→档案/失败；下载→准备中/成功/失败。", logs: "记录档案查看、证书版本和下载结果。", empty: "档案不存在时提示返回首页；下载失败保留页面并允许重试。", acceptance: ["档案数据与首页卡片一致。", "证书文件名、编号与当前藏品一致。"], tech: ["档案与证书关系由服务端校验。", "下载地址需短时有效并防越权。"] },
  "industrial-park": { goal: "以关键数据、产业链与分节正文介绍曙光农场全产业链。", roles: "品牌访客和消费者", entry: "首页走进产业园", permission: "公开可读", rules: ["采用图文专题排版，使用客户确认的航拍全景、林业服务站和高效种植示范基地三张照片，不展示演示图集和模拟视频。", "结香技术为试验探索，沉香提取物用于日化、药品等为研发方向。"], fields: [["规模数据", "数据摘要", "四项展示", "1万余亩、44万余株、98个种质资源、2.5万余平方米加工园"],["产业链", "有序列表", "必显", "良种选育、标准化种植、精深加工、品牌培育、线上线下销售"],["园区说明", "分节正文", "六节完整展示", "产业源头与种质资源、技术标准、结香探索、精深加工、出口贸易、品牌发展"]], actions: [["纵向阅读", "始终可用", "阅读全部正文", "记录内容曝光"],["返回", "始终展示", "返回首页", "无业务写操作"]], boundary: "按客户提供的文字与确认采用的照片展示；林业服务站不可标注为深加工车间。", states: "加载→完整正文/失败。", logs: "记录内容曝光和加载错误。", empty: "内容加载失败显示重试。", acceptance: ["关键数据准确，长文可完整滚动阅读。", "不出现图集页码或模拟视频入口。"], tech: ["保留内容版本，后续实际媒体须审核后接入。"] },
  "knowledge-article": { goal: "以接近微信公众号的长文结构展示沉香小知识，当前仅展示。", roles: "文化内容读者", entry: "沉香知识卡片", permission: "公开可读", rules: ["详情页只做展示，不提供点赞、评论、分享或交易操作。", "文章标题、来源、更新时间和正文完整呈现。"], fields: [["文章标题", "文本", "必填展示", "对应知识主题"],["文章正文", "富文本", "必填展示", "微信公众号式段落阅读"],["来源与时间", "元信息", "有数据展示", "标记内容来源和更新时间"]], actions: [["返回", "始终展示", "回到知识列表/来源页", "无业务记录"]], boundary: "文章是知识参考，不构成鉴定结论。", states: "加载→文章/失败。", logs: "记录文章曝光与阅读完成。", empty: "文章缺失展示重试。", acceptance: ["正文可滚动阅读且不出现空白页。"], tech: ["富文本需过滤危险标签，图片懒加载。"] },
};

function CurrentPagePrd({ pageKey }: { pageKey: ProductDocPageKey }) {
  const resolvedPageKey = pagePrdDefaults[pageKey] ? pageKey : "home";
  const config = productDocPages[resolvedPageKey];
  const data = pagePrdDefaults[resolvedPageKey];
  const updatedAt = resolvedPageKey === "home" || resolvedPageKey === "certificate" || resolvedPageKey === "certificate-list" ? "2026-09-01" : "2026-08-31";
  const flows = data.states.split("；").map(flow => flow.trim()).filter(Boolean);
  return <article className="product-doc-review-article product-doc-review-page-guide current-page-prd">
    <div className="current-page-prd-meta"><span className="status">需求已整理</span><span>页面键：{resolvedPageKey}</span><span>路由：{resolvedPageKey}</span><span>更新：{updatedAt}</span></div>
    <section className="current-page-prd-section"><h2>页面概述</h2><dl className="current-page-prd-overview"><div><dt>页面目标</dt><dd>{data.goal}</dd></div><div><dt>适用角色</dt><dd>{data.roles}</dd></div><div><dt>页面入口</dt><dd>{data.entry}</dd></div><div><dt>权限要求</dt><dd>{data.permission}</dd></div></dl></section>
    <section className="current-page-prd-section"><h2>页面级业务规则</h2><ul>{data.rules.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section className="current-page-prd-section"><h2>页面字段</h2><div className="current-page-prd-table-wrap"><table><thead><tr><th>字段</th><th>类型</th><th>必填/展示规则</th><th>业务口径</th></tr></thead><tbody>{data.fields.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={`${row[0]}-${i}`}>{cell}</td>)}</tr>)}</tbody></table></div></section>
    <section className="current-page-prd-section"><h2>操作与结果</h2><div className="current-page-prd-table-wrap"><table><thead><tr><th>按钮/操作</th><th>展示条件</th><th>执行结果</th><th>权限与记录</th></tr></thead><tbody>{data.actions.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={`${row[0]}-${i}`}>{cell}</td>)}</tr>)}</tbody></table></div></section>
    <section className="current-page-prd-section"><h2>治理边界提示</h2><div className="current-page-prd-boundary"><strong>本页产品边界</strong><span>{data.boundary}</span></div></section>
    <section className="current-page-prd-section"><h2>状态与跳转</h2><div className="current-page-prd-flows">{flows.map(flow => <div key={flow}>{flow.split("→").map((step, index) => <span key={`${flow}-${index}`}>{index ? <i aria-hidden="true">→</i> : null}<b>{step.trim()}</b></span>)}</div>)}</div></section>
    <section className="current-page-prd-section"><h2>通知与日志</h2><ul><li>{data.logs}</li><li>关键查看、授权、下载和失败行为按生产权限写入审计记录。</li></ul></section>
    <section className="current-page-prd-section"><h2>异常与空状态</h2><div className="current-page-prd-table-wrap compact"><table><thead><tr><th>场景</th><th>页面表现</th></tr></thead><tbody><tr><td>无页面权限</td><td>隐藏受限入口；直接访问由服务端拦截。</td></tr><tr><td>数据加载失败</td><td>保留页面结构，展示失败原因与重试入口。</td></tr><tr><td>本页空态</td><td>{data.empty}</td></tr></tbody></table></div></section>
    <section className="current-page-prd-section"><h2>页面验收标准</h2><ol>{data.acceptance.map(item => <li key={item}>{item}</li>)}</ol></section>
    <section className="current-page-prd-section"><h2>技术评估项</h2><ul>{data.tech.map(item => <li key={item}>{item}</li>)}</ul><p className="current-page-prd-note">以上只定义产品约束，具体实现方案由技术侧评估。</p></section>
  </article>;
}

function readActiveProductDocPage() {
  if (typeof document === "undefined") return "home";
  const overlay = document.querySelector<HTMLElement>("[data-product-doc-overlay]");
  if (overlay?.dataset.productDocOverlay) return overlay.dataset.productDocOverlay;
  return document.querySelector<HTMLElement>('[data-flow-current="true"] [data-product-doc-page]')?.dataset.productDocPage ?? "";
}

function ProductDocumentReview() {
  const [open, setOpen] = useState(false);
  const [activePageKey, setActivePageKey] = useState("home");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pageAtPointerDownRef = useRef("");
  const pageAtOpenRef = useRef("");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      wasOpenRef.current = true;
      closeRef.current?.focus({ preventScroll: true });
      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", closeOnEscape);
      return () => { window.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = previousOverflow; };
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    const updateActivePage = () => {
      const nextPage = readActiveProductDocPage();
      if (pageAtOpenRef.current === "authorization-sheet" && nextPage !== "authorization-sheet") return;
      setActivePageKey(nextPage && nextPage in productDocPages ? nextPage : "home");
    };
    updateActivePage();
    const observer = new MutationObserver(updateActivePage);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-flow-current", "data-product-doc-page", "data-product-doc-overlay"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (open) bodyRef.current?.scrollTo({ top: 0 }); }, [activePageKey, open]);

  const openReview = () => {
    if (open) {
      pageAtOpenRef.current = "";
      setOpen(false);
      return;
    }
    const nextPage = pageAtPointerDownRef.current || readActiveProductDocPage();
    pageAtPointerDownRef.current = "";
    pageAtOpenRef.current = nextPage;
    setActivePageKey(nextPage);
    setOpen(true);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`product-doc-review-layer${open ? " open" : ""}`} data-testid="product-doc-review-layer">
      <button ref={triggerRef} className="product-doc-review-trigger" type="button" aria-label={`查看${productDocPages[(pageAtPointerDownRef.current || activePageKey) as ProductDocPageKey]?.label.replace(/^P-\d+\s*/, "") || "首页"} · 页面 PRD`} aria-expanded={open} aria-controls="product-doc-review-drawer" onPointerDownCapture={() => { pageAtPointerDownRef.current = readActiveProductDocPage(); }} onClick={openReview}>
        <span>页面</span><b>PRD</b>
      </button>
      {open ? <button className="product-doc-review-mask" data-testid="product-doc-review-mask" aria-label="关闭" onClick={() => setOpen(false)} /> : null}
      <aside id="product-doc-review-drawer" className="product-doc-review-drawer" data-open={open} role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="product-doc-review-title" inert={!open}>
        {open ? <>
          <header className="product-doc-review-header">
            <div>
              <span>页面级产品需求 · 字段级</span>
              <h2 id="product-doc-review-title">{productDocPages[activePageKey as ProductDocPageKey]?.label.replace(/^P-\d+\s*/, "") || "首页"} · 页面 PRD</h2>
            </div>
            <button ref={closeRef} type="button" aria-label="关闭" onClick={() => { pageAtOpenRef.current = ""; setOpen(false); }}>关闭</button>
          </header>
          <div ref={bodyRef} className="product-doc-review-body">
            <CurrentPagePrd pageKey={activePageKey as ProductDocPageKey} />
          </div>
          <footer className="product-doc-review-footer"><span>琼南沉香 · 15 个产品上下文 · 当前：{productDocPages[activePageKey as ProductDocPageKey]?.label.replace(/^P-\d+\s*/, "") || "首页"}</span><button type="button" onClick={() => setOpen(false)}>关闭 PRD</button></footer>
        </> : null}
      </aside>
    </div>,
    document.body,
  );
}

type AuthorizationContextValue = { authorized: boolean; authorize: () => void };
const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

function useAuthorization() {
  const value = useContext(AuthorizationContext);
  if (!value) throw new Error("useAuthorization must be used inside AuthorizationContext.Provider");
  return value;
}

function prepareH5Transition(keyboard: ReturnType<typeof useKeyboard>) {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
  keyboard.hide();
}

function MiniProgramCapsule() {
  return <div className="mini-capsule" aria-hidden="true"><DotsHorizontalIcon /><i /><CircleIcon /></div>;
}

function MiniProgramNav({ title, back, keyboard, root = false }: { title?: string; back?: () => void; keyboard?: ReturnType<typeof useKeyboard>; root?: boolean }) {
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (back) backRef.current?.focus({ preventScroll: true });
  }, [back]);
  const handleBack = () => {
    if (keyboard) prepareH5Transition(keyboard);
    back?.();
  };
  return <header className={`mini-nav${root ? " root" : ""}`}>
    <div className="mini-nav-side">{back ? <button ref={backRef} onClick={handleBack} aria-label="返回"><ChevronLeftIcon /></button> : null}</div>
    {title ? <h1>{title}</h1> : <span aria-hidden="true" />}
    <MiniProgramCapsule />
  </header>;
}

function TopBar({ title, back, keyboard }: { title: string; back?: () => void; keyboard?: ReturnType<typeof useKeyboard> }) {
  return <MiniProgramNav title={title} back={back} keyboard={keyboard} />;
}

function AuthorizationSheet({ open, onOpenChange, onAuthorize, title = "登录后开始问帖", buttonLabel = "微信授权并继续", description = "用于同步问帖记录与已识别手串", message = "授权后，本次问帖会保存在你的记录中，方便之后继续查看。" }: { open: boolean; onOpenChange: (open: boolean) => void; onAuthorize: () => void; title?: string; buttonLabel?: string; description?: string; message?: string }) {
  return <BottomSheet open={open} onOpenChange={onOpenChange} title={title} description={description} snap={0.42}>
    {open ? <span hidden data-product-doc-overlay="authorization-sheet" /> : null}
    <div className="authorization-gate">
      <span className="authorization-gate-icon"><PersonIcon /></span>
      <p>{message}</p>
      <button onClick={onAuthorize}>{buttonLabel}</button>
      <button type="button" className="authorization-cancel" onClick={() => onOpenChange(false)}>取消</button>
      <small>需求原型模拟授权，不会读取真实微信数据</small>
    </div>
  </BottomSheet>;
}

type RootTab = "home" | "mall" | "ask" | "profile";

function useTransientMessage() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);
  const show = (next: string) => {
    setMessage(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(""), 2200);
  };
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  return { message, show };
}

function PrototypeToast({ message }: { message: string }) {
  return message ? <div className="prototype-toast" role="status">{message}</div> : null;
}

function MiniTabs({ active, onHome, onMall, onAsk, onProfile }: { active: RootTab; onHome: () => void; onMall: () => void; onAsk: () => void; onProfile: () => void }) {
  return <nav className="mini-tabs" aria-label="小程序导航">
    <button className={active === "home" ? "active" : ""} aria-current={active === "home" ? "page" : undefined} onClick={onHome}><HomeIcon aria-hidden="true" /><span>首页</span></button>
    <button className={`mini-tab-mall${active === "mall" ? " active" : ""}`} aria-label="商城" aria-current={active === "mall" ? "page" : undefined} onClick={onMall}><span className="mini-tab-soon" aria-hidden="true">即将上线</span><IdCardIcon aria-hidden="true" /><span>商城</span></button>
    <button className={active === "ask" ? "active" : ""} aria-current={active === "ask" ? "page" : undefined} onClick={onAsk}><ChatBubbleIcon aria-hidden="true" /><span>问帖</span></button>
    <button className={active === "profile" ? "active" : ""} aria-current={active === "profile" ? "page" : undefined} onClick={onProfile}><PersonIcon aria-hidden="true" /><span>我的</span></button>
  </nav>;
}

function BraceletHero({ onOpen }: { onOpen: () => void }) {
  return <button className="bracelet-hero home-reference-hero" data-testid="home-bracelet-hero" data-home-section="home-hero" aria-label="查看海南琼南沉香手串来处" onClick={onOpen}>
    <img className="bracelet-hero-photo" src="/assets/home-reference/hero-boy-banner.png" alt="广垦沉香男孩手持沉香手串" />
    <span className="home-hero-copy">
      <img className="home-hero-logo" src="/assets/home-reference/guangken-chenxiang-logo.png" alt="广垦沉香 Logo" />
      <span className="home-hero-title" role="heading" aria-level={1} aria-label="中国香 世界礼">中国香<span className="home-hero-title-second">世界礼</span></span>
      <span className="home-hero-subtitle">不仅是香，更是身心治愈师</span>
    </span>
  </button>;
}

function ServiceRow({ icon, title, note, onClick, testId, ariaLabel }: { icon: ReactNode; title: string; note?: string; onClick: () => void; testId?: string; ariaLabel?: string }) {
  return <button className="service-row" onClick={onClick} data-testid={testId} aria-label={ariaLabel}>
    <span className="service-icon">{icon}</span><span><strong>{title}</strong>{note ? <small>{note}</small> : null}</span><ChevronRightIcon />
  </button>;
}

function HomeServiceLink({ icon, title, note, onClick, testId, ariaLabel }: { icon: ReactNode; title?: string; note?: string; onClick: () => void; testId?: string; ariaLabel?: string }) {
  return <button className="home-feature-item home-service-link" onClick={onClick} data-testid={testId} aria-label={ariaLabel}>
    <span className="home-service-icon" aria-hidden="true">{icon}</span>{title ? <strong>{title}</strong> : null}{note ? <small>{note}</small> : null}
  </button>;
}

type Collectible = { id: "bracelet"; name: string; number: string; image: string; imageAlt: string; facts: readonly [string, string][]; certificateHref: string; certificateFilename: string };
const collectibles: Collectible[] = [
  { id: "bracelet", name: "海南琼南沉香手串", number: "CX-2018-072", facts: [["材质", "海南沉香"], ["规格", "18mm · 16颗"], ["状态", "身份已核验"]], image: "/assets/customer-feedback/collection-bracelet-thumbnail.png", imageAlt: "海南琼南沉香手串", certificateHref: "/assets/certificates/bracelet-digital-certificate-demo.pdf", certificateFilename: "海南琼南沉香手串-电子证书-演示.pdf" },
];

function CertificateDownloadLink({ item, onToast, showIcon = false }: { item: Collectible; onToast: (message: string) => void; showIcon?: boolean }) {
  const download = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(item.certificateHref, { method: "HEAD" });
      if (!response.ok) throw new Error("unavailable");
      const anchor = document.createElement("a"); anchor.href = item.certificateHref; anchor.download = item.certificateFilename; anchor.click();
      onToast("电子证书已开始下载");
    } catch { onToast("电子证书下载失败，请重试"); }
  };
  return <a href={item.certificateHref} download={item.certificateFilename} aria-label={`导出${item.name}电子证书`} onClick={download}>{showIcon ? <FileText aria-hidden="true" /> : null}<span>导出电子证书</span></a>;
}

function CollectionCard({ item, onOpen, onToast }: { item: Collectible; onOpen: () => void; onToast: (message: string) => void }) {
  const status = "已认证";
  const numberLabel = "档案编号";
  const visibleFacts = item.facts.filter(([label]) => label !== "状态").slice(0, 2);
  return <article className="collection-card" data-active="true">
    <header className="collection-card-header"><h3>我的藏品</h3><CertificateDownloadLink item={item} onToast={onToast} showIcon /><button type="button" aria-label={`查看${item.name}档案`} onClick={onOpen}>查看档案<ChevronRightIcon aria-hidden="true" /></button></header>
    <div className="collection-card-body"><img src={item.image} alt={item.imageAlt} /><div className="collection-card-copy"><div className="collection-name-row"><strong>{item.name}</strong><small><CheckCircledIcon aria-hidden="true" />{status}</small></div><dl><div><dt>{numberLabel}</dt><dd>{item.number}</dd></div>{visibleFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><span className="collection-seal" aria-hidden="true">香</span></div>
  </article>;
}
function CollectionShowcase({ flow, keyboard, onToast }: { flow: any; keyboard: ReturnType<typeof useKeyboard>; onToast: (message: string) => void }) {
  const openArchive = () => { prepareH5Transition(keyboard); flow.push(collectionArchiveScreen(keyboard)); };
  return <section className="home-collection" data-home-section="home-collection" aria-label="我的藏品"><Carousel className="collection-carousel" contentClassName="collection-carousel-content" ariaLabel="我的藏品轮播"><CollectionCard item={collectibles[0]} onToast={onToast} onOpen={openArchive} /></Carousel></section>;
}
function ArchiveCertificate({ item }: { item: Collectible }) {
  const toast = useTransientMessage();
  return <><div className="archive-actions"><CertificateDownloadLink item={item} onToast={toast.show} /></div><PrototypeToast message={toast.message} /></>;
}
const plantingIntroduction = "曙光农场沉香产业从2019年开始发展。依托得天独厚的自然地理条件和电白沉香产业的区域优势，农场抢抓机遇发展奇楠沉香，按照“生态化、标准化、国际化”的方向推进产业建设。目前沉香种植面积超过1万亩，种植株数超过44万株，其中建有2000亩高效种植示范基地。";
const plantingSections = [
  { title: "种质资源库建设", paragraphs: ["曙光农场与中国林业科学研究院热带林业研究所（热林所）深度合作，共同建成“优良易结香（奇楠）沉香高效培育技术研究示范基地”暨种质资源圃。", "目前共收集保存了98个沉香优良种质资源，为品种选育、改良和产业化开发奠定了坚实的物质基础。"] },
  { title: "技术规范标准化", paragraphs: ["在总结多年种植管理经验的基础上，农场于2024年编制并发布企业标准《奇楠沉香种植技术规范》（Q/GDNSGNC 001-2024）。", "该标准对园地选择、种苗质量、定植技术、水肥管理、树体修剪、病虫害绿色防控等环节作出了详细规定，实现了种植管理的标准化、流程化。"] },
  { title: "结香技术探索", paragraphs: ["在确保树木健康生长的前提下，农场积极试验多种结香技术。除传统人工打孔法外，正与华南农业大学等科研团队合作，试验“物理接菌法”等现代生物诱导技术，探索结香周期更短、结香品质更优、对树木伤害更小的可持续结香路径。"] },
];
const parkSections = [
  { title: "产业源头与种质资源", paragraphs: [plantingIntroduction, ...plantingSections[0].paragraphs] },
  ...plantingSections.slice(1),
  { title: "精深加工与应用研发", paragraphs: ["目前已建成25000多平方米的沉香深加工产业园，重点研发方向是沉香提取物在日化、药品等领域的应用，致力于把每一片叶子、每一块木头的价值都发挥到极致。"] },
  { title: "出口贸易与国际市场", paragraphs: ["企业已通过国家濒危物种进出口管理办公室严格审核，并依法取得出口许可，2025年至2026年带动外汇收入近千万元，展现广东农垦优质农产品的国际竞争力。"] },
  { title: "品牌建设与未来发展", paragraphs: ["曙光农场将持续贯彻落实广东农垦集团决策部署，深耕国际市场，强化品牌建设与渠道拓展，致力于将广垦沉香打造成具有国际影响力的品牌。"] },
];
const industryPhotos = {
  aerial: { src: "/assets/industry/shuguang-plantation-aerial.jpg", caption: "曙光农场沉香种植基地 · 航拍全景", width: 2275, height: 1279 },
  station: { src: "/assets/industry/forestry-service-station.jpg", caption: "园区林业服务站", width: 5280, height: 2970 },
  demonstration: { src: "/assets/industry/efficient-planting-base.jpg", caption: "广垦沉香高效种植示范基地", width: 2275, height: 1279 },
};
function IndustryPhoto({ photo, eager = false }: { photo: typeof industryPhotos.aerial; eager?: boolean }) {
  return <figure className="industry-photo"><img src={photo.src} alt={photo.caption} loading={eager ? "eager" : "lazy"} decoding="async" width={photo.width} height={photo.height} /><figcaption>{photo.caption}</figcaption></figure>;
}
function IndustrySections({ sections, plantingPhoto = false }: { sections: typeof plantingSections; plantingPhoto?: boolean }) {
  return <div className="farm-story-list industry-introduction">{sections.map((section, index) => <section key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3>{section.paragraphs.map((paragraph, paragraphIndex) => <div key={paragraph}><p>{paragraph}</p>{plantingPhoto && index === 0 && paragraphIndex === 0 ? <IndustryPhoto photo={industryPhotos.demonstration} /> : null}</div>)}</div></section>)}</div>;
}
const parkMetrics = [["1万", "余亩", "沉香种植面积"], ["44万", "余株", "沉香种植株数"], ["98", "个", "优良种质资源"], ["2.5万", "余㎡", "深加工产业园"]] as const;
function IndustryMetrics({ items }: { items: ReadonlyArray<readonly [string, string, string]> }) {
  return <dl className="industry-metrics">{items.map(([value, unit, label]) => <div key={label}><dt>{label}</dt><dd>{value}<span>{unit}</span></dd></div>)}</dl>;
}
const selectionItems = [
  { title: "手串收藏", description: "海南沉香 · 温润随身", background: "/assets/home-selection/bracelet-background-v2.png" },
  { title: "香道礼盒", description: "雅集赠礼 · 一盒成礼", background: "/assets/home-selection/gift-background-v2.png" },
  { title: "企业定制", description: "专属定制 · 国企礼赠", background: "/assets/home-selection/custom-background-v2.png" },
  { title: "沉香树认种", description: "一树一档 · 见证生长", background: "/assets/home-selection/tree-background-v2.png" },
] as const;
function IndustrialPark() {
  return <MobileScroll className="app-screen"><main className="screen-content detail-content industrial-park industry-editorial" data-product-doc-page="industrial-park">
    <header className="industry-heading"><p className="page-eyebrow">广东电白 · 曙光农场</p><h2>广垦沉香<br /><em>源头产业园</em></h2><p className="industry-deck">从良种选育到精深加工，<br />走进广垦沉香全产业链。</p></header>
    <IndustryPhoto photo={industryPhotos.aerial} eager />
    <IndustryMetrics items={parkMetrics} />
    <p className="lead">曙光农场立足电白区沉香产业的区域优势，聚焦沉香全产业链建设，统筹推进良种选育、标准化种植、精深加工、品牌培育及线上线下销售，逐步构建“科技支撑、品牌赋能、贸易驱动”的现代沉香产业体系。</p>
    <IndustryPhoto photo={industryPhotos.station} />
    <section className="industry-chain" aria-label="沉香全产业链"><h3>全产业链布局</h3><ol>{["良种选育", "标准化种植", "精深加工", "品牌培育", "线上线下销售"].map(label => <li key={label}>{label}</li>)}</ol></section>
    <IndustrySections sections={parkSections} plantingPhoto />
    <p className="industry-signature">广东农垦曙光农场有限公司 · 广垦沉香</p>
  </main></MobileScroll>;
}
const industrialParkScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "industrial-park", header: flow => <TopBar title="广垦沉香·源头产业园" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <IndustrialPark /> });

function Home({ flow, keyboard }: { flow: any; keyboard: ReturnType<typeof useKeyboard> }) {
  const { authorized, authorize } = useAuthorization();
  const { device } = useMobileDevice();
  const [authorizationOpen, setAuthorizationOpen] = useState(false);
  const [homeScrolled, setHomeScrolled] = useState(false);
  const toast = useTransientMessage();
  const mall = () => toast.show("商城即将上线，敬请期待");
  useEffect(() => {
    const current = document.querySelector<HTMLElement>('[data-testid="flow-current"]');
    if (current) current.dataset.flowScreen = "home";
    const scroll = current?.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
    if (!scroll) return;
    const updateScrolled = () => setHomeScrolled(scroll.scrollTop > 8);
    updateScrolled();
    scroll.addEventListener("scroll", updateScrolled, { passive: true });
    return () => scroll.removeEventListener("scroll", updateScrolled);
  }, []);
  const enterReading = () => { prepareH5Transition(keyboard); flow.push(interpretScreen(keyboard)); };
  const openReading = () => {
    prepareH5Transition(keyboard);
    if (authorized) enterReading();
    else setAuthorizationOpen(true);
  };
  const authorizeAndEnter = () => {
    authorize();
    setAuthorizationOpen(false);
    enterReading();
  };
  const openProvenance = () => {
    prepareH5Transition(keyboard);
    flow.push(certificateScreen(keyboard));
  };
  const homeRootStyle = { "--home-top-safe": `${device.geometry.safeArea.top}px` } as CSSProperties;
  return <div className={`mini-root-screen home-root-screen${homeScrolled ? " is-scrolled" : ""}`} data-product-doc-page="home" style={homeRootStyle}>
    <MobileScroll className="app-screen mini-root-scroll"><main className="mini-home">
      <div className="mini-home-body">
        <BraceletHero onOpen={openProvenance} />
        <section className="question-section home-reading-card" data-home-section="home-reading">
          <p className="home-ai-tag"><MagicWandIcon aria-hidden="true" /><span>AI 传统文化解读</span></p>
          <h2>以香静心，聊聊心中挂心事</h2>
          <span>借沉香感悟心绪，AI香道文化解读</span>
          <button data-testid="home-reading-action" className="start-reading" aria-label="开始问帖" onClick={openReading}><span>开始问帖</span></button>
        </section>
        <section className="home-selection" data-home-section="home-selection">
          <div className="selection-heading">
            <span><h3>广垦沉香甄选</h3><small>从日常佩戴到香事雅集</small></span>
            <button type="button" aria-label="即将上线" onClick={mall}><span>即将上线</span><ChevronRightIcon aria-hidden="true" /></button>
          </div>
          <div className="selection-grid">
            {selectionItems.map(item => <button className="selection-item" type="button" key={item.title} onClick={mall}>
              <img className="selection-item-background" src={item.background} alt="" />
              <span className="selection-item-heading"><strong>{item.title}</strong></span>
              <small className="selection-item-description">{item.description}</small>
            </button>)}
          </div>
        </section>
        <CollectionShowcase flow={flow} keyboard={keyboard} onToast={toast.show} />
        <section className="service-section home-feature-card" data-home-section="home-services" aria-label="手串服务">
  <HomeServiceLink icon={<FileCheck />} title="证书查询" testId="home-certificate-link" ariaLabel="查看证书查询" onClick={openProvenance} />
          <HomeServiceLink icon={<Link2Icon />} title="佩戴养护" onClick={() => { prepareH5Transition(keyboard); flow.push(careScreen(keyboard)); }} />
          <HomeServiceLink icon={<ShieldCheck />} title="防伪溯源" testId="home-provenance-link" onClick={() => { prepareH5Transition(keyboard); flow.push(provenanceScreen(keyboard)); }} />
          <HomeServiceLink icon={<Sprout />} title="认种沉香树" onClick={() => { prepareH5Transition(keyboard); toast.show("正在打开认种沉香小程序…"); }} />
        </section>
        <section className="home-park home-park-banner" data-home-section="home-park">
          <div className="home-park-copy">
            <h3>广垦沉香 · 源头产业园</h3>
            <p><span>广东电白曙光农场｜万亩种植基地</span><span>良种选育 · 标准化种植 · 精深加工</span></p>
            <button onClick={() => { prepareH5Transition(keyboard); flow.push(industrialParkScreen(keyboard)); }}>走进产业园<ChevronRightIcon aria-hidden="true" /></button>
          </div>
        </section>
        <section className="home-knowledge" data-home-section="home-knowledge">
          <div className="home-knowledge-header"><h3>沉香小知识</h3><button className="home-knowledge-more" aria-label="查看更多知识文章" onClick={() => { prepareH5Transition(keyboard); flow.push(knowledgeScreen(keyboard)); }}>查看更多</button></div>
          <button className="home-knowledge-row" aria-label="如何快速辨别沉香手串的真假？" onClick={() => { prepareH5Transition(keyboard); flow.push(knowledgeArticleScreen(keyboard, knowledgeArticles.authenticity)); }}><img src="/assets/customer-feedback/collection-bracelet-thumbnail.png" alt="" /><span><strong>如何快速辨别沉香手串的真假？</strong><small>从香味、油脂线、密度等方面教你简单判断</small></span></button>
          <button className="home-knowledge-row" aria-label="沉香手串如何日常保养？" onClick={() => { prepareH5Transition(keyboard); flow.push(knowledgeArticleScreen(keyboard, knowledgeArticles.care)); }}><img src="/assets/customer-feedback/knowledge-care-tea.png" alt="" /><span><strong>沉香手串如何日常保养？</strong><small>避免高温、定期清洁、正确盘玩，让手串更温润</small></span></button>
        </section>
        <footer className="home-copyright" data-home-section="home-copyright">广东农垦曙光农场有限公司 © 广垦沉香</footer>
      </div>
    </main></MobileScroll>
    <MiniProgramNav root />
    <MiniTabs active="home" onHome={() => undefined} onMall={mall} onAsk={openReading} onProfile={() => { prepareH5Transition(keyboard); flow.replace(profileScreen(keyboard)); }} />
    <PrototypeToast message={toast.message} />
    <AuthorizationSheet open={authorizationOpen} onOpenChange={setAuthorizationOpen} onAuthorize={authorizeAndEnter} />
  </div>;
}

function Profile({ flow, keyboard }: { flow: any; keyboard: ReturnType<typeof useKeyboard> }) {
  const { authorized, authorize } = useAuthorization();
  const { device } = useMobileDevice();
  const [authorizationOpen, setAuthorizationOpen] = useState(false);
  const [accountAuthOpen, setAccountAuthOpen] = useState(false);
  const enterReading = () => { prepareH5Transition(keyboard); flow.push(interpretScreen(keyboard)); };
  const [recordsAuth, setRecordsAuth] = useState(false);
  const toast = useTransientMessage();
  const openReading = () => {
    prepareH5Transition(keyboard);
    if (authorized) enterReading();
    else setAuthorizationOpen(true);
  };
  const openRecords = () => { prepareH5Transition(keyboard); if (authorized) flow.push(readingRecordsScreen(keyboard)); else setRecordsAuth(true); };
  const authorizeAndEnter = () => {
    authorize();
    setAuthorizationOpen(false);
    enterReading();
  };
  const profileRootStyle = { "--profile-top-safe": `${device.geometry.safeArea.top}px` } as CSSProperties;
  return <div className="mini-root-screen profile-root-screen" data-product-doc-page="profile" style={profileRootStyle}>
    <MobileScroll className="app-screen mini-root-scroll"><main className="mini-profile">
      <div className="mini-profile-body">
        <section className={`profile-account-banner${authorized ? " authorized" : ""}`} aria-label="微信账号授权">
          <img className="profile-account-banner-image" src="/assets/profile/profile-account-banner.png" alt="" />
          <div className="profile-account-content">
            <span className="profile-account-avatar"><PersonIcon /></span>
            {authorized ? <>
              <div className="profile-account-copy"><strong>微信用户</strong><small><CheckCircledIcon />已完成微信授权</small></div>
              <span className="profile-account-status">已登录</span>
            </> : <>
              <div className="profile-account-copy"><strong>微信账号</strong><small>授权后同步香事记录</small></div>
              <button onClick={() => { prepareH5Transition(keyboard); setAccountAuthOpen(true); }}>微信授权登录</button>
            </>}
          </div>
          <div className="profile-banner-actions" aria-label="香事数据">
            <button aria-label="问帖记录" onClick={openRecords}><strong>1 条</strong><small>问帖记录</small></button>
            <button aria-label="本串证书" onClick={() => { prepareH5Transition(keyboard); flow.push(certificateListScreen(keyboard)); }}><strong>3 串</strong><small>证书数量</small></button>
          </div>
        </section>
        <section className="profile-action-list" aria-label="我的功能">
          <button className="profile-action-row profile-action-row--help" aria-label="芯片识别说明" onClick={() => { prepareH5Transition(keyboard); flow.push(chipHelpScreen(keyboard)); }}>
            <span className="profile-action-icon"><Link2Icon /></span>
            <span className="profile-action-copy"><strong>芯片识别说明</strong></span>
            <ChevronRightIcon />
          </button>
        </section>
      </div>
    </main></MobileScroll>
    <MiniProgramNav title="我的" root />
    <MiniTabs active="profile" onHome={() => { prepareH5Transition(keyboard); flow.replace(homeScreen(keyboard)); }} onMall={() => toast.show("商城即将上线，敬请期待")} onAsk={openReading} onProfile={() => undefined} />
    <PrototypeToast message={toast.message} />
    <AuthorizationSheet open={accountAuthOpen} onOpenChange={setAccountAuthOpen} title="微信授权登录" buttonLabel="确认微信授权" description="用于同步你的香事档案" message="授权后，可同步问帖记录与已识别证书。" onAuthorize={() => { authorize(); setAccountAuthOpen(false); }} />
    <AuthorizationSheet open={authorizationOpen} onOpenChange={setAuthorizationOpen} onAuthorize={authorizeAndEnter} />
    <AuthorizationSheet open={recordsAuth} onOpenChange={setRecordsAuth} title="登录后查看记录" buttonLabel="微信授权并继续" onAuthorize={() => { authorize(); setRecordsAuth(false); flow.push(readingRecordsScreen(keyboard)); }} />
  </div>;
}

type AgentMessage = { id: number; role: "agent" | "user"; text: string };

const starterPrompts = [
  { label: "事业", prompt: "近期是否适合推进新的合作？" },
  { label: "感情", prompt: "这段关系接下来会怎样？" },
  { label: "财运", prompt: "今年的财运需要注意什么？" },
];
const firstMessage: AgentMessage = { id: 1, role: "agent", text: "我是你的 AI 问事助手。先说说最近最挂心的事，我会再问两三句，然后给你一个传统文化角度的参考。" };

function simulatedReply(userTurn: number): Omit<AgentMessage, "id" | "role"> {
  if (userTurn === 0) return { text: "我听明白了。为了把这件事问得更准，我想再确认三点：\n1. 这件事大概持续多久了？\n2. 你更担心“时机不对”，还是“合作对象不可靠”？\n3. 你最想守住的结果是什么？" };
  if (userTurn === 1) return { text: "判断：这件事可以继续推进，但不宜一次押得太重。\n\n提醒：真正需要观察的不是对方此刻的表态，而是能否持续兑现小承诺。\n\n建议：先约定一个七天内可完成的小目标，同时写清双方投入和退出边界。" };
  return { text: "继续看这件事，眼下最有价值的不是等一个确定答案，而是设计一次低成本验证。你还可以接着问我时机、对象或下一步行动。" };
}

function renderAgentText(text: string) {
  return text.split(/\n\n/).map((part, index) => {
    const match = part.match(/^(判断|提醒|建议)：(.*)$/s);
    return match ? <p key={index}><strong className="fortune-answer-label">{match[1]}：</strong>{match[2]}</p> : <p key={index}>{part}</p>;
  });
}

const historicalMessages: AgentMessage[] = [
  { id: 1, role: "agent", text: firstMessage.text },
  { id: 2, role: "user", text: "近期是否适合推进新的合作？" },
  { id: 3, role: "agent", text: "我听明白了。为了把这件事问得更准，我想再确认：你现在更担心“时机不对”，还是“合作对象不可靠”？" },
  { id: 4, role: "user", text: "我更担心合作对象是否可靠。" },
  { id: 5, role: "agent", text: "判断：这件事可以继续推进，但不宜一次押得太重。\n\n提醒：真正需要观察的不是对方此刻的表态，而是能否持续兑现小承诺。\n\n建议：先约定一个七天内可完成的小目标，同时写清双方投入和退出边界。" },
];

function FortuneAgent({ keyboard }: { keyboard: ReturnType<typeof useKeyboard> }) {
  const { bottomInset } = useKeyboardInsets();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sequenceRef = useRef(1);
  const shellRef = useRef<HTMLDivElement>(null);
  const userTurns = messages.filter(message => message.role === "user").length;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);
  useEffect(() => {
    const scroll = shellRef.current?.querySelector<HTMLElement>(".mobile-scroll");
    const latest = shellRef.current?.querySelector<HTMLElement>('[data-last="true"]');
    if (!scroll || !latest || (userTurns === 0 && !thinking)) return;
    window.requestAnimationFrame(() => scroll.scrollTo({ top: Math.max(0, latest.offsetTop - 16), behavior: "smooth" }));
  }, [messages, thinking, userTurns]);

  const send = (suggested?: string) => {
    const value = (suggested ?? draft).trim();
    if (!value || thinking) return;
    const turn = messages.filter(message => message.role === "user").length;
    setMessages(current => [...current, { id: sequenceRef.current++, role: "user", text: value }]);
    setDraft("");
    prepareH5Transition(keyboard);
    setThinking(true);
    timerRef.current = window.setTimeout(() => {
      setMessages(current => [...current, { id: sequenceRef.current++, role: "agent", ...simulatedReply(turn) }]);
      setThinking(false);
    }, 720);
  };

  const isNewConversation = messages.length === 0 && !thinking;

  const composerStyle = { "--agent-composer-bottom": `${bottomInset}px` } as CSSProperties;
  return <div className="reading-shell" data-product-doc-page="interpret" ref={shellRef} style={composerStyle}>
    <MobileScroll className="app-screen reading-scroll"><main className="reading-page" aria-label="AI问事对话">
      {isNewConversation ? <section className="reading-empty" data-testid="reading-empty-state"><img className="reading-empty-logo" src="/assets/home-reference/guangken-chenxiang-logo.png" alt="广垦沉香" /><h2>今天想问什么？</h2><p>先说说最近最挂心的事，我会再问两三句。</p><nav className="reading-prompts" aria-label="常见问题">{starterPrompts.map(item => <button type="button" key={item.label} onClick={() => send(item.prompt)}>{item.label}</button>)}</nav></section> : <div className="reading-log" role="log" aria-live="polite">
        {messages.map((message, index) => <article className={`fortune-message ${message.role}`} data-last={index === messages.length - 1 && !thinking ? "true" : undefined} key={message.id}>
          <div className="fortune-bubble">{message.role === "agent" ? renderAgentText(message.text) : <p>{message.text}</p>}</div>
        </article>)}
        {thinking ? <article className="fortune-message agent thinking" data-last="true"><div className="fortune-bubble reading-thinking" aria-label="AI正在思考"><span>正在推演…</span><i /><i /><i /></div></article> : null}
      </div>}
    </main></MobileScroll>
    <div className="reading-composer">
      <p className="reading-disclaimer">内容由 AI 生成，仅供娱乐参考</p>
      <div className="reading-input-shell">
        <KeyboardTextarea aria-label="向 AI 问事助手提问" value={draft} disabled={thinking} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={thinking ? "正在推演，请稍候…" : "给 AI 问事发消息"} rows={1} maxLength={160} />
        <button className="reading-send" type="button" aria-label="发送" disabled={thinking || !draft.trim()} onClick={() => send()}><ArrowUpIcon aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}

const collectionArchiveScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "collection-archive", header: flow => <TopBar title="手串档案" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content detail-content collection-archive" data-product-doc-page="collection-archive"><p className="page-eyebrow">我的藏品 · 已认证</p><img className="archive-hero" src={product} alt="海南琼南沉香手串" /><h2>海南琼南沉香手串档案</h2><p className="archive-number">CX-2018-072</p><div className="archive-meta">{collectibles[0].facts.map(([label,value]) => <span key={label}>{label}<strong>{value}</strong></span>)}</div><ArchiveCertificate item={collectibles[0]} /></main></MobileScroll>,
});
const certificateListScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "certificate-list", header: flow => <TopBar title="我的手串" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: flow => <MobileScroll className="app-screen"><main className="screen-content detail-content certificate-list" data-product-doc-page="certificate-list"><div className="certificate-list-rows">{certificateRecords.map(record => <button className="certificate-list-row" key={record.key} onClick={() => { prepareH5Transition(keyboard); flow.push(certificateScreen(keyboard, record)); }}><img src={record.image} alt="" /><span><strong>{record.name}</strong><small>{record.certificate ? `${record.certificate.certificateNumber} · ${record.certificate.weight} · 原件已收录` : `${record.spec} · 原件待补充`}</small></span><ChevronRightIcon /></button>)}</div></main></MobileScroll>
});
function CertificateDetail({ record }: { record: CertificateRecord }) {
  const [viewerOpen, setViewerOpen] = useState(false); const [zoomed, setZoomed] = useState(false); const [imageFailed, setImageFailed] = useState(false);
  const { screenRef } = useScreenPortal();
  useEffect(() => { if (!viewerOpen) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewerOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [viewerOpen]);
  const cert = record.certificate;
  if (!cert) return <MobileScroll className="app-screen"><main className="screen-content detail-content material-certificate-detail" data-product-doc-page="certificate"><p className="page-eyebrow">{record.name} · {record.spec}</p><div className="certificate-empty"><strong>证书原件待补充</strong><p>该手串暂未收录材质检验证原件。</p></div></main></MobileScroll>;
  const fields = [["样品名称", cert.sampleName], ["证书编号", cert.certificateNumber], ["样品重量", cert.weight], ["检验结论", cert.conclusion], ["科属名称", cert.taxonomy], ["备注", cert.note], ["放大检查", cert.inspection], ["执行标准", cert.standard], ["查询码", cert.queryCode]];
  const viewer = viewerOpen && screenRef.current ? createPortal(<div className="certificate-viewer" role="dialog" aria-modal="true" aria-label="证书原件查看"><button type="button" className="certificate-viewer-close" aria-label="关闭证书原件" onClick={() => setViewerOpen(false)}>关闭</button><button type="button" className={`certificate-viewer-image${zoomed ? " is-zoomed" : ""}`} aria-label={zoomed ? "还原证书原件" : "放大证书原件"} data-zoomed={zoomed} onClick={() => setZoomed(value => !value)}><img src={cert.image} alt="材质检验证证书原件" /></button></div>, screenRef.current) : null;
  return <><MobileScroll className="app-screen"><main className="screen-content detail-content material-certificate-detail" data-product-doc-page="certificate"><p className="page-eyebrow">证书原件已收录</p><h2>{cert.sampleName}</h2><p className="certificate-number">{cert.certificateNumber}</p><div className="certificate-original">{imageFailed ? <div className="certificate-image-fallback">证书原件暂时无法加载</div> : <button type="button" aria-label="查看证书原件" onClick={() => { setViewerOpen(true); setZoomed(false); }}><img src={cert.image} alt="材质检验证证书原件" onError={() => setImageFailed(true)} /></button>}</div><dl className="certificate-fields">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></main></MobileScroll>{viewer}</>;
}
const certificateScreen = (keyboard: ReturnType<typeof useKeyboard>, record: CertificateRecord = certificateRecords[0]): FlowScreen => ({
  id: "certificate",
  header: flow => <TopBar title="证书详情" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <CertificateDetail record={record} />,
});
const provenanceScreen = (keyboard: ReturnType<typeof useKeyboard>, record: CertificateRecord = certificateRecords[0]): FlowScreen => ({
  id: "provenance",
  header: flow => <TopBar title="防伪溯源" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content detail-content provenance-detail" data-product-doc-page="provenance">
    <p className="page-eyebrow">广垦沉香 · 从种苗到手串</p><h2>一串沉香的来处</h2>
    <p className="provenance-product-name">{record.name}</p>
    {record.key === "cx-2018-072" ? <>
      <div className="provenance-passport"><ShieldCheck aria-hidden="true" /><div><span>手串唯一编号 · 防拆换标签</span><strong>GKCX-20260915</strong></div></div>
      <div className="provenance-overview"><span>种植地块<strong>担杆岭</strong></span><span>成品规格<strong>16mm / 14 颗</strong></span><span>出厂日期<strong>2026.09.10</strong></span></div>
      <section className="provenance-journey" aria-label="本串六站溯源记录">{provenanceStages.map((stage, index) => <article className="provenance-stage" key={stage.title}>
        <header className="provenance-stage-heading"><span className="provenance-stage-number">{String(index + 1).padStart(2, "0")}</span><div><p>第 {index + 1} 站 · {stage.label}</p><h3>{stage.title}</h3></div><time>{stage.date}</time></header>
        <p className="provenance-stage-body">{stage.body}</p>
        {stage.photos.length > 0 && <Carousel className="provenance-photos" contentClassName="provenance-photo-track" ariaLabel={`${stage.title}现场照片`}>{stage.photos.map(([file, caption]) => <figure key={file}><img src={`/assets/provenance/${file}`} alt={caption} loading="lazy" /><figcaption>{caption}</figcaption></figure>)}</Carousel>}
        <section className="provenance-stage-data" aria-label="详细数据"><h4>详细数据</h4><dl className="certificate-fields">{stage.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      </article>)}</section>
    </> : <div className="certificate-empty"><strong>本串溯源信息待补充</strong><p>手串编号：{record.key.toUpperCase()}</p><p>尚未收录这串手串的种苗、种植、造香、采收、淳化与成串记录。</p></div>}
  </main></MobileScroll>,
});
const readingRecordsScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "reading-records", header: flow => <TopBar title="问帖记录" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content detail-content" data-product-doc-page="reading-records"><p className="page-eyebrow">我的香事</p><h2>每一次问帖，<br /><em>都可以继续。</em></h2><button className="reading-record-row" onClick={() => { prepareH5Transition(keyboard); flow.push(readingRecordDetailScreen(keyboard)); }}><span><strong>新的合作是否适合推进？</strong><small>三天前</small></span><p>先用七天小目标验证合作可靠性。</p><ChevronRightIcon /></button></main></MobileScroll> });
const readingRecordDetailScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "reading-record-detail", header: flow => <TopBar title="问帖详情" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content detail-content history-detail-content" data-product-doc-page="reading-record-detail"><p className="page-eyebrow">三天前 · 合作</p><h2>新的合作是否适合推进？</h2><div className="reading-log history-transcript" aria-label="历史问帖对话">{historicalMessages.map(message => <article className={`fortune-message ${message.role}`} key={message.id}><div className="fortune-bubble">{message.role === "agent" ? renderAgentText(message.text) : <p>{message.text}</p>}</div></article>)}</div><button className="primary-action" onClick={() => { prepareH5Transition(keyboard); flow.push(interpretScreen(keyboard)); }}>开启新问帖</button></main></MobileScroll> });
const chipHelpScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "chip-help", header: flow => <TopBar title="芯片识别说明" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <MobileScroll className="app-screen"><main className="screen-content article-content" data-product-doc-page="chip-help"><p className="page-eyebrow">使用帮助</p><h2>轻触 NFC，<br /><em>识别你的手串。</em></h2><p className="lead">将手机靠近手串芯片，即可打开对应的数字身份与证书信息。</p><div className="help-steps">{[["01", "轻触手串芯片", "将手机 NFC 感应区贴近手串芯片。"], ["02", "识别成功后进入手串首页", "首页会展示本串身份、证书与问帖入口。"], ["03", "识别失败时重新贴近", "保持手机稳定，调整位置后再试一次。"]].map(([number, title, text]) => <section key={title}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></section>)}</div><p className="help-note">芯片不会直接开始问帖，只用于识别对应手串。</p></main></MobileScroll> });
const knowledgeArticles = {
  authenticity: { title: "如何快速辨别沉香手串的真假", date: "2026年8月31日", hero: "/assets/customer-feedback/knowledge-authenticity.svg", lead: "选购沉香手串，先从自然纹理与香气层次入手，再结合密度和来源信息综合判断。", sections: [["先闻香味", "真沉香香气清甜自然，层次会随温度与时间变化。", "香气是沉香最直接的感受。闻香时不急于下结论，留意木质、清甜与熟韵是否自然衔接。"], ["再看油脂线", "观察纹理与油脂分布，天然形成通常不规则。", "自然生长留下的油脂线有变化和呼吸感，不会呈现过度整齐、重复的纹样。"], ["结合密度与来源", "结合重量、纹理和触感综合判断，不以单一指标下结论。", "优先选择来源清晰、信息可核验的产品，并把证书与实物信息放在一起核对。"]], note: "以上仅为感官初筛，当前产品以官方身份与溯源信息为准。" },
  care: { title: "沉香手串如何日常保养", date: "2026年8月31日", hero: "/assets/customer-feedback/knowledge-care-tea.png", lead: "沉香会吸收环境中的气味与水分，简单而稳定的日常习惯，能让香气更纯净、陪伴更长久。", sections: [["避开水汽与油烟", "洗澡、洗手、喷香水或涂抹护肤品时，建议先摘下手串。", "沉香遇水后容易出现发白迹象，也容易吸附厨房油烟与其他强烈气味。"], ["远离高温暴晒", "不要长时间放在暖气旁或阳光下静置。", "高温会加速油脂挥发，紫外线也可能影响天然木质结构。"], ["单独存放与轻柔清洁", "不佩戴时使用密封袋或密封罐单独存放，沾染污渍可用软布轻擦。", "清洁后自然阴干，避免用力摩擦或使用化学清洁剂。"]], note: "沉香为天然材质，细心养护是与它相伴的日常仪式。" }
} as const;
const knowledgeArticleScreen = (keyboard: ReturnType<typeof useKeyboard>, article: typeof knowledgeArticles[keyof typeof knowledgeArticles]): FlowScreen => ({ id: "knowledge-article", header: flow => <TopBar title="沉香小知识" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <MobileScroll className="app-screen"><main className="wechat-article" data-product-doc-page="knowledge-article"><article><img className="wechat-article-hero" src={article.hero} alt="" /><h1>{article.title}</h1><div className="wechat-article-meta"><strong>广垦沉香</strong><span>{article.date}</span><em>原创</em></div><p className="wechat-article-lead">{article.lead}</p>{article.sections.map(([heading, summary, body]) => <section key={heading}><h2>{heading}</h2><p>{summary}</p><p>{body}</p></section>)}<p className="wechat-article-note">{article.note}</p></article></main></MobileScroll> });
const interpretScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "interpret", header: flow => <TopBar title="AI问事" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <FortuneAgent keyboard={keyboard} /> });
const careGuidelines = [
  { title: "远离化学品", body: "避免接触洗涤剂、酒精、香水、花露水等化学品，会腐蚀表面，导致香味变淡。" },
  { title: "避水与护肤品", body: "避免接触水，洗澡、洗手、喷香水、涂抹护肤品时应摘下。沉香手串遇水后期容易出现发白迹象，并且部分人的汗水也会造成手串发白的现象。" },
  { title: "避高温与油烟", body: "避免高温暴晒：高温会使油脂挥发，损伤沉香。不能长时间放在暖气旁或者阳光下静置（紫外线会破坏内部结构）。" },
  { title: "密封独立存放", body: "妥善存放：不佩戴时，用密封袋或密封罐单独存放，防止串味，也能保持其香气。" },
  { title: "香味减淡后的恢复", body: "若出现包浆：用干净毛巾湿一点温矿泉水／纯净水轻擦，然后阴干，并放到养香瓶度过凝香期（一周以上，放入同产地同品种的柑橘沉香碎料效果佳）。" },
  { title: "轻柔清洁", body: "清洁：若沾染污渍，用稍湿润的软布轻轻擦拭干净，然后自然阴干。" },
  { title: "日常盘护", body: "保养：日常可用棉手套或丝袜揉搓几分钟，后放养香瓶保养，建议放沉水片珠做养珠伴侣效果更佳。" },
] as const;
const careScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "care", header: flow => <TopBar title="佩戴养护" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content article-content care-editorial-page" data-product-doc-page="care">
    <section className="care-editorial-hero"><div className="care-editorial-copy"><p className="page-eyebrow">广垦沉香 · 日常养护</p><h2>七件小事，<br /><em>让香气陪你更久</em></h2><p className="lead">沉香会吸收环境中的气味与水分，日常养护能让香气更纯净、陪伴更长久。</p></div><img className="care-editorial-hero-image" src="/assets/home-reference/care-editorial-hero-v3.png" alt="沉香手串日常养护" /></section>
    <div className="care-guide-list">{careGuidelines.map((item, index) => <section className="care-guide-row" key={item.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></section>)}</div>
    <aside className="care-reminder"><strong>养护提醒</strong><p>沉香为天然材质，长期佩戴与细心养护，香气会愈发温润雅致。正确养护，亦是与沉香相伴的美好仪式。</p></aside>
  </main></MobileScroll>,
});
const knowledgeScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "knowledge", header: flow => <TopBar title="沉香知识" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content article-content" data-product-doc-page="knowledge"><p className="page-eyebrow">认识沉香</p><h2>从产区开始，<br /><em>认识一块沉香。</em></h2><p className="lead">沉香不是树木本身，而是树体在特定环境下形成的香脂与木质的结合体。</p><div className="knowledge-topic-row"><span>01</span><div><strong>沉香如何形成</strong><p>树体受伤后形成香脂，经过时间与环境共同变化。</p></div></div><div className="knowledge-topic-row"><span>02</span><div><strong>怎样闻香</strong><p>先闻整体，再观察清甜、木质与熟韵的变化。</p></div></div><div className="knowledge-topic-row"><span>03</span><div><strong>常见产区差异</strong><p>不同产区的气候和土壤，会带来各具特色的香气层次。</p></div></div></main></MobileScroll> });

const homeScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "home", render: flow => <Home flow={flow} keyboard={keyboard} /> });
const profileScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "profile", render: flow => <Profile flow={flow} keyboard={keyboard} /> });

export default function Prototype() {
  const keyboard = useKeyboard();
  const [authorized, setAuthorized] = useState(false);
  return <AuthorizationContext.Provider value={{ authorized, authorize: () => setAuthorized(true) }}>
    <FlowStack initial={homeScreen(keyboard)} />
    <ProductDocumentReview />
  </AuthorizationContext.Provider>;
}
