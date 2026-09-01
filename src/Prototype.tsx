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
  SewingPinIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons";
import { BookOpen, FileCheck, FileText, Sprout } from "lucide-react";
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
  "farm-story": {
    label: "P-10 农垦故事", guideHeading: "DOC-P-10 农垦故事", specHeading: "P-10 农垦故事",
    flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-", "AC-ERROR-"],
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
  "adoption-archive": {
    label: "P-14 认种档案", guideHeading: "DOC-P-14 认种档案", specHeading: "P-14 认种档案",
    flowHeadings: ["FLOW-06 藏品档案与电子证书"], stateHeadings: [], requirementPrefixes: ["FR-COLLECTION-"],
    apiHeadings: [], acceptancePrefixes: ["AC-COLLECTION-", "AC-ERROR-"],
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
  home: { goal: "以广垦沉香品牌内容建立信任，并让用户进入问帖、藏品、证书、养护、知识、认种和产业园。", roles: "匿名用户和已授权用户", entry: "芯片识别成功；根导航首页；小程序常规入口", permission: "品牌、证书与内容匿名可读；问帖和个人记录需微信授权", rules: ["页面按品牌主视觉、AI 问帖、广垦甄选、我的藏品、四项服务、源头产业园、沉香小知识和版权顺序纵向滚动。", "首页证书服务直达当前手串；我的证书数量先进入手串列表。", "商城、甄选与认种交易入口本期只提示即将上线，不生成虚假商品和订单状态。"], fields: [["品牌主视觉", "图文 Banner", "首屏必显", "展示广垦沉香 Logo、海南琼南沉香手串与品牌画面"],["AI 问帖主入口", "按钮", "必显", "文案为开始问帖，每次进入新对话"],["广垦沉香甄选", "商品预告", "固定展示", "展示四项甄选内容，点击只提示即将上线"],["我的藏品", "横向列表", "有演示数据展示", "展示手串与认种树，可进档案或下载证书"],["服务入口", "四项宫格", "固定展示", "证书、佩戴养护、沉香知识、认种沉香树"],["源头产业园", "图文入口", "固定展示", "进入四图图集与模拟视频"],["沉香小知识", "文章列表", "两篇固定展示", "分别进入公众号式纯展示文章"],["公司版权", "页脚文本", "页面末尾展示", "展示运营主体，不承载操作"]], actions: [["开始问帖", "始终展示", "未授权打开登录确认层；已授权创建新对话", "记录入口来源和 pending_intent"],["查看证书查询", "当前手串有效", "直达当前手串证书详情", "记录 bracelet_id"],["查看藏品", "藏品存在", "进入对应手串档案或认种档案", "记录 collection_id"],["佩戴养护 / 沉香知识", "内容可用", "进入对应内容页", "匿名可用，记录 content_key"],["走进产业园", "固定展示", "进入产业园图集与视频页", "记录内容曝光与播放"]], boundary: "本页不建设交易闭环；AI 只作传统文化角度参考，不作鉴定、医疗、法律、财务或投资承诺。", states: "页面加载→分模块成功/失败；开始问帖→授权确认/新对话；商城入口→即将上线提示。", logs: "记录 scan_token、页面曝光、模块点击、下载结果和错误码；未授权时不记录个人身份。", empty: "单个模块失败不阻塞其他模块；无手串上下文时隐藏直达证书并提供重新识别。", acceptance: ["模块顺序与已确认首页一致，底部导航不遮挡版权。", "未授权点击问帖先进入微信授权确认，成功后恢复问帖意图。", "所有交易入口只展示统一的即将上线提示。"], tech: ["识别结果与 current_bracelet_id 必须绑定。", "模块接口独立降级，图片需有替代文本和缓存策略。"] },
  "authorization-sheet": { goal: "解释微信授权用途并在确认后恢复用户刚才的操作。", roles: "首次发起问帖的消费者", entry: "点击开始问帖；点击我的中的授权登录", permission: "未授权用户可见", rules: ["授权说明必须先于微信授权动作展示。", "取消不丢失原入口意图，再次点击可重新唤起。"], fields: [["授权说明", "说明文本", "必填展示", "仅说明头像、昵称和问帖记录用途"],["微信授权登录", "按钮", "必填展示", "唯一确认动作"],["取消", "按钮", "必填展示", "关闭弹层并返回原页面"]], actions: [["微信授权登录", "弹层打开", "唤起授权并恢复原意图", "记录授权结果"],["取消", "弹层打开", "关闭弹层", "记录取消事件"]], boundary: "不得暗示授权后获得超出实际范围的权益。", states: "打开→授权中→成功/失败；取消→关闭。", logs: "记录授权发起、成功、失败原因与恢复目标。", empty: "授权失败保留弹层并提供重试。", acceptance: ["授权后回到用户原本要去的页面。", "取消后页面状态不改变。"], tech: ["授权回调需幂等。", "意图参数需安全白名单化。"] },
  interpret: { goal: "用简洁的移动对话完成自由提问、必要追问和传统文化角度参考。", roles: "已授权消费者", entry: "首页开始问帖；根导航问帖；历史详情开启新问帖", permission: "微信授权后", rules: ["每次正常进入均创建新的对话，不自动带入上一段历史。", "默认展示广垦沉香 Logo、今天想问什么及事业/感情/财运三个快捷主题。", "仅支持文字输入和发送，不提供图片、文件、附件、相机、麦克风或语音。"], fields: [["新对话空态", "Logo＋引导", "无消息时展示", "展示今天想问什么、说明和三个快捷主题"],["对话消息", "消息列表", "有消息展示", "按时间顺序展示用户与 AI 内容"],["AI 回答", "结构化文本", "生成完成展示", "使用判断、提醒、建议三个层次"],["输入框", "文本框", "固定底部展示", "支持中文文本，避让键盘与手机安全区"],["发送", "按钮", "输入非空且非生成中可用", "发送后展示处理中状态"],["免责声明", "说明文本", "AI 内容中必显", "固定文案：内容由 AI 生成，仅供娱乐参考"]], actions: [["快捷主题", "新对话空态", "直接发送对应主题", "记录 starter_topic"],["发送", "输入非空", "创建消息并返回 AI 回复", "记录 conversation_id、message_id 与耗时"],["返回", "始终展示", "回到来源页面", "已产生消息的对话进入历史记录"]], boundary: "回答不得形成确定性预测、转运承诺或医疗、法律、财务等专业结论。", states: "新对话空态→用户发送→AI 追问/回答→继续追问；请求失败→保留用户消息并重试。", logs: "记录会话创建、消息发送、耗时、错误与安全拦截，不记录图片或音频数据。", empty: "新对话展示 Logo 与快捷主题；网络失败保留用户消息和输入草稿。", acceptance: ["每次进入均为无旧消息的新对话。", "发送后用户消息与 AI 回复顺序正确，回答包含判断、提醒和建议。", "输入框不贴手机边缘且键盘打开后仍可见。"], tech: ["消息接口需支持幂等、主动追问和流式/轮询扩展。", "输入输出必须经过安全策略并保存策略版本。"] },
  profile: { goal: "用重点明确的账号 Banner 集中承载授权状态、问帖记录、证书数量和芯片说明。", roles: "匿名用户和已授权消费者", entry: "根导航我的", permission: "访客可看授权入口；问帖记录和绑定手串需授权", rules: ["Banner 通铺至状态栏并左右贴边，头像、账号文案和授权状态保持同一横排。", "Banner 下半部只展示问帖记录与证书数量，数量在上、标题在下并支持整块点击。", "证书数量采用列表优先路径；Banner 下只保留芯片识别说明。"], fields: [["头像与账号", "身份区", "Banner 上部必显", "未授权展示微信账号，授权后展示微信用户"],["微信授权登录", "按钮/状态", "未授权展示按钮", "点击打开手机内授权确认层，授权后显示已登录"],["问帖记录", "统计入口", "固定展示", "原型显示 1 条，点击进入记录列表"],["证书数量", "统计入口", "固定展示", "原型显示 3 串，点击进入我的手串列表"],["芯片识别说明", "单行入口", "Banner 下唯一列表项", "进入 NFC 识别说明"]], actions: [["微信授权登录", "未授权", "打开授权确认层", "记录来源意图"],["问帖记录", "固定展示", "未授权先授权；已授权进入记录列表", "校验当前用户"],["证书数量", "固定展示", "进入我的手串列表", "生产环境校验绑定关系"],["芯片识别说明", "始终展示", "进入识别说明页", "匿名可用"]], boundary: "不重复展示记录、证书或传统文化解读帮助入口，不泄露其他用户数据。", states: "未授权→授权确认/取消；已授权→计数加载→数据/空态/失败。", logs: "记录授权、两个统计入口点击、手串列表加载与错误。", empty: "计数失败显示 --；无手串或无问帖显示 0，并在目标页给出明确空态。", acceptance: ["头像、账号和登录状态同一行，登录状态右对齐。", "问帖记录和证书数量均为数量在上、标题在下并可点击。", "Banner 下仅保留芯片识别说明。"], tech: ["统计数据与绑定关系按用户隔离。", "Banner 与状态栏安全区需适配 iPhone 和 Pixel。"] },
  "reading-records": { goal: "让用户查找已保存问帖并进入只读详情。", roles: "已授权消费者", entry: "我的→问帖记录", permission: "微信授权后", rules: ["列表按最近更新时间倒序。", "点击记录只进入历史详情，不直接继续旧对话。"], fields: [["问帖标题", "文本", "每条必显", "标题为空时使用首条用户消息摘要"],["相对时间", "时间文本", "每条必显", "依据 updated_at 生成"],["回答摘要", "文本", "有内容展示", "展示最近一条 AI 回答摘要"],["空态", "提示", "无记录展示", "引导开始新的问帖"]], actions: [["问帖记录项", "有记录", "进入只读问帖详情", "记录 conversation_id 并校验归属"],["开始新问帖", "空态展示", "创建全新对话", "记录来源为空态"]], boundary: "本页不提供删除、编辑或继续旧会话输入。", states: "加载→有记录/空态/失败；点击记录→只读详情。", logs: "记录列表查询、记录打开、分页和错误。", empty: "无记录时展示明确空态与开始新问帖入口；失败保留已加载数据并可重试。", acceptance: ["列表按最近更新时间稳定排序。", "点击记录进入只读详情，不直接进入新问帖。"], tech: ["生产列表使用 cursor 分页并按账号隔离。"] },
  "reading-record-detail": { goal: "完整呈现历史问帖上下文，并让用户从独立入口开启新问帖。", roles: "已授权消费者", entry: "问帖记录列表", permission: "仅记录所属用户", rules: ["历史消息只读，不展示输入框。", "开启新问帖必须创建新的 conversation_id，不续接当前历史。"], fields: [["问帖主题", "文本", "必显", "展示历史问题标题"],["消息时间线", "只读列表", "有记录展示", "保留问答顺序、角色与内容"],["AI 免责声明", "说明文本", "AI 内容必显", "内容由 AI 生成，仅供娱乐参考"],["开启新问帖", "按钮", "固定展示", "进入全新对话"]], actions: [["开启新问帖", "始终展示", "创建新会话并进入问帖空态", "记录来源 conversation_id，不复用该 ID"],["返回", "始终展示", "返回问帖记录列表", "保留列表位置"]], boundary: "历史内容只读，不代表当前专业结论，也不能在本页继续发送消息。", states: "加载→详情/不存在/越权；开启新问帖→全新对话。", logs: "记录详情查看、越权拦截和新问帖点击。", empty: "记录不存在或越权统一提示这条问帖记录已不存在，并返回列表。", acceptance: ["历史页不展示输入框。", "开启新问帖后进入无旧消息的新对话。"], tech: ["服务端校验 conversation_id 所属关系。", "不存在与越权使用统一外显错误。"] },
  certificate: { goal: "展示证书原件与结构化检验字段，并按手串独立绑定。", roles: "持有效扫描会话的匿名用户；拥有绑定关系的已授权用户", entry: "首页证书查询；我的→我的手串", permission: "公开扫描证书可读；绑定列表来源需校验账号归属", rules: ["仅展示证书原件和结构化检验字段，本期不建设溯源记录。", "首页使用 current_bracelet_id，列表使用 selected_bracelet_id，证书对象必须归属对应手串。", "缺少原件时显示待补充，不得复用其他手串证书。"], fields: [["证书原件", "图片", "有原件展示", "完整展示并支持适应宽度与 2× 查看"],["样品名称", "文本", "有证书展示", "与证书原件一致"],["证书编号", "文本", "有证书展示", "唯一证书标识"],["样品重量与检验结论", "文本", "有证书展示", "按证书原文展示"],["科属、备注与放大检查", "文本", "有证书展示", "按证书原文展示"],["执行标准与查询码", "文本", "有证书展示", "查询码本期只展示"]], actions: [["查看证书原件", "原件已收录", "打开手机内原图查看层", "点击切换适应宽度与 2×"],["关闭原件", "查看层打开", "返回证书详情", "支持按钮与 Esc"],["返回", "始终展示", "返回首页或我的手串", "保留来源上下文"]], boundary: "本期不建设溯源记录、证书查询接口、复制动作或二维码生成，也不把证书表述为功效、价格或投资价值承诺。", states: "详情→原件查看/图片失败；多手串→完整证书或原件待补充。", logs: "记录 bracelet_id、certificate_id、查看来源、原图查看和图片失败，不记录原件外的推断字段。", empty: "图片加载失败显示证书原件暂时无法加载，结构化字段仍可阅读；无原件显示证书原件待补充。", acceptance: ["证书原件完整可查看，并可在适应宽度与 2× 之间切换。", "无原件手串不复用其他手串证书。", "iPhone 与 Pixel 均无横向溢出或关键内容遮挡。"], tech: ["证书对象必须归属对应 bracelet_id。", "原图资源失败时必须独立降级，不影响字段展示。"] },
  care: { goal: "提供连续、易执行的佩戴和养护指南。", roles: "沉香手串消费者", entry: "首页佩戴养护", permission: "公开可读", rules: ["按七个步骤连续阅读。", "明确避化学品、避高温、密封收存等风险。"], fields: [["养护步骤", "长文列表", "必填展示", "标题、说明和注意事项"],["步骤序号", "序号", "必填展示", "保持阅读顺序"]], actions: [["返回", "始终展示", "返回来源页", "无业务记录"]], boundary: "仅为日常保养建议，不替代专业维修。", states: "加载→正文/失败。", logs: "记录内容曝光和阅读完成。", empty: "内容缺失展示重试。", acceptance: ["七步内容顺序正确且无截断。"], tech: ["正文支持版本化和缓存。"] },
  knowledge: { goal: "提供沉香基础知识，并承接农垦故事入口。", roles: "消费者、文化内容读者", entry: "首页沉香知识", permission: "公开可读", rules: ["知识入口展示摘要，详情使用文章页。", "删除传统文化解读独立入口，避免信息重复。"], fields: [["知识卡片", "入口卡", "必填展示", "标题、摘要、封面"],["农垦故事", "入口", "固定展示", "进入故事页"]], actions: [["知识卡片", "有内容", "进入文章详情", "记录 content_key"],["农垦故事", "始终展示", "进入故事页", "记录入口来源"]], boundary: "知识内容需标注来源和更新时间。", states: "加载→内容/空态/失败。", logs: "记录内容曝光、点击与版本。", empty: "无内容展示稍后再看。", acceptance: ["卡片点击后进入对应文章。"], tech: ["内容 key 与版本需稳定。"] },
  "farm-story": { goal: "讲清产区环境、农垦积淀与从林场到手串的过程。", roles: "品牌访客、消费者", entry: "沉香知识→农垦故事", permission: "公开可读", rules: ["按产区、育苗、加工、品控顺序组织内容。"], fields: [["故事正文", "长文", "必填展示", "图文讲述源头故事"],["内容更新时间", "文本", "有数据展示", "帮助判断内容时效"]], actions: [["返回", "始终展示", "返回知识页", "无业务记录"]], boundary: "品牌故事与事实信息分层呈现。", states: "加载→正文/失败。", logs: "记录文章曝光和阅读。", empty: "内容缺失展示重试。", acceptance: ["正文结构完整，图片有替代文本。"], tech: ["媒体资源需懒加载。"] },
  "chip-help": { goal: "说明 NFC 识别步骤，并为失败用户提供重试路径。", roles: "首次识别用户、售后人员", entry: "识别失败提示；首页识别说明", permission: "公开可读", rules: ["说明必须短、可操作，失败时优先给重试。", "芯片识别说明下不再放重复说明文字。"], fields: [["识别步骤", "步骤列表", "必填展示", "靠近、保持、等待"],["重新识别", "按钮", "识别失败展示", "重新发起 NFC 识别"]], actions: [["重新识别", "失败状态", "再次调用识别能力", "记录失败与重试次数"]], boundary: "无法识别不等于商品异常，需提供人工核验渠道。", states: "待识别→识别中→成功/失败。", logs: "记录设备能力、耗时、结果码和重试次数。", empty: "设备不支持 NFC 时提示兼容方案。", acceptance: ["用户能理解下一步并完成重试。"], tech: ["兼容 NFC 不可用与权限拒绝。"] },
  "certificate-list": { goal: "让多手串用户先选择手串，再查看所选手串的证书详情或原件待补充状态。", roles: "拥有绑定手串的已授权消费者", entry: "我的→证书数量", permission: "微信授权后，仅本人绑定数据", rules: ["导航标题下直接开始全宽列表，不显示眉题、大标题、数量说明或引导文案。", "点击任一手串整行进入该手串的证书详情。", "有证书显示编号、重量与原件已收录；无证书显示规格与原件待补充。"], fields: [["缩略图", "图片", "每行必显", "与 bracelet_id 对应"],["手串名称", "文本", "每行必显", "使用绑定记录名称"],["证书摘要", "状态文本", "每行必显", "按当前手串显示已收录或待补充，不跨手串复用"]], actions: [["手串列表项", "有绑定数据", "进入所选手串的证书详情", "记录 bracelet_id 并校验归属"],["返回", "始终展示", "回到我的", "保留列表位置"]], boundary: "只展示当前账号已绑定手串；不在详情内增加左右滑动或相邻证书切换。", states: "加载→手串列表/空态/失败；选择手串→证书详情/原件待补充。", logs: "记录列表查看、所选 bracelet_id 和加载错误。", empty: "无绑定手串时展示空态和芯片识别说明；单串无证书时显示原件待补充。", acceptance: ["原型恰好展示三条手串记录。", "点击第二、第三条后不得显示第一条证书数据。", "列表行触控高度不小于 76px。"], tech: ["列表接口需支持分页、绑定状态和账号隔离。", "证书详情必须使用所选 bracelet_id 查询。"] },
  "collection-archive": { goal: "展示首页藏品中的手串档案和可下载电子证书。", roles: "查看本人藏品的消费者", entry: "首页我的藏品→手串卡片", permission: "原型可直接查看；生产个人档案需授权并校验归属", rules: ["档案数据必须与首页藏品卡片一致。", "电子证书使用对应藏品文件名，下载失败不得离开页面。"], fields: [["手串图片", "图片", "必显", "与首页藏品图一致"],["名称与档案编号", "文本", "必显", "原型为海南琼南沉香手串 / CX-2018-072"],["材质与规格", "属性", "必显", "展示档案登记信息"],["档案状态", "状态", "必显", "已认证或异常"],["电子证书", "PDF 文件", "有证书展示", "文件名与藏品一致"]], actions: [["下载电子证书", "证书可用", "开始下载 PDF 并提示结果", "记录 collection_id、文件版本与结果"]], boundary: "档案和证书不构成功效、价格或投资价值承诺。", states: "加载→档案/失败；下载→准备中/成功/失败。", logs: "记录档案查看、证书版本和下载结果。", empty: "档案不存在时提示返回首页；下载失败保留页面并允许重试。", acceptance: ["档案数据与首页卡片一致。", "证书文件名、编号与当前藏品一致。"], tech: ["档案与证书关系由服务端校验。", "下载地址需短时有效并防越权。"] },
  "adoption-archive": { goal: "展示认种树档案、生长状态、成长时间线和认种证书。", roles: "查看本人认种档案的消费者", entry: "首页我的藏品→认种树；认种沉香树服务", permission: "原型可直接查看；生产个人档案需授权并校验归属", rules: ["生长状态按实际更新时间展示，缺数据不得编造。", "手串证书与认种证书使用不同模板和文件。"], fields: [["树名称与编号", "文本", "必显", "原型为琼南一号认种沉香树 / TR-2026-018"],["基地、树龄与日期", "属性", "必显", "展示认种登记信息"],["成长时间线", "时间线", "必显", "按认种、建档、巡检和回访顺序展示"],["认种证书", "PDF 文件", "有证书展示", "不得与手串证书互换"]], actions: [["下载认种证书", "证书可用", "开始下载 PDF 并提示结果", "记录 adoption_id、文件版本和结果"],["前往认种", "固定展示", "提示商城即将上线", "不创建商品或订单"]], boundary: "生长数据以实际记录为准，本期不建设在线认种交易。", states: "加载→档案/失败；下载→准备中/成功/失败；前往认种→即将上线提示。", logs: "记录档案曝光、证书下载和商城预告点击。", empty: "档案缺失提示返回首页；证书下载失败保留页面并可重试。", acceptance: ["时间线顺序正确。", "手串证书与认种证书文件不可互换。"], tech: ["时间序列数据按发生时间排序。", "下载地址需按账号和 adoption_id 鉴权。"] },
  "industrial-park": { goal: "用图集和视频介绍产区、育苗、加工与品控，增强源头信任。", roles: "品牌访客和消费者", entry: "首页走进产业园", permission: "公开可读", rules: ["原型固定使用四张图和模拟播放状态。", "生产环境只使用已审核素材和真实媒体，不将图集伪装为交易入口。"], fields: [["园区图集", "横向轮播", "四项必显", "万亩基地、标准化育苗、无尘加工、全链路品控"],["当前页码", "数字", "图集下方展示", "随当前图同步为 1/4 至 4/4"],["介绍视频", "媒体按钮", "固定展示", "显示播放/暂停状态与当前时长"],["园区说明", "文本", "必显", "展示国资国企、基地与全链路品控信息"]], actions: [["横向浏览图集", "图集可用", "切换当前图片并同步页码", "记录 slide_index"],["播放 / 暂停", "视频入口可用", "切换模拟播放状态", "记录播放状态与失败原因"],["返回", "始终展示", "返回首页", "无业务写操作"]], boundary: "产业园内容只作品牌与生产过程展示，事实和素材必须经品牌方审核。", states: "加载→图集可用/单图失败；视频待播放→播放中→暂停/失败。", logs: "记录图集曝光、页码切换、视频播放和媒体错误。", empty: "单张图片或视频失败不阻塞其他图文；全部内容失败时展示重试。", acceptance: ["图集固定四项且页码同步。", "视频播放和暂停状态可切换。"], tech: ["图片需懒加载和缓存。", "生产视频需评估流量、转码和降级策略。"] },
  "knowledge-article": { goal: "以接近微信公众号的长文结构展示沉香小知识，当前仅展示。", roles: "文化内容读者", entry: "沉香知识卡片", permission: "公开可读", rules: ["详情页只做展示，不提供点赞、评论、分享或交易操作。", "文章标题、来源、更新时间和正文完整呈现。"], fields: [["文章标题", "文本", "必填展示", "对应知识主题"],["文章正文", "富文本", "必填展示", "微信公众号式段落阅读"],["来源与时间", "元信息", "有数据展示", "标记内容来源和更新时间"]], actions: [["返回", "始终展示", "回到知识列表/来源页", "无业务记录"]], boundary: "文章是知识参考，不构成鉴定结论。", states: "加载→文章/失败。", logs: "记录文章曝光与阅读完成。", empty: "文章缺失展示重试。", acceptance: ["正文可滚动阅读且不出现空白页。"], tech: ["富文本需过滤危险标签，图片懒加载。"] },
};

function CurrentPagePrd({ pageKey }: { pageKey: ProductDocPageKey }) {
  const resolvedPageKey = pagePrdDefaults[pageKey] ? pageKey : "home";
  const config = productDocPages[resolvedPageKey];
  const data = pagePrdDefaults[resolvedPageKey];
  const updatedAt = resolvedPageKey === "certificate" || resolvedPageKey === "certificate-list" ? "2026-09-01" : "2026-08-31";
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
          <footer className="product-doc-review-footer"><span>琼南沉香 · 16 个产品上下文 · 当前：{productDocPages[activePageKey as ProductDocPageKey]?.label.replace(/^P-\d+\s*/, "") || "首页"}</span><button type="button" onClick={() => setOpen(false)}>关闭 PRD</button></footer>
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
      <span className="home-hero-title" role="heading" aria-level={1} aria-label="海南琼南沉香手串">海南琼南<br />沉香手串</span>
      <span className="home-hero-subtitle">清甜木香 · 海南沉香</span>
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

type Collectible = { id: "bracelet" | "tree"; name: string; number: string; image: string; imageAlt: string; facts: readonly [string, string][]; certificateHref: string; certificateFilename: string };
const collectibles: Collectible[] = [
  { id: "bracelet", name: "海南琼南沉香手串", number: "CX-2018-072", facts: [["材质", "海南沉香"], ["规格", "18mm · 16颗"], ["状态", "身份已核验"]], image: "/assets/customer-feedback/collection-bracelet-thumbnail.png", imageAlt: "海南琼南沉香手串", certificateHref: "/assets/certificates/bracelet-digital-certificate-demo.pdf", certificateFilename: "海南琼南沉香手串-电子证书-演示.pdf" },
  { id: "tree", name: "琼南一号认种沉香树", number: "TR-2026-018", facts: [["基地", "琼南沉香产业园"], ["树龄", "3年"], ["状态", "生长良好 · 已建档"]], image: "/assets/customer-feedback/collection-tree.svg", imageAlt: "琼南一号认种沉香树", certificateHref: "/assets/certificates/tree-adoption-certificate-demo.pdf", certificateFilename: "琼南一号认种沉香树-认种证书-演示.pdf" },
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

function CollectionCard({ item, index, activeIndex, onStep, onOpen, onToast }: { item: Collectible; index: number; activeIndex: number; onStep: (delta: -1 | 1) => void; onOpen: () => void; onToast: (message: string) => void }) {
  const status = item.id === "tree" ? "已建档" : "已认证";
  const numberLabel = item.id === "tree" ? "认种编号" : "档案编号";
  const visibleFacts = item.facts.filter(([label]) => label !== "状态").slice(0, 2);
  return <article className="collection-card" data-active={index === activeIndex ? "true" : "false"} inert={index !== activeIndex ? true : undefined} aria-hidden={index !== activeIndex ? true : undefined}>
    <header className="collection-card-header"><h3>我的藏品</h3><CertificateDownloadLink item={item} onToast={onToast} showIcon /><button type="button" aria-label={`查看${item.name}档案`} onClick={onOpen}>查看档案<ChevronRightIcon aria-hidden="true" /></button></header>
    <div className="collection-card-body"><button className="collection-step previous" type="button" aria-label="上一件藏品" onClick={() => onStep(-1)}><ChevronLeftIcon aria-hidden="true" /></button><img src={item.image} alt={item.imageAlt} /><div className="collection-card-copy"><div className="collection-name-row"><strong>{item.name}</strong><small><CheckCircledIcon aria-hidden="true" />{status}</small></div><dl><div><dt>{numberLabel}</dt><dd>{item.number}</dd></div>{visibleFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><span className="collection-seal" aria-hidden="true">{item.id === "tree" ? "树" : "香"}</span><button className="collection-step next" type="button" aria-label="下一件藏品" onClick={() => onStep(1)}><ChevronRightIcon aria-hidden="true" /></button></div>
    <ol className="collection-pagination" aria-label="藏品位置">{collectibles.map((entry, dotIndex) => <li key={entry.id} aria-label={`第 ${dotIndex + 1} 件：${entry.name}`} aria-current={index === activeIndex && dotIndex === activeIndex ? "step" : undefined} />)}</ol>
  </article>;
}
function CollectionShowcase({ flow, keyboard, onToast }: { flow: any; keyboard: ReturnType<typeof useKeyboard>; onToast: (message: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null); const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { const carousel = sectionRef.current?.querySelector<HTMLElement>(".collection-carousel"); if (!carousel) return; let settleTimer: number | undefined; const update = () => { const width = Math.max(1, carousel.clientWidth); const next = Math.max(0, Math.min(collectibles.length - 1, Math.round(carousel.scrollLeft / width))); setActiveIndex(next); window.clearTimeout(settleTimer); settleTimer = window.setTimeout(() => { const target = next * width; if (Math.abs(carousel.scrollLeft - target) > 1) carousel.scrollTo({ left: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, 120); }; carousel.addEventListener("scroll", update, { passive: true }); update(); return () => { carousel.removeEventListener("scroll", update); window.clearTimeout(settleTimer); }; }, []);
  const selectRelative = (delta: -1 | 1) => { const next = (activeIndex + delta + collectibles.length) % collectibles.length; const carousel = sectionRef.current?.querySelector<HTMLElement>(".collection-carousel"); const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; setActiveIndex(next); carousel?.scrollTo({ left: next * carousel.clientWidth, behavior: reducedMotion ? "auto" : "smooth" }); };
  const openArchive = (item: Collectible) => { prepareH5Transition(keyboard); flow.push(item.id === "tree" ? adoptionArchiveScreen(keyboard) : collectionArchiveScreen(keyboard)); };
  return <section ref={sectionRef} className="home-collection" data-home-section="home-collection" aria-label="我的藏品"><Carousel className="collection-carousel" contentClassName="collection-carousel-content" ariaLabel="我的藏品轮播">{collectibles.map((item, index) => <CollectionCard key={item.number} item={item} index={index} activeIndex={activeIndex} onStep={selectRelative} onToast={onToast} onOpen={() => openArchive(item)} />)}</Carousel></section>;
}
function ArchiveCertificate({ item, mall = false }: { item: Collectible; mall?: boolean }) {
  const toast = useTransientMessage();
  return <><div className="archive-actions"><CertificateDownloadLink item={item} onToast={toast.show} />{mall ? <button onClick={() => toast.show("商城即将上线，敬请期待")}>前往认种</button> : null}</div><PrototypeToast message={toast.message} /></>;
}
const parkSlides = [["/assets/customer-feedback/park-detail-base.png", "万亩沉香种植基地", "从林场环境、种植批次到日常养护建立基础档案。"], ["/assets/customer-feedback/park-detail-nursery.png", "标准化育苗", "记录苗木来源、生长阶段与养护责任。"], ["/assets/customer-feedback/park-detail-workshop.png", "无尘加工车间", "分区完成选料、加工、质检与包装。"], ["/assets/customer-feedback/park-detail-quality.png", "全链路品控", "把批次、制作、质检与芯片身份串联起来。"]] as const;
const selectionItems = [
  { title: "手串收藏", description: "海南沉香 · 温润随身", background: "/assets/home-selection/bracelet-background-v2.png" },
  { title: "香道礼盒", description: "雅集赠礼 · 一盒成礼", background: "/assets/home-selection/gift-background-v2.png" },
  { title: "企业定制", description: "专属定制 · 国企礼赠", background: "/assets/home-selection/custom-background-v2.png" },
  { title: "沉香树认种", description: "一树一档 · 见证生长", background: "/assets/home-selection/tree-background-v2.png" },
] as const;
function IndustrialPark({ keyboard }: { keyboard: ReturnType<typeof useKeyboard> }) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const parkRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const carousel = parkRef.current?.querySelector<HTMLElement>(".park-carousel");
    if (!carousel) return;
    const update = () => {
      const slide = carousel.querySelector<HTMLElement>(".park-slide");
      const gap = Number.parseFloat(getComputedStyle(carousel.querySelector<HTMLElement>(".park-carousel-content")!).gap) || 0;
      const step = Math.max(1, (slide?.offsetWidth ?? carousel.clientWidth) + gap);
      setIndex(Math.max(0, Math.min(parkSlides.length - 1, Math.round(carousel.scrollLeft / step))));
    };
    carousel.addEventListener("scroll", update, { passive: true });
    update();
    return () => carousel.removeEventListener("scroll", update);
  }, []);
  return <MobileScroll className="app-screen"><main ref={parkRef} className="screen-content detail-content industrial-park" data-product-doc-page="industrial-park"><p className="page-eyebrow">走进产业园</p><h2>广垦沉香·源头产业园</h2><p className="lead">广东农垦国资国企｜万亩沉香种植基地｜标准化无尘加工车间，全链路品控</p><Carousel ariaLabel="产业园图集" className="park-carousel" contentClassName="park-carousel-content">{parkSlides.map(([image,title,text], i) => <article className="park-slide" key={title} onFocus={() => setIndex(i)}><img src={image} alt={title} /><h3>{title}</h3><p>{text}</p></article>)}</Carousel><div className="park-page-count" aria-live="polite">{index + 1}/{parkSlides.length}</div><button className="park-video-button" aria-label={playing ? "暂停产业园介绍" : "播放产业园介绍"} onClick={() => setPlaying(value => !value)}>{playing ? "暂停产业园介绍 · 00:18 / 01:12" : "播放产业园介绍 · 00:00 / 01:12"}</button>{playing ? <div className="park-video-progress" aria-hidden="true"><span /></div> : null}</main></MobileScroll>;
}
const industrialParkScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "industrial-park", header: flow => <TopBar title="广垦沉香·源头产业园" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <IndustrialPark keyboard={keyboard} /> });

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
          <HomeServiceLink icon={<BookOpen />} title="沉香知识" onClick={() => { prepareH5Transition(keyboard); flow.push(knowledgeScreen(keyboard)); }} />
          <HomeServiceLink icon={<Sprout />} title="认种沉香树" onClick={() => { prepareH5Transition(keyboard); flow.push(adoptionArchiveScreen(keyboard)); }} />
        </section>
        <section className="home-park home-park-banner" data-home-section="home-park">
          <div className="home-park-copy">
            <h3>广垦沉香 · 源头产业园</h3>
            <p><span>广东农垦国资国企｜万亩沉香种植基地</span><span>标准化无尘加工车间，全链路品控</span></p>
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
const adoptionArchiveScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "adoption-archive", header: flow => <TopBar title="认种档案" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content detail-content adoption-archive" data-product-doc-page="adoption-archive"><p className="page-eyebrow">我的藏品 · 林木认种</p><img className="archive-hero tree" src={collectibles[1].image} alt={collectibles[1].imageAlt} /><h2>琼南一号认种沉香树</h2><p className="archive-number">TR-2026-018</p><div className="archive-meta">{collectibles[1].facts.map(([label,value]) => <span key={label}>{label}<strong>{value}</strong></span>)}<span>认种日期<strong>2026年8月18日</strong></span></div><div className="timeline">{[["认种登记", "2026.01", "完成认种信息登记"],["养护建档", "2026.03", "树苗生长稳定"],["最近巡检", "2026.08", "叶色正常，长势良好"],["下一次回访", "2026.11", "计划进行季度回访"]].map(([a,b,c]) => <div className="timeline-item" key={a}><span className="timeline-dot" /><div><small>{b}</small><strong>{a}</strong><p>{c}</p></div></div>)}</div><ArchiveCertificate item={collectibles[1]} mall /></main></MobileScroll>,
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
const farmStoryScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "farm-story",
  header: flow => <TopBar title="农垦沉香" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content farm-story-content" data-product-doc-page="farm-story">
    <p className="page-eyebrow">琼南农垦 · 沉香故事</p>
    <h2>从琼南农垦出发，<br /><em>认识这串沉香。</em></h2>
    <p className="lead">海南琼南的山林环境、长期种植积淀与产业传承，共同构成这串沉香的产区来处。</p>
    <div className="farm-story-list">
      <section><span>01</span><div><h3>产区环境</h3><p>温润海风与山林气候，为沉香生长提供稳定、自然的环境基础。</p></div></section>
      <section><span>02</span><div><h3>农垦积淀</h3><p>依托长期林业种植与产区管理经验，让沉香产业从土地中持续生长。</p></div></section>
      <section><span>03</span><div><h3>从林场到手串</h3><p>原料经过选材、制作与质检，才成为可以佩戴、可以追溯的一串沉香。</p></div></section>
    </div>
    <p className="farm-story-note">本页介绍品牌与产区背景；本串批次、质检和芯片信息请在“证书与溯源”中查看。</p>
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
const knowledgeScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "knowledge", header: flow => <TopBar title="沉香知识" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content article-content" data-product-doc-page="knowledge"><p className="page-eyebrow">认识沉香</p><h2>从产区开始，<br /><em>认识一块沉香。</em></h2><p className="lead">沉香不是树木本身，而是树体在特定环境下形成的香脂与木质的结合体。</p><div className="knowledge-topic-row"><span>01</span><div><strong>沉香如何形成</strong><p>树体受伤后形成香脂，经过时间与环境共同变化。</p></div></div><div className="knowledge-topic-row"><span>02</span><div><strong>怎样闻香</strong><p>先闻整体，再观察清甜、木质与熟韵的变化。</p></div></div><div className="knowledge-topic-row"><span>03</span><div><strong>常见产区差异</strong><p>不同产区的气候和土壤，会带来各具特色的香气层次。</p></div></div><button className="knowledge-card knowledge-story-link" aria-label="了解琼南农垦故事" onClick={() => { prepareH5Transition(keyboard); flow.push(farmStoryScreen(keyboard)); }}><SewingPinIcon /><div><strong>琼南农垦沉香</strong><p>了解品牌、产区与从林场到手串的故事。</p></div><ChevronRightIcon /></button></main></MobileScroll> });

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
