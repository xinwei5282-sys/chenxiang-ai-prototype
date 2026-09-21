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

const officialLogo = "/assets/product/guangken-logo.png";

type CertificateAppraisal = { image: string; sampleName: string; certificateNumber: string; weight: string; conclusion: string; taxonomy: string; note: string; inspection: string; standard: string; queryCode: string };
type CertificateRecord = { key: string; name: string; image: string; spec: string; certificate?: CertificateAppraisal };
const certificateRecords: readonly CertificateRecord[] = [
  { key: "cx-2018-072", name: "奇楠沉香算盘珠手串", image: "/assets/customer-feedback/collection-bracelet-thumbnail.png", spec: "18mm · 16颗", certificate: { image: "/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg", sampleName: "奇楠沉香算盘珠手串", certificateNumber: "ZHTC26063030124", weight: "4.3g+", conclusion: "符合奇楠沉香构造特征", taxonomy: "瑞香科沉香属", note: "无", inspection: "横切面构造", standard: "T/DBCX010-2025", queryCode: "1706" } },
  { key: "cx-2024-116", name: "琼南蜜韵沉香手串", image: "/assets/product/agarwood-bracelet-hero.png", spec: "16mm · 18颗" },
  { key: "cx-2025-031", name: "岭南雅韵沉香手串", image: "/assets/home-selection/bracelet-background-v2.png", spec: "14mm · 20颗" },
];

// Source: AI沉香 溯源环节（修改版9.18）.docx; blank identifiers and X dates remain incomplete.
const provenanceStages = [
  {
    title: "种植管理",
    label: "园林生长",
    date: "2019 年",
    body: "以种质优选为源头，筛选优良品系移植至原生态沉香种植林，依山势自然生长。采用科学管护方案，定期除草、修枝、精准水肥调控，用无人机巡林、环境传感监测、生长数据建档，减少化学药剂投入，守护林地生态本底，保障天然沉香原料天然品质。",
    fields: [["种植年份", "2019 年"], ["管护方式", "原生态管护 + 定期巡检"]],
    photos: [["image1.jpeg", "沉香种植管护"], ["image2.jpeg", "沉香种植林"], ["image3.jpeg", "种植基地航拍"], ["image4.jpeg", "无人机巡林"]],
  },
  {
    title: "打孔造香",
    label: "引香入木",
    date: "2023 年",
    body: "遵循传统古法与科学工艺，人工在树干上规律打孔，诱导树木自然分泌油脂自我愈合。沉香并非木，而是树木历经岁月伤口凝结的“香之结晶”。",
    fields: [["开始造香时间", "2023 年（月待补充）"], ["造香工艺", "人工物理打孔法"]],
    photos: [["image5.jpeg", "人工打孔造香"], ["image6.jpeg", "打孔作业现场"], ["image7.jpeg", "造香树木挂牌"], ["image8.jpeg", "树干打孔记录"]],
  },
  {
    title: "采收取香",
    label: "择时采香",
    date: "2025 年",
    body: "待油脂充分凝结、色泽深褐后，由经验丰富的香农择期采香。只选取油脂饱满、质地致密的沉香结香部位，剔除白木与杂质，保留精华。",
    fields: [["采香日期", "2025 年（月日待补充）"], ["采香人员", "温国波 NM018（工号）"]],
    photos: [["image9.jpeg", "采香现场"], ["image10.jpeg", "结香原料"], ["image11.jpeg", "原料切段"], ["image12.jpeg", "切段原料分拣"], ["image13.jpeg", "剔除白木与杂质"], ["image14.jpeg", "取香原料称重"]],
  },
  {
    title: "加工制作（淳化）",
    label: "精细加工",
    date: "约 20 天",
    body: "原料经筛选、开料、打孔、精细打磨抛光成品珠，再放入恒温恒湿仓静置淳化。去除新料火气与杂味，让香韵逐步沉淀内敛，呈现沉香本真气息。",
    fields: [["加工周期", "约 20 天"], ["加工工艺", "手工打磨 + 恒温淳化"], ["质检标准", "大小规格标准、油脂线均匀、无开裂、无补痕"]],
    photos: [["image15.jpeg", "珠料开料"], ["image16.jpeg", "珠料加工"], ["image17.jpeg", "珠料切割"], ["image18.jpeg", "珠粒打磨抛光"], ["image19.jpeg", "沉香加工车间"], ["image20.jpeg", "手工穿串"]],
  },
  {
    title: "成品手串",
    label: "一珠一码",
    date: "2026 年",
    body: "精选颗颗油脂饱满的珠粒，手工穿串成链，内嵌 AI 溯源芯片。从此刻起，这串沉香拥有了唯一数字身份 —— 扫描芯片，即可回看它从一粒种子到手腕之珠的完整旅程。",
    fields: [["手串唯一编号", "待补充"], ["手串规格", "待补充"], ["质检证书编号", "待补充"], ["出厂日期", "2026 年（月日待补充）"]],
    photos: [],
  },
];

const productDocPages = {
  news: { label: "P-20 资讯动态", guideHeading: "DOC-P-20 资讯动态", specHeading: "P-20 资讯动态", flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"], apiHeadings: [], acceptancePrefixes: ["AC-NEWS-"] },
  "news-article": { label: "P-21 资讯详情", guideHeading: "DOC-P-21 资讯详情", specHeading: "P-21 资讯详情", flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"], apiHeadings: [], acceptancePrefixes: ["AC-NEWS-"] },
  "collection-archive": { label: "P-13 手串档案", guideHeading: "DOC-P-13 手串档案", specHeading: "P-13 手串档案", flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-COLLECTION-"], apiHeadings: [], acceptancePrefixes: ["AC-COLLECTION-"] },
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
  "enterprise-custom": {
    label: "P-18 企业定制", guideHeading: "DOC-P-18 企业定制", specHeading: "P-18 企业定制",
    flowHeadings: ["FLOW-07 内容阅读"], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-"],
  },
  "incense-gift": {
    label: "P-19 香道礼盒", guideHeading: "DOC-P-19 香道礼盒", specHeading: "P-19 香道礼盒",
    flowHeadings: ["FLOW-07 内容阅读"], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
    apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-"],
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
function posterPagePrd(title: string, content: string): PagePrd {
  return { goal: `以统一的米白、深绿和棕金风格展示${title}内容。`, roles: "所有访客", entry: `首页广垦沉香甄选 → ${title}`, permission: "匿名可读", rules: ["企业定制按已确认效果稿展示右侧礼盒主视觉、左侧真实文案，六步流程为两列三行，底部为植物纹理顾问服务区与三类适用场景。", "香道礼盒展示产品主图、品牌文案与礼赠场景，并直接展示原宣传图中的微信二维码。", "两个页面在默认 iPhone 与 Pixel 上一屏完整展示，底部避让安全区，均不提供完整海报查看或放大入口。"], fields: [["页面标题", "文本", "必显", title], ["页面内容", "图文", "必显", content], ["微信二维码", "原图局部展示", "仅香道礼盒显示", "使用原海报真实二维码，不生成、不改写码内容"]], actions: [["返回", "详情页", "回到首页原浏览位置", "无业务写操作"], ["重新加载", "图片失败时", "重新加载产品图或二维码原图", "匿名可用"]], boundary: "仅展示客户宣传内容，不创建下单、付款或咨询提交接口。产品主图依据原宣传图整理；二维码目的地由原始素材决定。", states: "首页入口→品牌详情页→返回首页；图片失败→重试。", logs: "生产接入时记录详情曝光与图片加载失败。", empty: "图片加载失败显示提示及重新加载按钮。", acceptance: ["六步流程文案完整，礼盒主视觉与整站风格一致。", "没有查看海报入口，礼盒二维码独立完整展示。", "返回恢复首页浏览位置，页面 PRD 与当前页面对应。"], tech: ["复用 FlowStack、MobileScroll；以原宣传图局部视口展示二维码，不重绘码点。"] };
}
const pagePrdDefaults: Record<ProductDocPageKey, PagePrd> = {
  news: { goal: "浏览行业行情与展会信息。", roles: "所有访客", entry: "首页甄选→资讯动态", permission: "匿名可读", rules: ["沿用沉香小知识的左图右文、细分隔线列表。", "每条显示标题、摘要和分类，整行进入对应资讯详情。", "当前四篇均为示例内容，不代表实时行情或真实展会公告。"], fields: [["资讯条目", "图文列表", "必显", "缩略图、标题、摘要、行业行情/展会信息分类"], ["示例标识", "文本", "示例数据时", "示例内容"]], actions: [["资讯条目", "有内容", "进入对应详情", "按稳定内容 id 读取"], ["返回", "始终可用", "返回首页原浏览位置", "不要求授权"]], boundary: "当前为本地内容示例，无实时新闻接口、价格预测或展会报名。", states: "首页→资讯列表→详情→列表→首页。", logs: "生产接入后记录内容曝光和阅读，不在原型发送数据。", empty: "无数据时显示暂无资讯，后续接入接口再补充加载与失败重试。", acceptance: ["首页入口进入列表，不再提示即将上线。", "图文可读且不溢出，详情与条目匹配，返回恢复浏览位置。"], tech: ["复用 FlowStack、MobileScroll 和 home-knowledge-row。"] },
  "news-article": { goal: "阅读全文并返回资讯列表。", roles: "所有访客", entry: "资讯动态列表", permission: "匿名可读", rules: ["使用沉香小知识的公众号式文章结构。", "详情标题、配图和正文与所选资讯对应。", "示例文章不添加虚构来源、日期、价格或展会地点。"], fields: [["资讯正文", "图文", "必显", "标题、分类、示例标识、摘要、分节正文"]], actions: [["返回", "始终可用", "回到资讯列表原位置", "不跳回首页"]], boundary: "仅阅读，不增加点赞、分享、评论、交易或报名。", states: "列表→对应文章→原列表。", logs: "原型不发送阅读数据。", empty: "本地示例均有完整正文；上线内容需校验后发布。", acceptance: ["正文完整可滚动，返回到资讯列表。", "页面 PRD 映射到资讯详情。"], tech: ["复用 wechat-article 阅读样式。"] },
  "collection-archive": {"goal": "查看所选藏品的手串档案及对应电子证书。", "roles": "已绑定手串的消费者", "entry": "首页我的藏品→查看档案", "permission": "仅对应已绑定手串", "rules": ["图片、名称、编号、规格和证书取自同一手串记录。", "导出已收录的本串证书原件，不使用旧的固定演示PDF。", "缺少证书只显示待补充，不借用其他手串资料。"], "fields": [["图片、名称与手串编号", "图文", "必显", "来自所选手串"], ["规格与证书状态", "文本", "必显", "有证书显示编号，无证书显示待补充"]], "actions": [["导出电子证书", "有本串原件", "下载对应证书文件", "失败提示并可重试"], ["返回", "始终可用", "返回首页", "保留藏品浏览位置"]], "boundary": "档案入口保留在首页卡片；我的手串列表不跳转档案或证书详情。", "states": "藏品卡→本串档案→下载成功/失败；无证书→待补充。", "logs": "记录所选bracelet_id、原件来源和下载结果。", "empty": "无证书显示证书待补充。", "acceptance": ["滑动切换后每卡档案、证书归属正确。", "无证书记录不能下载另一串原件。"], "tech": ["原型下载已收录JPG原件；生产环境由服务端校验绑定及签发主体。"]},
  "enterprise-custom": posterPagePrd("企业定制", "企业定制流程：需求沟通、方案设计、报价确认、打样制作、批量生产、交付售后。"),
  "incense-gift": posterPagePrd("香道礼盒", "广垦香礼，好运香伴：礼盒产品、活动文案及原图二维码。"),
  home: { goal: "以广垦沉香品牌内容建立信任，并让用户进入问帖、手串藏品、证书、养护、知识、外部认种小程序和产业园。", roles: "匿名用户和已授权用户", entry: "芯片识别成功；根导航首页；小程序常规入口", permission: "品牌内容匿名可读；证书、溯源和藏品在确认绑定后读取当前手串；问帖需微信授权", rules: ["页面按品牌主视觉、AI 问帖、广垦甄选、我的藏品、四项服务、源头产业园、沉香小知识和版权顺序纵向滚动。", "识别后询问是否绑定，首次确认继续微信授权；绑定后首页各模块使用同一 activeId。重复识别只切换当前串。", "资讯动态打开图文资讯列表并可进入详情；企业定制与香道礼盒打开品牌详情页，礼盒页直接展示微信二维码；其余商城与甄选入口保留即将上线提示；认种沉香树直接跳转外部认种小程序，不建设内部认种档案。"], fields: [["品牌主视觉", "图文 Banner", "首屏必显", "展示广垦沉香 Logo、海南琼南沉香手串与品牌画面"],["AI 问帖主入口", "按钮", "必显", "文案为开始问帖，每次进入新对话"],["广垦沉香甄选", "商品预告", "固定展示", "展示四项甄选内容；资讯动态进入资讯列表，企业定制与香道礼盒进入品牌详情，其余入口保留原行为"],["我的藏品", "单个手串卡片", "绑定后展示", "展示全部绑定手串卡片，左右滑动或分页切换当前串，证书与溯源同步；无绑定显示空态；每卡保留导出对应电子证书和查看对应档案"],["服务入口", "四项宫格", "固定展示", "证书查询、佩戴养护、防伪溯源、认种沉香树"],["源头产业园", "图文入口", "固定展示", "工厂正面图作为首页封面，进入产业园图文介绍"],["沉香小知识", "文章列表", "两篇固定展示", "分别进入公众号式纯展示文章"],["公司版权", "页脚文本", "页面末尾展示", "展示运营主体，不承载操作"]], actions: [["开始问帖", "始终展示", "未授权打开登录确认层；已授权创建新对话", "记录入口来源和 pending_intent"],["查看证书查询", "当前手串有效", "直达当前手串证书详情", "记录 bracelet_id"],["导出电子证书 / 查看档案", "对应手串已绑定", "下载本串原件 / 进入本串档案", "按该卡 bracelet_id 读取，缺少证书不借用其他手串资料"],["认种沉香树", "始终展示", "跳转外部认种小程序", "生产使用 wx.navigateToMiniProgram 并记录成功或失败"],["佩戴养护 / 沉香知识", "内容可用", "进入对应内容页", "匿名可用，记录 content_key"],["走进产业园", "固定展示", "进入产业园图文介绍页", "记录内容曝光与播放"]], boundary: "本页不建设交易闭环或内部认种档案；认种商品、记录、证书和交易归属外部小程序。AI 只作传统文化角度参考，不作鉴定、医疗、法律、财务或投资承诺。", states: "页面加载→分模块成功/失败；开始问帖→授权确认/新对话；商城入口→即将上线提示；认种入口→外部小程序/失败留在首页重试。", logs: "记录 scan_token、页面曝光、模块点击、下载结果、外部小程序跳转结果和错误码；未授权时不记录个人身份。", empty: "单个模块失败不阻塞其他模块；无绑定时保留服务入口，提示先通过 NFC 识别并绑定；外部认种小程序无法打开时留在首页并提示重试。", acceptance: ["模块顺序与已确认首页一致，底部导航不遮挡版权。", "未授权点击问帖先进入微信授权确认，成功后恢复问帖意图。", "认种沉香树不进入内部档案，原型提示正在打开外部小程序并保持首页。"], tech: ["证书、溯源、藏品和管理列表共享绑定状态；未知识别不回退演示手串。", "生产认种入口使用可配置 AppID 和路径调用 wx.navigateToMiniProgram。", "模块接口独立降级，图片需有替代文本和缓存策略。"] },
  "authorization-sheet": { goal: "解释微信授权用途并在确认后恢复用户刚才的操作。", roles: "首次发起问帖的消费者", entry: "点击开始问帖；点击我的中的授权登录", permission: "未授权用户可见", rules: ["授权说明必须先于微信授权动作展示。", "取消不丢失原入口意图，再次点击可重新唤起。"], fields: [["授权说明", "说明文本", "必填展示", "仅说明头像、昵称和问帖记录用途"],["微信授权登录", "按钮", "必填展示", "唯一确认动作"],["取消", "按钮", "必填展示", "关闭弹层并返回原页面"]], actions: [["微信授权登录", "弹层打开", "唤起授权并恢复原意图", "记录授权结果"],["取消", "弹层打开", "关闭弹层", "记录取消事件"]], boundary: "不得暗示授权后获得超出实际范围的权益。", states: "打开→授权中→成功/失败；取消→关闭。", logs: "记录授权发起、成功、失败原因与恢复目标。", empty: "授权失败保留弹层并提供重试。", acceptance: ["授权后回到用户原本要去的页面。", "取消后页面状态不改变。"], tech: ["授权回调需幂等。", "意图参数需安全白名单化。"] },
  interpret: { goal: "用简洁的移动对话完成自由提问、必要追问和传统文化角度参考。", roles: "已授权消费者", entry: "首页开始问帖；根导航问帖；历史详情开启新问帖", permission: "微信授权后", rules: ["每次正常进入均创建新的对话，不自动带入上一段历史。", "默认展示广垦沉香 Logo、今天想问什么及工作思考/人际沟通/自我成长三个快捷主题。", "仅支持文字输入和发送，不提供图片、文件、附件、相机、麦克风或语音。"], fields: [["新对话空态", "Logo＋引导", "无消息时展示", "展示今天想问什么、说明和三个快捷主题"],["对话消息", "消息列表", "有消息展示", "按时间顺序展示用户与 AI 内容"],["AI 回答", "结构化文本", "生成完成展示", "使用判断、提醒、建议三个层次"],["输入框", "文本框", "固定底部展示", "支持中文文本，避让键盘与手机安全区"],["发送", "按钮", "输入非空且非生成中可用", "发送后展示处理中状态"],["免责声明", "说明文本", "AI 内容中必显", "固定文案：内容由 AI 生成，仅供娱乐参考"]], actions: [["快捷主题", "新对话空态", "直接发送对应主题", "记录 starter_topic"],["发送", "输入非空", "创建消息并返回 AI 回复", "记录 conversation_id、message_id 与耗时"],["返回", "始终展示", "回到来源页面", "已产生消息的对话进入历史记录"]], boundary: "回答不得形成确定性预测、转运承诺或医疗、法律、财务等专业结论。", states: "新对话空态→用户发送→AI 追问/回答→继续追问；请求失败→保留用户消息并重试。", logs: "记录会话创建、消息发送、耗时、错误与安全拦截，不记录图片或音频数据。", empty: "新对话展示 Logo 与快捷主题；网络失败保留用户消息和输入草稿。", acceptance: ["每次进入均为无旧消息的新对话。", "发送后用户消息与 AI 回复顺序正确，回答包含判断、提醒和建议。", "输入框不贴手机边缘且键盘打开后仍可见。"], tech: ["消息接口需支持幂等、主动追问和流式/轮询扩展。", "输入输出必须经过安全策略并保存策略版本。"] },
  profile: { goal: "用重点明确的账号 Banner 集中承载授权状态、问帖记录、我的手串和芯片说明。", roles: "匿名用户和已授权消费者", entry: "根导航我的", permission: "访客可看授权入口；问帖记录和绑定手串需授权", rules: ["Banner 通铺至状态栏并左右贴边，头像、账号文案和授权状态保持同一横排。", "Banner 下半部只展示问帖记录与我的手串，数量在上、标题在下并支持整块点击。", "我的手串只进入绑定管理列表，行点击不跳转详情；Banner 下只保留芯片识别说明。"], fields: [["头像与账号", "身份区", "Banner 上部必显", "未授权展示微信账号，授权后展示微信用户"],["微信授权登录", "按钮/状态", "未授权展示按钮", "点击打开手机内授权确认层，授权后显示已登录"],["问帖记录", "统计入口", "固定展示", "原型显示 1 条，点击进入记录列表"],["我的手串", "统计入口", "固定展示", "按实际绑定数显示 N 串，点击进入列表与左滑删除"],["芯片识别说明", "单行入口", "Banner 下唯一列表项", "进入 NFC 识别说明"]], actions: [["微信授权登录", "未授权", "打开授权确认层", "记录来源意图"],["问帖记录", "固定展示", "未授权先授权；已授权进入记录列表", "校验当前用户"],["我的手串", "固定展示", "进入我的手串列表", "生产环境校验绑定关系"],["芯片识别说明", "始终展示", "进入识别说明页", "匿名可用"]], boundary: "不重复展示记录、证书或传统文化解读帮助入口，不泄露其他用户数据。", states: "未授权→授权确认/取消；已授权→计数加载→数据/空态/失败。", logs: "记录授权、两个统计入口点击、手串列表加载与错误。", empty: "计数失败显示 --；无手串或无问帖显示 0，并在目标页给出明确空态。", acceptance: ["头像、账号和登录状态同一行，登录状态右对齐。", "问帖记录和我的手串均为数量在上、标题在下并可点击。", "Banner 下仅保留芯片识别说明。"], tech: ["统计数据与绑定关系按用户隔离。", "Banner 与状态栏安全区需适配 iPhone 和 Pixel。"] },
  "reading-records": { goal: "让用户查找已保存问帖并进入只读详情。", roles: "已授权消费者", entry: "我的→问帖记录", permission: "微信授权后", rules: ["列表按最近更新时间倒序。", "点击记录只进入历史详情，不直接继续旧对话。"], fields: [["问帖标题", "文本", "每条必显", "标题为空时使用首条用户消息摘要"],["相对时间", "时间文本", "每条必显", "依据 updated_at 生成"],["回答摘要", "文本", "有内容展示", "展示最近一条 AI 回答摘要"],["空态", "提示", "无记录展示", "引导开始新的问帖"]], actions: [["问帖记录项", "有记录", "进入只读问帖详情", "记录 conversation_id 并校验归属"],["开始新问帖", "空态展示", "创建全新对话", "记录来源为空态"]], boundary: "本页不提供删除、编辑或继续旧会话输入。", states: "加载→有记录/空态/失败；点击记录→只读详情。", logs: "记录列表查询、记录打开、分页和错误。", empty: "无记录时展示明确空态与开始新问帖入口；失败保留已加载数据并可重试。", acceptance: ["列表按最近更新时间稳定排序。", "点击记录进入只读详情，不直接进入新问帖。"], tech: ["生产列表使用 cursor 分页并按账号隔离。"] },
  "reading-record-detail": { goal: "完整呈现历史问帖上下文，并让用户从独立入口开启新问帖。", roles: "已授权消费者", entry: "问帖记录列表", permission: "仅记录所属用户", rules: ["历史消息只读，不展示输入框。", "开启新问帖必须创建新的 conversation_id，不续接当前历史。"], fields: [["问帖主题", "文本", "必显", "展示历史问题标题"],["消息时间线", "只读列表", "有记录展示", "保留问答顺序、角色与内容"],["AI 免责声明", "说明文本", "AI 内容必显", "内容由 AI 生成，仅供娱乐参考"],["开启新问帖", "按钮", "固定展示", "进入全新对话"]], actions: [["开启新问帖", "始终展示", "创建新会话并进入问帖空态", "记录来源 conversation_id，不复用该 ID"],["返回", "始终展示", "返回问帖记录列表", "保留列表位置"]], boundary: "历史内容只读，不代表当前专业结论，也不能在本页继续发送消息。", states: "加载→详情/不存在/越权；开启新问帖→全新对话。", logs: "记录详情查看、越权拦截和新问帖点击。", empty: "记录不存在或越权统一提示这条问帖记录已不存在，并返回列表。", acceptance: ["历史页不展示输入框。", "开启新问帖后进入无旧消息的新对话。"], tech: ["服务端校验 conversation_id 所属关系。", "不存在与越权使用统一外显错误。"] },
  provenance: { goal: "展示当前或所选手串的数字身份与溯源时间线。", roles: "已绑定手串的用户", entry: "首页防伪溯源", permission: "绑定后使用当前 activeId 读取；生产校验账号归属", rules: ["名称、唯一编号、五站记录与图片必须归属所选 bracelet_id，不跨串复用。", "原型依据《AI沉香 溯源环节（修改版9.18）》展示五环节内容，不代表已完成真实防伪核验；空白编号、规格及 X 日期保持待补充。", "证书原件缺失不阻止查看本串溯源。"], fields: [["手串编号", "文本", "必显", "与所选手串一致"],["手串规格、质检证书编号与出厂日期", "文本", "必显", "空白字段待补充；出厂年份为 2026，月日待补充"],["溯源时间线", "节点列表", "有数据展示", "种植管理、打孔造香、采收取香、加工制作（淳化）、成品手串；前四站分别 4/4/6/6 张来源照片，末站不展示图片或图片占位，详细数据默认完整展示"]], actions: [["返回", "始终展示", "返回原入口", "保留来源上下文"]], boundary: "真实防伪核验与生产溯源接口尚未接入；不恢复内部认种档案。", states: "进入→本串身份及时间线/信息待补充→返回首页。", logs: "记录所选 bracelet_id、入口来源和查询结果。", empty: "缺少时间线时显示溯源信息待补充，不借用其他手串记录。", acceptance: ["首页第三项为防伪溯源，证书查询仍独立。", "第二、第三串不混用第一串编号或时间线。", "五站详细数据默认全部展示，支持照片横滑、纵向滚动阅读并返回；末站为第 5 站・一珠一码。"], tech: ["正式环境需按 bracelet_id 接入身份及溯源接口。", "失败、未绑定与无记录状态不得显示已核验。"] },
  certificate: { goal: "展示证书原件与结构化检验字段，并按手串独立绑定。", roles: "拥有绑定关系的用户", entry: "首页证书查询", permission: "绑定后按当前手串读取，生产校验账号归属", rules: ["展示证书原件和结构化检验字段；证书与防伪溯源分别从首页进入，不提供互相跳转按钮。", "首页使用当前已绑定的 activeId，证书对象必须归属当前手串；我的手串列表不跳转证书详情。", "缺少原件时显示待补充，不得复用其他手串证书。"], fields: [["证书原件", "图片", "有原件展示", "完整展示并支持适应宽度与 2× 查看"],["样品名称", "文本", "有证书展示", "与证书原件一致"],["证书编号", "文本", "有证书展示", "唯一证书标识"],["样品重量与检验结论", "文本", "有证书展示", "按证书原文展示"],["科属、备注与放大检查", "文本", "有证书展示", "按证书原文展示"],["执行标准与查询码", "文本", "有证书展示", "查询码本期只展示"]], actions: [["查看证书原件", "原件已收录", "打开手机内原图查看层", "点击切换适应宽度与 2×"],["关闭原件", "查看层打开", "返回证书详情", "支持按钮与 Esc"],["返回", "始终展示", "返回首页", "保留来源上下文"]], boundary: "防伪溯源在独立页面展示；本期不建设证书查询接口、复制动作或二维码生成，也不把证书表述为功效、价格或投资价值承诺。", states: "详情→原件查看/图片失败；多手串→完整证书或原件待补充。", logs: "记录 bracelet_id、certificate_id、查看来源、原图查看和图片失败，不记录原件外的推断字段。", empty: "图片加载失败显示证书原件暂时无法加载，结构化字段仍可阅读；无原件显示证书原件待补充。", acceptance: ["证书原件完整可查看，并可在适应宽度与 2× 之间切换。", "无原件手串不复用其他手串证书。", "iPhone 与 Pixel 均无横向溢出或关键内容遮挡。"], tech: ["证书对象必须归属对应 bracelet_id。", "原图资源失败时必须独立降级，不影响字段展示。"] },
  care: { goal: "提供连续、易执行的佩戴和养护指南。", roles: "沉香手串消费者", entry: "首页佩戴养护", permission: "公开可读", rules: ["按七个步骤连续阅读。", "明确避化学品、避高温、密封收存等风险。"], fields: [["养护步骤", "长文列表", "必填展示", "标题、说明和注意事项"],["步骤序号", "序号", "必填展示", "保持阅读顺序"]], actions: [["返回", "始终展示", "返回来源页", "无业务记录"]], boundary: "仅为日常保养建议，不替代专业维修。", states: "加载→正文/失败。", logs: "记录内容曝光和阅读完成。", empty: "内容缺失展示重试。", acceptance: ["七步内容顺序正确且无截断。"], tech: ["正文支持版本化和缓存。"] },
  knowledge: { goal: "提供沉香形成、闻香与产区差异三项基础知识。", roles: "消费者、文化内容读者", entry: "首页沉香知识或查看更多", permission: "公开可读", rules: ["知识页只展示三项基础知识。", "产业源头和园区介绍统一由首页走进产业园承接。"], fields: [["基础知识", "正文", "三项完整展示", "沉香如何形成、怎样闻香、常见产区差异"]], actions: [["返回", "始终展示", "返回首页", "无业务写操作"]], boundary: "不展示产业源头或农垦故事入口。", states: "加载→内容/空态/失败。", logs: "记录内容曝光与版本。", empty: "无内容展示稍后再看。", acceptance: ["三项知识可读，产业入口已移除。"], tech: ["内容 key 与版本需稳定。"] },
  "chip-help": { goal: "说明 NFC 识别步骤，并为失败用户提供重试路径。", roles: "首次识别用户、售后人员", entry: "识别失败提示；首页识别说明", permission: "公开可读", rules: ["说明必须短、可操作，失败时优先给重试。", "芯片识别说明下不再放重复说明文字。"], fields: [["识别步骤", "步骤列表", "必填展示", "贴近芯片、识别后确认绑定、识别失败重新贴近"],["重新识别", "按钮", "识别失败展示", "重新发起 NFC 识别"]], actions: [["重新识别", "失败状态", "再次调用识别能力", "记录失败与重试次数"]], boundary: "无法识别不等于商品异常，需提供人工核验渠道。", states: "待识别→成功→确认绑定/暂不绑定；失败→重试。", logs: "记录设备能力、耗时、结果码和重试次数。", empty: "设备不支持 NFC 时提示兼容方案。", acceptance: ["用户能理解下一步并完成重试。"], tech: ["兼容 NFC 不可用与权限拒绝。"] },
  "certificate-list": {"goal": "管理本人已绑定的手串，仅保留列表和左滑删除。", "roles": "已绑定手串的消费者", "entry": "我的→我的手串；首页我的藏品→我的手串", "permission": "本人绑定数据；原型在本机保存模拟账号状态", "rules": ["列表和数量来自同一份绑定记录，不预置三条已绑定手串。", "点击手串行不跳转二级页面，不切换当前串；左滑露出删除按钮。", "删除需确认，仅解除账号绑定，原始证书与溯源记录保留。", "删除当前串回退至剩余第一串，删除最后一串清空首页对应信息。"], "fields": [["缩略图与名称", "图文", "每行必显", "按绑定的 bracelet_id 显示"], ["证书摘要", "文本", "每行必显", "有原件显示编号，无原件显示待补充"], ["当前状态", "标签", "每行必显", "当前 / 已绑定"], ["删除", "左滑按钮", "左滑后可见", "打开解除绑定确认层"]], "actions": [["点击手串行", "有记录", "留在列表", "不打开二级页"], ["左滑→删除", "有记录", "确认解除绑定", "取消不改数据；确认同步数量与首页"], ["返回", "始终可用", "返回入口", "保留绑定状态"]], "boundary": "仅删除绑定关系，不删除证书、溯源原始数据；真实账号接口与 NFC 未接入。", "states": "空态→NFC识别→确认绑定→列表；左滑→删除确认→列表/空态。", "logs": "生产记录绑定、解除绑定、用户归属和结果。", "empty": "没有绑定手串时显示暂未绑定手串及 NFC 识别说明。", "acceptance": ["列表行点击不跳页，真实左滑能露出删除。", "取消不移除记录；确认删除同步首页与数量。", "刷新保留绑定与删除结果；删除后可再次识别绑定。"], "tech": ["绑定记录和当前串共用状态并在 localStorage 保存。", "藏品轮播复用 Carousel；列表左滑仅展开删除动作，纵向手势交给 MobileScroll。", "生产绑定、解绑必须由服务端校验身份与权限。"]},
  "industrial-park": { goal: "以关键数据、产业链与分节正文介绍曙光农场全产业链。", roles: "品牌访客和消费者", entry: "首页走进产业园", permission: "公开可读", rules: ["采用图文专题排版，保留航拍全景、林业服务站和高效种植示范基地照片，并分别在产业源头与种质资源、技术规范标准化、结香技术探索、出口贸易与国际市场的文末增加示范基地牌、研究所、校企合作和出口照片，不展示演示图集和模拟视频。", "结香技术为试验探索，沉香提取物用于日化、药品等为研发方向。"], fields: [["规模数据", "数据摘要", "四项展示", "1万余亩、44万余株、98个种质资源、2.5万余平方米加工园"],["产业链", "有序列表", "必显", "良种选育、标准化种植、精深加工、品牌培育、线上线下销售"],["园区说明", "分节正文", "六节完整展示", "产业源头与种质资源、技术标准、结香探索、精深加工、出口贸易、品牌发展"]], actions: [["纵向阅读", "始终可用", "阅读全部正文", "记录内容曝光"],["返回", "始终展示", "返回首页", "无业务写操作"]], boundary: "按客户提供的文字与确认采用的照片展示；林业服务站不可标注为深加工车间。", states: "加载→完整正文/失败。", logs: "记录内容曝光和加载错误。", empty: "内容加载失败显示重试。", acceptance: ["关键数据准确，长文可完整滚动阅读。", "不出现图集页码或模拟视频入口。"], tech: ["保留内容版本，后续实际媒体须审核后接入。"] },
  "knowledge-article": { goal: "以接近微信公众号的长文结构展示沉香小知识，当前仅展示。", roles: "文化内容读者", entry: "沉香知识卡片", permission: "公开可读", rules: ["详情页只做展示，不提供点赞、评论、分享或交易操作。", "文章标题、来源、更新时间和正文完整呈现。"], fields: [["文章标题", "文本", "必填展示", "对应知识主题"],["文章正文", "富文本", "必填展示", "微信公众号式段落阅读"],["来源与时间", "元信息", "有数据展示", "标记内容来源和更新时间"]], actions: [["返回", "始终展示", "回到知识列表/来源页", "无业务记录"]], boundary: "文章是知识参考，不构成鉴定结论。", states: "加载→文章/失败。", logs: "记录文章曝光与阅读完成。", empty: "文章缺失展示重试。", acceptance: ["正文可滚动阅读且不出现空白页。"], tech: ["富文本需过滤危险标签，图片懒加载。"] },
};

function CurrentPagePrd({ pageKey }: { pageKey: ProductDocPageKey }) {
  const resolvedPageKey = pagePrdDefaults[pageKey] ? pageKey : "home";
  const config = productDocPages[resolvedPageKey];
  const data = pagePrdDefaults[resolvedPageKey];
  const updatedAt = ["news", "news-article", "home"].includes(resolvedPageKey) ? "2026-09-21" : ["provenance", "home", "profile", "certificate-list", "certificate", "chip-help"].includes(resolvedPageKey) ? "2026-09-20" : ["home", "enterprise-custom", "incense-gift", "industrial-park", "provenance"].includes(resolvedPageKey) ? "2026-09-18" : resolvedPageKey === "certificate" || resolvedPageKey === "certificate-list" ? "2026-09-01" : "2026-08-31";
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
          <footer className="product-doc-review-footer"><span>琼南沉香 · {Object.keys(productDocPages).length} 个产品上下文 · 当前：{productDocPages[activePageKey as ProductDocPageKey]?.label.replace(/^P-\d+\s*/, "") || "首页"}</span><button type="button" onClick={() => setOpen(false)}>关闭 PRD</button></footer>
        </> : null}
      </aside>
    </div>,
    document.body,
  );
}

const BINDINGS_STORAGE_KEY = "guangken-bracelet-bindings-v1";
type BraceletBindings = { boundIds: string[]; activeId: string | null };
type BraceletContextValue = { records: CertificateRecord[]; current: CertificateRecord | undefined; remove: (id: string) => boolean; select: (id: string) => void };
const BraceletContext = createContext<BraceletContextValue | null>(null);
function useBracelets() {
  const value = useContext(BraceletContext);
  if (!value) throw new Error("Bracelet context is missing");
  return value;
}
function readBraceletBindings(): BraceletBindings {
  try {
    const saved = JSON.parse(localStorage.getItem(BINDINGS_STORAGE_KEY) || "null");
    // The preview starts with the supplied record; an explicitly saved empty list stays empty.
    if (!saved || !Array.isArray(saved.boundIds)) return { boundIds: [certificateRecords[0].key], activeId: certificateRecords[0].key };
    const boundIds = [...new Set<string>(saved.boundIds.filter((id: unknown) => certificateRecords.some(record => record.key === id)))];
    return { boundIds, activeId: boundIds.includes(saved.activeId) ? saved.activeId : boundIds[0] ?? null };
  } catch { return { boundIds: [certificateRecords[0].key], activeId: certificateRecords[0].key }; }
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
    <button className={`mini-tab-mall${active === "mall" ? " active" : ""}`} aria-label="商城" aria-current={active === "mall" ? "page" : undefined} onClick={onMall}><IdCardIcon aria-hidden="true" /><span>商城</span></button>
    <button className={active === "ask" ? "active" : ""} aria-current={active === "ask" ? "page" : undefined} onClick={onAsk}><ChatBubbleIcon aria-hidden="true" /><span>问帖</span></button>
    <button className={active === "profile" ? "active" : ""} aria-current={active === "profile" ? "page" : undefined} onClick={onProfile}><PersonIcon aria-hidden="true" /><span>我的</span></button>
  </nav>;
}

function BraceletHero({ onOpen }: { onOpen: () => void }) {
  return <button className="bracelet-hero home-reference-hero" data-testid="home-bracelet-hero" data-home-section="home-hero" aria-label="查看海南琼南沉香手串来处" onClick={onOpen}>
    <img className="bracelet-hero-photo" src="/assets/home-reference/hero-boy-banner.png" alt="广垦沉香男孩手持沉香手串" />
    <span className="home-hero-copy">
      <img className="home-hero-logo" src="/assets/home-reference/guangken-chenxiang-logo.png" alt="广垦沉香 Logo" />
      <span className="home-hero-title" role="heading" aria-level={1} aria-label="中国香 世界礼">中国香<span className="home-hero-title-second"><img className="home-hero-cloud" src="/assets/home-reference/cloud-ruyi.svg" alt="" aria-hidden="true" /><span>世界礼</span></span></span>
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

function CertificateDownloadLink({ record, onToast }: { record: CertificateRecord; onToast: (message: string) => void }) {
  if (!record.certificate) return <span className="collection-certificate-pending">证书待补充</span>;
  const certificate = record.certificate;
  const filename = `${record.name}-${certificate.certificateNumber}.jpg`;
  return <a href={certificate.image} download={filename} aria-label={`导出${record.name}电子证书`} onClick={async event => {
    event.preventDefault();
    try {
      const response = await fetch(certificate.image, { method: "HEAD" });
      if (!response.ok) throw new Error("Certificate unavailable");
      const anchor = document.createElement("a"); anchor.href = certificate.image; anchor.download = filename; anchor.click();
      onToast("电子证书已开始下载");
    } catch { onToast("电子证书下载失败，请重试"); }
  }}><FileText aria-hidden="true" /><span>导出电子证书</span></a>;
}
function CollectionArchive({ record }: { record: CertificateRecord }) {
  const toast = useTransientMessage();
  return <><MobileScroll className="app-screen"><main className="screen-content detail-content collection-archive" data-product-doc-page="collection-archive"><p className="page-eyebrow">我的藏品 · 已绑定</p><img className="archive-hero" src={record.image} alt={record.name} /><h2>{record.name}</h2><p className="archive-number">{record.key.toUpperCase()}</p><div className="archive-meta"><span>手串规格<strong>{record.spec}</strong></span><span>证书状态<strong>{record.certificate ? "原件已收录" : "原件待补充"}</strong></span>{record.certificate && <span>证书编号<strong>{record.certificate.certificateNumber}</strong></span>}</div><div className="archive-actions"><CertificateDownloadLink record={record} onToast={toast.show} /></div></main></MobileScroll><PrototypeToast message={toast.message} /></>;
}
const collectionArchiveScreen = (keyboard: ReturnType<typeof useKeyboard>, record: CertificateRecord): FlowScreen => ({
  id: "collection-archive", header: flow => <TopBar title="手串档案" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <CollectionArchive record={record} />,
});

function CollectionShowcase({ flow, keyboard, onToast }: { flow: any; keyboard: ReturnType<typeof useKeyboard>; onToast: (message: string) => void }) {
  const { records, current, select } = useBracelets();
  const rootRef = useRef<HTMLElement>(null);
  const recordIds = records.map(record => record.key).join(",");
  useEffect(() => {
    const carousel = rootRef.current?.querySelector<HTMLElement>(".collection-carousel");
    if (carousel) carousel.scrollLeft = Math.max(0, records.findIndex(record => record.key === current?.key)) * carousel.clientWidth;
  }, [recordIds]);
  const goTo = (index: number) => {
    const carousel = rootRef.current?.querySelector<HTMLElement>(".collection-carousel");
    if (carousel) carousel.scrollTo({ left: index * carousel.clientWidth, behavior: "smooth" });
  };
  return <section ref={rootRef} className="home-collection" data-home-section="home-collection" aria-label="我的藏品" onScrollCapture={event => {
    const carousel = event.target as HTMLElement;
    if (!carousel.classList.contains("collection-carousel") || !carousel.clientWidth) return;
    const record = records[Math.min(records.length - 1, Math.max(0, Math.round(carousel.scrollLeft / carousel.clientWidth)))];
    if (record && record.key !== current?.key) select(record.key);
  }}>
    {current ? <><Carousel className="collection-carousel" contentClassName="collection-carousel-content" ariaLabel="我的藏品轮播">{records.map(record => <article className="collection-card" data-active={record.key === current.key} data-bracelet-id={record.key} key={record.key}>
      <header className="collection-card-header"><h3>我的藏品</h3><CertificateDownloadLink record={record} onToast={onToast} /><button type="button" aria-label={`查看${record.name}档案`} onClick={() => { prepareH5Transition(keyboard); flow.push(collectionArchiveScreen(keyboard, record)); }}>查看档案<ChevronRightIcon aria-hidden="true" /></button></header>
      <div className="collection-card-body"><img src={record.image} alt={record.name} /><div className="collection-card-copy"><div className="collection-name-row"><strong>{record.name}</strong><small><CheckCircledIcon aria-hidden="true" />已绑定</small></div><dl><div><dt>手串编号</dt><dd>{record.key.toUpperCase()}</dd></div><div><dt>规格</dt><dd>{record.spec}</dd></div><div><dt>证书</dt><dd>{record.certificate ? "原件已收录" : "原件待补充"}</dd></div></dl></div><span className="collection-seal" aria-hidden="true">香</span></div>
    </article>)}</Carousel>{records.length > 1 && <nav className="collection-pagination" aria-label="切换我的藏品">{records.map((record, index) => <button type="button" key={record.key} aria-label={`切换到${record.name}`} aria-pressed={record.key === current.key} onClick={() => goTo(index)}><i /></button>)}<span>{records.findIndex(record => record.key === current.key) + 1} / {records.length}</span></nav>}</> : <div className="bracelet-unbound"><div><h3>我的藏品</h3><strong>暂未绑定手串</strong><p>通过 NFC 识别并绑定，查看专属证书与溯源信息。</p></div><button type="button" onClick={() => { prepareH5Transition(keyboard); flow.push(chipHelpScreen(keyboard)); }}>识别说明<ChevronRightIcon /></button></div>}
  </section>;
}
const plantingIntroduction = "曙光农场沉香产业从2019年开始发展。依托得天独厚的自然地理条件和电白沉香产业的区域优势，农场抢抓机遇发展奇楠沉香，按照“生态化、标准化、国际化”的方向推进产业建设。目前沉香种植面积超过1万亩，种植株数超过44万株，其中建有2000亩高效种植示范基地。";
const plantingSections = [
  { title: "种质资源库建设", paragraphs: ["曙光农场与中国林业科学研究院热带林业研究所（热林所）深度合作，共同建成“优良易结香（奇楠）沉香高效培育技术研究示范基地”暨种质资源圃。", "目前共收集保存了98个沉香优良种质资源，为品种选育、改良和产业化开发奠定了坚实的物质基础。"] },
  { title: "技术规范标准化", paragraphs: ["在总结多年种植管理经验的基础上，农场于2024年编制并发布企业标准《奇楠沉香种植技术规范》（Q/GDNSGNC 001-2024）。", "该标准对园地选择、种苗质量、定植技术、水肥管理、树体修剪、病虫害绿色防控等环节作出了详细规定，实现了种植管理的标准化、流程化。"] },
  { title: "结香技术探索", paragraphs: ["在确保树木健康生长的前提下，农场积极试验多种结香技术。除传统人工打孔法外，正与华南农业大学、茂名农林学院等科研团队合作，试验“物理接菌法”等现代生物诱导技术，探索结香周期更短、结香品质更优、对树木伤害更小的可持续结香路径。"] },
];
const parkSections = [
  { title: "产业源头与种质资源", paragraphs: [plantingIntroduction, ...plantingSections[0].paragraphs] },
  ...plantingSections.slice(1),
  { title: "精深加工与应用研发", paragraphs: ["目前已建成25000多平方米的沉香深加工产业园，重点研发方向是沉香提取物在日化、药品等领域的应用，致力于把每一片叶子、每一块木头的价值都发挥到极致。"] },
  { title: "出口贸易与国际市场", paragraphs: ["企业已通过国家濒危物种进出口管理办公室严格审核，并依法取得出口许可，2025年至2026年带动外汇收入近千万元，展现广东农垦优质农产品的国际竞争力。"] },
  { title: "品牌建设与未来发展", paragraphs: ["曙光农场将持续贯彻落实广东农垦集团决策部署，深耕国际市场，强化品牌建设与渠道拓展，致力于将广垦沉香打造成具有国际影响力的品牌。"] },
];
const industryPhotos = {
  export: { src: "/assets/industry/agarwood-export-saudi.jpg", caption: "2025—2026年广垦沉香出口沙特", width: 3072, height: 4096 },
  researchInstitute: { src: "/assets/industry/tropical-crops-research-institute.png", caption: "广东农垦热带作物科学研究所", width: 1826, height: 1013 },
  demonstrationSign: { src: "/assets/industry/demonstration-base-sign.jpg", caption: "易结（棋楠）沉香高效种植和结香示范基地", width: 1080, height: 720 },
  cooperation: { src: "/assets/industry/college-farm-cooperation.png", caption: "农林学院与曙光农场校企合作签约仪式", width: 1389, height: 761 },
  aerial: { src: "/assets/industry/shuguang-plantation-aerial.jpg", caption: "曙光农场沉香种植基地 · 航拍全景", width: 2275, height: 1279 },
  station: { src: "/assets/industry/forestry-service-station.jpg", caption: "园区林业服务站", width: 5280, height: 2970 },
  demonstration: { src: "/assets/industry/efficient-planting-base.jpg", caption: "广垦沉香高效种植示范基地", width: 2275, height: 1279 },
};
function IndustryPhoto({ photo, eager = false }: { photo: typeof industryPhotos.aerial; eager?: boolean }) {
  return <figure className="industry-photo"><img src={photo.src} alt={photo.caption} loading={eager ? "eager" : "lazy"} decoding="async" width={photo.width} height={photo.height} /><figcaption>{photo.caption}</figcaption></figure>;
}
const industrySectionEndPhotos: Partial<Record<string, typeof industryPhotos.aerial>> = {
  "产业源头与种质资源": industryPhotos.demonstrationSign,
  "技术规范标准化": industryPhotos.researchInstitute,
  "结香技术探索": industryPhotos.cooperation,
  "出口贸易与国际市场": industryPhotos.export,
};
function IndustrySections({ sections, plantingPhoto = false }: { sections: typeof plantingSections; plantingPhoto?: boolean }) {
  return <div className="farm-story-list industry-introduction">{sections.map((section, index) => <section key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3>{section.paragraphs.map((paragraph, paragraphIndex) => <div key={paragraph}><p>{paragraph}</p>{plantingPhoto && index === 0 && paragraphIndex === 0 ? <IndustryPhoto photo={industryPhotos.demonstration} /> : null}</div>)}{industrySectionEndPhotos[section.title] ? <IndustryPhoto photo={industrySectionEndPhotos[section.title]!} /> : null}</div></section>)}</div>;
}
const parkMetrics = [["1万", "余亩", "沉香种植面积"], ["44万", "余株", "沉香种植株数"], ["98", "个", "优良种质资源"], ["2.5万", "余㎡", "深加工产业园"]] as const;
function IndustryMetrics({ items }: { items: ReadonlyArray<readonly [string, string, string]> }) {
  return <dl className="industry-metrics">{items.map(([value, unit, label]) => <div key={label}><dt>{label}</dt><dd>{value}<span>{unit}</span></dd></div>)}</dl>;
}
const selectionPosters = {
  "enterprise-custom": { title: "企业定制", image: "/assets/customer-feedback/enterprise-custom-process.jpg", alt: "企业定制流程：需求沟通、方案设计、报价确认、打样制作、批量生产、交付售后；专属顾问一对一服务" },
  "incense-gift": { title: "香道礼盒", image: "/assets/customer-feedback/incense-gift-poster.jpg", alt: "广东农垦广垦香礼，好运香伴，折扣礼包享不停，含礼盒产品及二维码" },
} as const;
type SelectionPosterKey = keyof typeof selectionPosters;
const customizationSteps = [
  ["需求沟通", "确认预算、品类与采购周期"],
  ["方案设计", "提供产品组合与定制方案"],
  ["报价确认", "明确单价、数量与交付周期"],
  ["打样制作", "按需求制作样品并确认"],
  ["批量生产", "车间有序排产，严控品质"],
  ["交付售后", "完成包装、发货与跟进服务"],
] as const;
function SelectionImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return failed ? <div className="selection-poster-error" role="alert"><p>图片暂时无法加载</p><button type="button" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>重新加载</button></div> : <img className={className} key={attempt} src={attempt ? `${src}?retry=${attempt}` : src} alt={alt} onError={() => setFailed(true)} />;
}
function SelectionDetail({ pageKey }: { pageKey: SelectionPosterKey }) {
  const enterprise = pageKey === "enterprise-custom";
  return <MobileScroll className="app-screen selection-detail-scroll"><main className={`selection-detail-page ${pageKey}`} data-product-doc-page={pageKey}>
    {enterprise ? <>
      <header className="customization-hero">
        <img src="/assets/customer-feedback/enterprise-custom-hero.png" alt="米白山水背景中的广垦沉香深绿礼盒" />
        <div className="customization-hero-copy"><p className="customization-hero-eyebrow">广垦沉香甄选</p><h2>企业定制</h2><p className="customization-hero-tagline">以香为礼，让心意更有分量</p><p className="customization-hero-description">传承自然香韵<br />助力企业传递真挚情谊</p></div>
      </header>
      <section className="customization-process" aria-labelledby="customization-process-title"><header><h2 id="customization-process-title">六步定制流程</h2><p>从需求沟通到交付的全链路服务</p></header>
        <ol className="customization-steps" aria-label="企业定制六步流程">{customizationSteps.map(([title, description], index) => <li key={title}><span className="customization-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      </section>
      <section className="customization-service"><h3>专属顾问 <span>一对一服务</span></h3><ul aria-label="定制适用场景">{["团购采购", "节日礼品", "企业伴手礼"].map(label => <li key={label}>{label}</li>)}</ul></section>
    </> : <>
      <header className="selection-detail-heading"><p className="selection-detail-eyebrow">广垦沉香甄选 · 香道礼盒</p><h2>广垦香礼<br /><em>好运香伴</em></h2><p className="selection-detail-deck">雅集赠礼 · 一盒成礼</p></header>
      <figure className="selection-gift-visual"><SelectionImage src="/assets/customer-feedback/incense-gift-products.png" alt="广垦香礼礼盒产品组合：沉香礼盒、香器与礼袋" /><figcaption>以香为礼，心意相随</figcaption></figure>
      <ul className="selection-gift-occasions" aria-label="礼赠场景"><li>雅集赠礼</li><li>节日礼品</li><li>企业伴手礼</li></ul>
      <section className="selection-gift-contact" aria-label="香道礼盒微信二维码"><div><p>礼盒活动</p><h3>折扣礼包<br />享不停</h3><span>微信扫码</span></div><div className="gift-qr-frame"><div className="gift-qr-viewport"><SelectionImage src="/assets/customer-feedback/incense-gift-poster.jpg" alt="香道礼盒微信二维码，来自原宣传图" className="gift-qr-source" /></div></div></section>
    </>}
    <p className="selection-detail-signature">广东农垦 · 广垦沉香</p>
  </main></MobileScroll>;
}
const selectionPosterScreen = (keyboard: ReturnType<typeof useKeyboard>, pageKey: SelectionPosterKey): FlowScreen => ({ id: pageKey, header: flow => <TopBar title={selectionPosters[pageKey].title} back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <SelectionDetail pageKey={pageKey} /> });

const selectionItems = [
  { title: "资讯动态", description: "行业行情、展会信息", background: "/assets/home-selection/news-background-v1.png", destination: "news" },
  { title: "香道礼盒", description: "雅集赠礼 · 一盒成礼", background: "/assets/home-selection/gift-background-v2.png", pageKey: "incense-gift" },
  { title: "企业定制", description: "专属定制 · 国企礼赠", background: "/assets/home-selection/custom-background-v2.png", pageKey: "enterprise-custom" },
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
  const { current: currentBracelet } = useBracelets();
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
  const openCertificate = () => {
    prepareH5Transition(keyboard);
    if (currentBracelet) flow.push(certificateScreen(keyboard, currentBracelet));
    else toast.show("请先通过 NFC 识别并绑定手串");
  };
  const homeRootStyle = { "--home-top-safe": `${device.geometry.safeArea.top}px` } as CSSProperties;
  return <div className={`mini-root-screen home-root-screen${homeScrolled ? " is-scrolled" : ""}`} data-product-doc-page="home" style={homeRootStyle}>
    <MobileScroll className="app-screen mini-root-scroll"><main className="mini-home">
      <div className="mini-home-body">
        <BraceletHero onOpen={openCertificate} />
        <section className="question-section home-reading-card" data-home-section="home-reading">
          <p className="home-ai-tag"><MagicWandIcon aria-hidden="true" /><span>AI 传统文化解读</span></p>
          <h2>以香静心，聊聊心中挂心事</h2>
          <span>借沉香感悟心绪，AI香道文化解读</span>
          <button data-testid="home-reading-action" className="start-reading" aria-label="开始问帖" onClick={openReading}><span>开始问帖</span></button>
        </section>
        <section className="home-selection" data-home-section="home-selection">
          <div className="selection-heading">
            <span><h3>广垦沉香甄选</h3><small>从日常佩戴到香事雅集</small></span>
          </div>
          <div className="selection-grid">
            {selectionItems.map(item => <button className="selection-item" type="button" key={item.title} onClick={() => { if ("destination" in item && item.destination === "news") { prepareH5Transition(keyboard); flow.push(newsScreen(keyboard)); } else if ("pageKey" in item) { prepareH5Transition(keyboard); flow.push(selectionPosterScreen(keyboard, item.pageKey)); } else mall(); }}>
              <img className="selection-item-background" src={item.background} alt="" />
              <span className="selection-item-heading"><strong>{item.title}</strong></span>
              <small className="selection-item-description">{item.description}</small>
            </button>)}
          </div>
        </section>
        <CollectionShowcase flow={flow} keyboard={keyboard} onToast={toast.show} />
        <section className="service-section home-feature-card" data-home-section="home-services" aria-label="手串服务">
  <HomeServiceLink icon={<FileCheck />} title="证书查询" testId="home-certificate-link" ariaLabel="查看证书查询" onClick={openCertificate} />
          <HomeServiceLink icon={<Link2Icon />} title="佩戴养护" onClick={() => { prepareH5Transition(keyboard); flow.push(careScreen(keyboard)); }} />
          <HomeServiceLink icon={<ShieldCheck />} title="防伪溯源" testId="home-provenance-link" onClick={() => { prepareH5Transition(keyboard); if (currentBracelet) flow.push(provenanceScreen(keyboard, currentBracelet)); else toast.show("请先通过 NFC 识别并绑定手串"); }} />
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
  const { records: boundRecords } = useBracelets();
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
            <button aria-label="我的手串" onClick={() => { prepareH5Transition(keyboard); flow.push(certificateListScreen(keyboard)); }}><strong>{boundRecords.length} 串</strong><small>我的手串</small></button>
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
  { label: "工作思考", prompt: "面对工作中的难题，如何梳理思路和行动步骤？" },
  { label: "人际沟通", prompt: "如何更清晰地表达想法，增进沟通与理解？" },
  { label: "自我成长", prompt: "如何制定切实可行的个人成长计划？" },
];
const firstMessage: AgentMessage = { id: 1, role: "agent", text: "我是你的 AI 问事助手。先说说最近最挂心的事，我会再问两三句，然后给你一个传统文化角度的参考。" };

function simulatedReply(userTurn: number): Omit<AgentMessage, "id" | "role"> {
  if (userTurn === 0) return { text: "我们可以一起梳理。先补充三点背景：\n1. 你目前遇到的具体情况是什么？\n2. 最困扰你的问题是什么？\n3. 你希望实现怎样的改变？" };
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
        {thinking ? <article className="fortune-message agent thinking" data-last="true"><div className="fortune-bubble reading-thinking" aria-label="AI正在思考"><span>正在思考…</span><i /><i /><i /></div></article> : null}
      </div>}
    </main></MobileScroll>
    <div className="reading-composer">
      <p className="reading-disclaimer">内容由 AI 生成，仅供娱乐参考</p>
      <div className="reading-input-shell">
        <KeyboardTextarea aria-label="向 AI 问事助手提问" value={draft} disabled={thinking} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={thinking ? "正在思考，请稍候…" : "给 AI 问事发消息"} rows={1} maxLength={160} />
        <button className="reading-send" type="button" aria-label="发送" disabled={thinking || !draft.trim()} onClick={() => send()}><ArrowUpIcon aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}

function BraceletSwipeRow({ record, current, onDelete }: { record: CertificateRecord; current: boolean; onDelete: () => void }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ id: number; x: number; y: number; start: number; last: number; horizontal: boolean } | null>(null);
  const suppressed = useRef(false);
  const finish = (event: React.PointerEvent<HTMLDivElement>, canceled = false) => {
    const session = gesture.current;
    if (!session || session.id !== event.pointerId) return;
    gesture.current = null;
    if (!session.horizontal) return;
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    setOffset(canceled ? session.start : session.last >= 35 ? 80 : 0);
    window.setTimeout(() => { suppressed.current = false; }, 0);
  };
  return <div className="bracelet-swipe-row" data-bracelet-id={record.key} data-open={offset === 80 && !dragging} onPointerDown={event => {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".bracelet-delete")) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: offset, last: offset, horizontal: false };
  }} onPointerMove={event => {
    const session = gesture.current;
    if (!session || session.id !== event.pointerId) return;
    const dx = event.clientX - session.x; const dy = event.clientY - session.y;
    if (!session.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      session.horizontal = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
    }
    event.stopPropagation(); event.preventDefault(); suppressed.current = true;
    session.last = Math.max(0, Math.min(80, session.start - dx)); setOffset(session.last);
  }} onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)} onClickCapture={event => { if (suppressed.current) { event.preventDefault(); event.stopPropagation(); suppressed.current = false; } }}>
    <button type="button" className="bracelet-delete" aria-label={`删除${record.name}`} tabIndex={offset === 80 ? 0 : -1} aria-hidden={offset !== 80} onClick={onDelete}>删除</button>
    <button type="button" className="certificate-list-row" style={{ transform: `translateX(-${offset}px)`, transition: dragging ? "none" : "transform 180ms ease" }} aria-label={record.name} onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setOffset(event.key === "ArrowLeft" ? 80 : 0); } }}>
      <img src={record.image} alt="" /><span><strong>{record.name}</strong><small>{record.certificate ? `${record.certificate.certificateNumber} · 原件已收录` : `${record.spec} · 原件待补充`}</small></span><em>{current ? "当前" : "已绑定"}</em>
    </button>
  </div>;
}

function BraceletList({ keyboard }: { keyboard: ReturnType<typeof useKeyboard> }) {
  const { records, current, remove } = useBracelets();
  const [deleting, setDeleting] = useState<CertificateRecord | null>(null);
  const toast = useTransientMessage();
  return <><MobileScroll className="app-screen"><main className="screen-content detail-content certificate-list" data-product-doc-page="certificate-list">
    {records.length ? <div className="certificate-list-rows">{records.map(record => <BraceletSwipeRow key={record.key} record={record} current={current?.key === record.key} onDelete={() => { prepareH5Transition(keyboard); setDeleting(record); }} />)}</div> : <div className="bracelet-list-empty"><Link2Icon /><h2>暂未绑定手串</h2><p>通过 NFC 识别手串并确认绑定后，<br />即可在这里管理。</p></div>}
  </main></MobileScroll>
    <BottomSheet open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }} title="删除这串手串？" description="删除后将解除与你的账号的绑定" snap={0.46}>
      <div className="authorization-gate binding-confirm"><strong>{deleting?.name}</strong><p>首页证书、溯源和藏品将同步更新。手串原始信息保留，可再次通过 NFC 识别绑定。</p><button className="binding-delete-confirm" onClick={() => { const saved = deleting ? remove(deleting.key) : true; setDeleting(null); toast.show(saved ? "已解除绑定" : "已解除绑定，本次状态暂无法保存"); }}>确认删除</button><button className="authorization-cancel" onClick={() => setDeleting(null)}>取消</button></div>
    </BottomSheet>
    <PrototypeToast message={toast.message} />
  </>;
}
const certificateListScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "certificate-list", header: flow => <TopBar title="我的手串" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <BraceletList keyboard={keyboard} />,
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
const certificateScreen = (keyboard: ReturnType<typeof useKeyboard>, record: CertificateRecord): FlowScreen => ({
  id: "certificate",
  header: flow => <TopBar title="证书详情" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <CertificateDetail record={record} />,
});
const provenanceScreen = (keyboard: ReturnType<typeof useKeyboard>, record: CertificateRecord): FlowScreen => ({
  id: "provenance",
  header: flow => <TopBar title="防伪溯源" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="screen-content detail-content provenance-detail" data-product-doc-page="provenance">
    <p className="page-eyebrow">广垦沉香 · 从种植到手串</p><h2>一串沉香的来处</h2>
    <p className="provenance-product-name">{record.name}</p>
    {record.key === "cx-2018-072" ? <>
      <div className="provenance-passport"><ShieldCheck aria-hidden="true" /><div><span>手串唯一编号</span><strong>待补充</strong></div></div>
      <div className="provenance-overview"><span>种植年份<strong>2019 年</strong></span><span>手串规格<strong>待补充</strong></span><span>出厂年份<strong>2026 年</strong></span></div>
      <section className="provenance-journey" aria-label="本串五站溯源记录">{provenanceStages.map((stage, index) => <article className="provenance-stage" key={stage.title}>
        <header className="provenance-stage-heading"><span className="provenance-stage-number">{String(index + 1).padStart(2, "0")}</span><div><p>第 {index + 1} 站 · {stage.label}</p><h3>{stage.title}</h3></div><time>{stage.date}</time></header>
        <p className="provenance-stage-body">{stage.body}</p>
        {stage.photos.length > 0 && <Carousel className="provenance-photos" contentClassName="provenance-photo-track" ariaLabel={`${stage.title}现场照片`}>{stage.photos.map(([file, caption]) => <figure key={file}><img src={`/assets/provenance/revised-2026-09-18/${file}`} alt={caption} loading="lazy" /><figcaption>{caption}</figcaption></figure>)}</Carousel>}
        <section className="provenance-stage-data" aria-label="详细数据"><h4>详细数据</h4><dl className="certificate-fields">{stage.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      </article>)}</section>
    </> : <div className="certificate-empty"><strong>本串溯源信息待补充</strong><p>手串编号：{record.key.toUpperCase()}</p><p>尚未收录这串手串的种植、造香、采收、加工制作与成品记录。</p></div>}
  </main></MobileScroll>,
});
const readingRecordsScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "reading-records", header: flow => <TopBar title="问帖记录" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content detail-content" data-product-doc-page="reading-records"><p className="page-eyebrow">我的香事</p><h2>每一次问帖，<br /><em>都可以继续。</em></h2><button className="reading-record-row" onClick={() => { prepareH5Transition(keyboard); flow.push(readingRecordDetailScreen(keyboard)); }}><span><strong>新的合作是否适合推进？</strong><small>三天前</small></span><p>先用七天小目标验证合作可靠性。</p><ChevronRightIcon /></button></main></MobileScroll> });
const readingRecordDetailScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "reading-record-detail", header: flow => <TopBar title="问帖详情" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: flow => <MobileScroll className="app-screen"><main className="screen-content detail-content history-detail-content" data-product-doc-page="reading-record-detail"><p className="page-eyebrow">三天前 · 合作</p><h2>新的合作是否适合推进？</h2><div className="reading-log history-transcript" aria-label="历史问帖对话">{historicalMessages.map(message => <article className={`fortune-message ${message.role}`} key={message.id}><div className="fortune-bubble">{message.role === "agent" ? renderAgentText(message.text) : <p>{message.text}</p>}</div></article>)}</div><button className="primary-action" onClick={() => { prepareH5Transition(keyboard); flow.push(interpretScreen(keyboard)); }}>开启新问帖</button></main></MobileScroll> });
const chipHelpScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({ id: "chip-help", header: flow => <TopBar title="芯片识别说明" back={flow.pop} keyboard={keyboard} />, headerHeight: 54, render: () => <MobileScroll className="app-screen"><main className="screen-content article-content" data-product-doc-page="chip-help"><p className="page-eyebrow">使用帮助</p><h2>轻触 NFC，<br /><em>识别你的手串。</em></h2><p className="lead">将手机靠近手串芯片，识别成功后确认绑定，即可查看对应的证书、溯源与藏品信息。</p><div className="help-steps">{[["01", "轻触手串芯片", "将手机 NFC 感应区贴近手串芯片。"], ["02", "识别后确认是否绑定", "确认绑定后显示本串证书、溯源与藏品；暂不绑定不会加入我的手串。"], ["03", "识别失败时重新贴近", "保持手机稳定，调整位置后再试一次。"]].map(([number, title, text]) => <section key={title}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></section>)}</div><p className="help-note">芯片不会直接开始问帖，只用于识别对应手串。</p></main></MobileScroll> });
const newsArticles = [
  { id: "industry-observation", category: "行业行情", title: "沉香行业观察：从原料到成品", summary: "从产地、规格与加工环节，了解行业信息的阅读角度。", image: "/assets/industry/shuguang-plantation-aerial.jpg", sections: [["先看信息口径", "阅读行业资讯时，可以先核对资料所对应的原料或成品、规格与发布背景。不同条件下的信息不宜直接放在一起比较。"], ["再看产品与来源", "从种植、加工到成品展示，关注各环节提供的资料是否完整。产地介绍、产品说明与可核验的记录应分别阅读。"], ["持续关注公开信息", "本篇用于展示行业观察类内容的阅读形式。正式行情以发布主体提供并核实的信息为准。"]] },
  { id: "exhibition-guide", category: "展会信息", title: "沉香展会看点：产品与香文化", summary: "从产品展示到香文化体验，梳理逛展时值得关注的内容。", image: "/assets/home-selection/news-background-v1.png", sections: [["了解展会安排", "参观前可通过主办方正式公告了解展会时间、地点、展区和入场方式。此处为示例阅读内容，不对应具体展会或报名活动。"], ["关注展示内容", "逛展时可以围绕沉香原材、香品、工艺与文化体验整理观察记录，并向展商了解展品说明及资料来源。"], ["保留交流记录", "将感兴趣的展品信息和交流要点分开记录，方便展后进一步核实。本栏目后续可承载正式展讯与展会回顾。"]] },
  { id: "industry-chain", category: "行业行情", title: "产业链观察：走近沉香种植与加工", summary: "沿着种植、加工与产品展示，认识沉香产业链。", image: "/assets/industry/forestry-service-station.jpg", sections: [["从种植环节开始", "产业链内容可以按种植管理、采收、加工和成品展示依次阅读，先了解各个环节的职责与衔接方式。"], ["关注过程记录", "阅读加工介绍时，区分工艺说明、试验探索与已完成的成果。具体产品信息仍需查看与其对应的资料。"], ["让信息有据可查", "本篇为栏目内容示例。正式发布时应补充核实后的来源与资料，避免以通用行业介绍代替单件产品的证明。"]] },
  { id: "exhibition-checklist", category: "展会信息", title: "逛展指南：把感兴趣的香品记下来", summary: "整理展品信息与交流要点，让一次参观更有收获。", image: "/assets/customer-feedback/knowledge-care-tea.png", sections: [["带着主题去看展", "可以围绕日常用香、礼赠或香文化体验提前列出关注点，按自己的兴趣安排参观路线。"], ["记下展品说明", "记录展商名称、展品名称与现场提供的介绍，保留后续查阅的线索。不同展品的体验感受可以分别整理。"], ["展后再做梳理", "将现场观察和对方提供的资料分开保存，尚未确认的信息留待核实。本篇不涉及具体展会安排或购买推荐。"]] },
] as const;

const newsScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "news", header: flow => <TopBar title="资讯动态" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: flow => <MobileScroll className="app-screen"><main className="screen-content news-list-page" data-product-doc-page="news">
    <div className="news-list-intro"><p>行业行情、展会信息</p><small>示例内容</small></div>
    <section aria-label="资讯动态列表">{newsArticles.map(article => <button key={article.id} type="button" className="home-knowledge-row news-list-row" aria-label={article.title} onClick={() => { prepareH5Transition(keyboard); flow.push(newsArticleScreen(keyboard, article)); }}>
      <img src={article.image} alt="" /><span><strong>{article.title}</strong><small>{article.summary}</small><span className="news-category">{article.category}</span></span>
    </button>)}</section>
  </main></MobileScroll>,
});
const newsArticleScreen = (keyboard: ReturnType<typeof useKeyboard>, article: typeof newsArticles[number]): FlowScreen => ({
  id: "news-article", header: flow => <TopBar title="资讯详情" back={flow.pop} keyboard={keyboard} />, headerHeight: 54,
  render: () => <MobileScroll className="app-screen"><main className="wechat-article news-article" data-product-doc-page="news-article"><article>
    <img className="wechat-article-hero" src={article.image} alt="" /><h1>{article.title}</h1>
    <div className="wechat-article-meta"><strong>{article.category}</strong><span>示例内容</span></div>
    <p className="wechat-article-lead">{article.summary}</p>{article.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
  </article></main></MobileScroll>,
});
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
  const [bindings, setBindings] = useState<BraceletBindings>(readBraceletBindings);
  const [authorized, setAuthorized] = useState(() => { try { return localStorage.getItem("guangken-demo-authorized") === "true"; } catch { return false; } });
  const [pending, setPending] = useState<CertificateRecord | null>(null);
  const [bindingAuthOpen, setBindingAuthOpen] = useState(false);
  const [scanChoice, setScanChoice] = useState(() => certificateRecords.find(record => !bindings.boundIds.includes(record.key))?.key ?? certificateRecords[0].key);
  const [demoOpen, setDemoOpen] = useState(() => window.innerWidth > 900);
  const [scanSession, setScanSession] = useState(0);
  const toast = useTransientMessage();
  const records = bindings.boundIds.map(id => certificateRecords.find(record => record.key === id)!).filter(Boolean);
  const current = records.find(record => record.key === bindings.activeId);
  const authorize = () => {
    setAuthorized(true);
    try { localStorage.setItem("guangken-demo-authorized", "true"); } catch { /* Authorization is available for this session. */ }
  };
  const persist = (next: BraceletBindings) => {
    setBindings(next);
    try { localStorage.setItem(BINDINGS_STORAGE_KEY, JSON.stringify(next)); return true; }
    catch { return false; }
  };
  const scan = (id: string) => {
    if (window.innerWidth <= 900) setDemoOpen(false);
    prepareH5Transition(keyboard);
    const record = certificateRecords.find(item => item.key === id);
    if (!record) { toast.show("未识别到有效手串，请重新识别"); return; }
    setScanSession(value => value + 1);
    if (bindings.boundIds.includes(id)) {
      const saved = persist({ ...bindings, activeId: id });
      setPending(null);
      toast.show(saved ? "该手串已绑定，已切换为当前手串" : "已切换，本次状态暂无法保存");
    } else setPending(record);
  };
  useEffect(() => {
    const url = new URL(window.location.href);
    const scannedId = url.searchParams.get("nfc");
    if (scannedId !== null) {
      url.searchParams.delete("nfc");
      window.history.replaceState(null, "", url);
      scan(scannedId);
    }
  }, []);
  const completeBinding = () => {
    if (!pending) return;
    const saved = persist({ boundIds: [...new Set([...bindings.boundIds, pending.key])], activeId: pending.key });
    setPending(null); setBindingAuthOpen(false);
    toast.show(saved ? "绑定成功" : "已绑定，本次状态暂无法保存");
  };
  const remove = (id: string) => {
    const boundIds = bindings.boundIds.filter(key => key !== id);
    return persist({ boundIds, activeId: bindings.activeId === id ? boundIds[0] ?? null : bindings.activeId });
  };
  return <AuthorizationContext.Provider value={{ authorized, authorize }}><BraceletContext.Provider value={{ records, current, remove, select: id => { if (bindings.boundIds.includes(id)) persist({ ...bindings, activeId: id }); } }}>
    <FlowStack key={scanSession} initial={homeScreen(keyboard)} />
    <ProductDocumentReview />
    {createPortal(<aside className="nfc-demo-controls" data-expanded={demoOpen} aria-label="NFC 原型演示">
      <button type="button" className="nfc-demo-toggle" aria-label="NFC 模拟场景" aria-expanded={demoOpen} aria-controls="nfc-demo-options" onClick={() => setDemoOpen(value => !value)}>NFC 模拟场景<span aria-hidden="true">{demoOpen ? "收起" : "展开"}</span></button>
      {demoOpen && <div id="nfc-demo-options" className="nfc-demo-options">
        <select aria-label="模拟识别的手串" value={scanChoice} onChange={event => setScanChoice(event.target.value)}>{certificateRecords.map(record => <option key={record.key} value={record.key}>{record.name} · {bindings.boundIds.includes(record.key) ? "已绑定" : "未绑定"}</option>)}</select>
        <small>{bindings.boundIds.includes(scanChoice) ? "已绑定手串：重复识别会切换到该藏品" : "未绑定手串：识别后弹出绑定确认"}</small>
        <button type="button" onClick={() => scan(scanChoice)}>模拟 NFC 识别</button>
        <button type="button" onClick={() => { persist({ boundIds: [...new Set([...bindings.boundIds, certificateRecords[0].key])], activeId: certificateRecords[0].key }); setPending(null); setBindingAuthOpen(false); setScanSession(value => value + 1); if (window.innerWidth <= 900) setDemoOpen(false); toast.show("已载入有证书与溯源的绑定示例"); }}>查看已绑定示例</button>
        <small>预置绑定仅供演示，不读取真实芯片</small>
      </div>}
    </aside>, document.body)}
    <BottomSheet open={pending !== null && !bindingAuthOpen} onOpenChange={open => { if (!open) setPending(null); }} title="是否绑定这串手串？" description="绑定后可查看对应的证书、溯源与藏品" snap={0.51}>
      <div className="authorization-gate binding-confirm">{pending && <div className="binding-bracelet"><img src={pending.image} alt={pending.name} /><div><strong>{pending.name}</strong><span>{pending.key.toUpperCase()} · {pending.spec}</span></div></div>}<p>确认将这串手串加入“我的手串”。</p><button onClick={() => { if (authorized) completeBinding(); else setBindingAuthOpen(true); }}>确认绑定</button><button className="authorization-cancel" onClick={() => setPending(null)}>暂不绑定</button></div>
    </BottomSheet>
    <AuthorizationSheet open={bindingAuthOpen} onOpenChange={open => { setBindingAuthOpen(open); if (!open) setPending(null); }} title="需要微信授权" buttonLabel="微信授权并绑定" description="授权后将手串绑定至你的账号" message="用于保存这串手串的绑定关系，之后可在“我的手串”中查看和管理。" onAuthorize={() => { authorize(); completeBinding(); }} />
    <PrototypeToast message={toast.message} />
  </BraceletContext.Provider></AuthorizationContext.Provider>;
}
