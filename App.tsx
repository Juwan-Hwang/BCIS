import React, { useState, useEffect } from 'react';
import { processMRZ } from './utils/mrzParser';
import { MrzResult } from './types';
import { MrzVisualizer } from './components/MrzVisualizer';

// --- I18N DICTIONARY ---
const I18N: Record<string, Record<string, string>> = {
    zh: {
        app_title: "出入境证件鉴别与研判系统",
        pnl_input: "数据采集 (TD3 / TD2 / TD1 / MRV)",
        btn_analyze: "执行查验",
        btn_clear: "清空重置",
        lbl_autofix: "智能 OCR 纠错",
        lbl_integrity: "数据完整性",
        lbl_validity: "证件状态",
        lbl_risk: "风险等级评估",
        lbl_age: "持证人年龄",
        pnl_bio: "持证人身份信息",
        th_surname: "英文姓 (Surname)",
        th_given: "英文名 (Given Names)",
        th_gender: "性别",
        th_dob: "出生日期",
        th_nat: "国籍/地区代码",
        lbl_native: "扩展数据解析结果",
        pnl_doc: "证件技术参数",
        th_type: "证件细分类型",
        th_iss: "签发机关",
        th_doc_no: "证件号码",
        th_exp: "有效期至",
        th_rem: "剩余有效期",
        th_final: "总校验位",
        pnl_viz: "数据透视与校验位验证",
        val_pass: "校验通过",
        val_fail: "校验失败",
        val_valid: "有效",
        val_expired: "已过期",
        val_near: "临近过期",
        val_risk_low: "低风险",
        val_risk_med: "中风险",
        val_risk_high: "高风险 (已过期)",
        val_risk_crit: "极高风险 (数据校验失败)",
        val_risk_sus: "风险告警 (可疑数据)",
        sex_m: "男 (MALE)",
        sex_f: "女 (FEMALE)",
        sex_x: "未说明 (X)",
        log_prefix: "自动纠错系统已触发：",
        
        // --- Document Types ---
        type_visa: "机器可读签证 (MRV-A / MRV-B)",
        type_chn_po: "中华人民共和国普通护照",
        type_chn_pe: "中华人民共和国电子普通护照",
        type_hkg: "中国香港特区护照",
        type_mac: "中国澳门特区护照",
        type_chn_eep: "往来港澳/台湾通行证",
        type_eep_hk: "往来港澳通行证 (双程证)",
        type_eep_tw: "往来台湾通行证 (卡式台胞证)",
        
        type_usa_p: "美国护照 (USA PASSPORT)",
        type_usa_id: "美国护照卡 (USA PASSPORT CARD)",
        type_gbr_p: "英国护照 (UK PASSPORT)",
        type_can_p: "加拿大护照 (CANADA PASSPORT)",
        type_aus_p: "澳大利亚护照 (AUSTRALIA PASSPORT)",
        type_nzl_p: "新西兰护照 (NEW ZEALAND PASSPORT)",
        type_fra_p: "法国护照 (FRANCE PASSPORT)",
        type_fra_id: "法国身份证 (FRANCE ID CARD)",
        type_deu_p: "德国护照 (GERMANY PASSPORT)",
        type_deu_id: "德国身份证 (GERMANY ID CARD)",
        type_ita_p: "意大利护照 (ITALY PASSPORT)",
        type_ita_id: "意大利身份证 (ITALY ID CARD)",
        type_esp_p: "西班牙护照 (SPAIN PASSPORT)",
        type_esp_id: "西班牙身份证 (SPAIN ID CARD)",
        type_nld_p: "荷兰护照 (NETHERLANDS PASSPORT)",
        type_nld_id: "荷兰身份证 (NETHERLANDS ID CARD)",
        type_pol_p: "波兰护照 (POLAND PASSPORT)",
        type_pol_id: "波兰身份证 (POLAND ID CARD)",
        type_ukr_p: "乌克兰护照 (UKRAINE PASSPORT)",
        type_ukr_id: "乌克兰身份证 (UKRAINE ID CARD)",
        type_rus_p: "俄罗斯护照 (RUSSIA PASSPORT)",
        type_jpn_p: "日本护照 (JAPAN PASSPORT)",
        type_kor_p: "韩国护照 (ROK PASSPORT)",
        type_bra_p: "巴西护照 (BRAZIL PASSPORT)",
        type_ind_p: "印度护照 (INDIA PASSPORT)",
        type_sgp_p: "新加坡护照 (SINGAPORE PASSPORT)",
        type_mys_p: "马来西亚护照 (MALAYSIA PASSPORT)",
        type_tha_p: "泰国护照 (THAILAND PASSPORT)",
        
        // Expanded Countries
        type_che_p: "瑞士护照 (SWISS PASSPORT)",
        type_che_id: "瑞士身份证 (SWISS ID CARD)",
        type_bel_p: "比利时护照 (BELGIUM PASSPORT)",
        type_bel_id: "比利时身份证 (BELGIUM ID CARD)",
        type_aut_p: "奥地利护照 (AUSTRIA PASSPORT)",
        type_aut_id: "奥地利身份证 (AUSTRIA ID CARD)",
        type_prt_p: "葡萄牙护照 (PORTUGAL PASSPORT)",
        type_prt_id: "葡萄牙公民卡 (PORTUGAL CITIZEN CARD)",
        type_grc_p: "希腊护照 (GREECE PASSPORT)",
        type_grc_id: "希腊身份证 (GREECE ID CARD)",
        type_tur_p: "土耳其护照 (TURKEY PASSPORT)",
        type_tur_id: "土耳其身份证 (TURKEY ID CARD)",
        type_isr_p: "以色列护照 (ISRAEL PASSPORT)",

        // Fallbacks
        type_gen_p: "通用电子护照 (ICAO TD3)",
        type_gen_id: "通用机读证件 (ICAO TD1/TD2)",
        type_other: "其他 / 国际旅行证件",

        lbl_chn_id: "芯片隐形信息解析 (GBK)",
        lbl_hk_id: "香港身份证号码",
        lbl_mo_id: "澳门身份证号码",
        lbl_personal_no: "行政编号 / 个人识别码",
        lbl_struct_check: "证件结构化检测",
        risk_name_mismatch: "可疑：中文姓名拼音与 MRZ 不匹配",
        risk_truncation_err: "可疑：姓名截断逻辑校验失败",
        risk_truncation_logic: "严重警告：截断标识与剩余空间冲突",
        risk_truncation_len_mismatch: "可疑：截断标识显示有隐藏字符但 MRZ 长度不足",
        risk_truncation_vowel: "严重警告：MRZ 隐藏部分长度不足以构成指定数量的汉字音节",
        risk_opt_check_fail: "数据异常：扩展/可选数据域校验位错误"
    },
    en: {
        app_title: "BORDER CONTROL INTELLIGENCE SYSTEM",
        pnl_input: "DATA INGESTION (TD3 / TD2 / TD1 / MRV)",
        btn_analyze: "ANALYZE",
        btn_clear: "RESET",
        lbl_autofix: "SMART OCR",
        lbl_integrity: "DATA INTEGRITY",
        lbl_validity: "DOC STATUS",
        lbl_risk: "RISK LEVEL",
        lbl_age: "SUBJECT AGE",
        pnl_bio: "SUBJECT BIOGRAPHY",
        th_surname: "SURNAME",
        th_given: "GIVEN NAMES",
        th_gender: "SEX",
        th_dob: "DATE OF BIRTH",
        th_nat: "NATIONALITY/REGION",
        lbl_native: "EXTENDED DECODE",
        pnl_doc: "DOCUMENT SPECS",
        th_type: "DOC TYPE",
        th_iss: "ISSUING AUTHORITY",
        th_doc_no: "DOCUMENT NO.",
        th_exp: "EXPIRY DATE",
        th_rem: "TIME REMAINING",
        th_final: "TOTAL CHECK DIGIT",
        pnl_viz: "DATA VISUALIZATION",
        val_pass: "PASSED",
        val_fail: "FAILED",
        val_valid: "VALID",
        val_expired: "EXPIRED",
        val_near: "NEAR EXPIRY",
        val_risk_low: "LOW",
        val_risk_med: "MEDIUM",
        val_risk_high: "HIGH (EXPIRED)",
        val_risk_crit: "CRITICAL (CHECK FAIL)",
        val_risk_sus: "SUSPICIOUS DATA DETECTED",
        sex_m: "MALE",
        sex_f: "FEMALE",
        sex_x: "UNSPECIFIED",
        log_prefix: "OCR FIXED: ",
        
        type_visa: "Machine Readable Visa (MRV-A/B)",
        type_chn_po: "PRC Ordinary Passport",
        type_chn_pe: "PRC E-Passport",
        type_hkg: "HKSAR Passport",
        type_mac: "Macau SAR Passport",
        type_chn_eep: "EEP to HK/Macau/Taiwan",
        type_eep_hk: "EEP to HK/Macau",
        type_eep_tw: "EEP to Taiwan",
        
        type_usa_p: "USA Passport",
        type_usa_id: "USA Passport Card",
        type_gbr_p: "United Kingdom Passport",
        type_can_p: "Canada Passport",
        type_aus_p: "Australia Passport",
        type_nzl_p: "New Zealand Passport",
        type_fra_p: "France Passport",
        type_fra_id: "France ID Card",
        type_deu_p: "Germany Passport",
        type_deu_id: "Germany ID Card",
        type_ita_p: "Italy Passport",
        type_ita_id: "Italy ID Card",
        type_esp_p: "Spain Passport",
        type_esp_id: "Spain ID Card",
        type_nld_p: "Netherlands Passport",
        type_nld_id: "Netherlands ID Card",
        type_pol_p: "Poland Passport",
        type_pol_id: "Poland ID Card",
        type_ukr_p: "Ukraine Passport",
        type_ukr_id: "Ukraine ID Card",
        type_rus_p: "Russia Passport",
        type_jpn_p: "Japan Passport",
        type_kor_p: "South Korea Passport",
        type_bra_p: "Brazil Passport",
        type_ind_p: "India Passport",
        type_sgp_p: "Singapore Passport",
        type_mys_p: "Malaysia Passport",
        type_tha_p: "Thailand Passport",

        // Expanded Countries
        type_che_p: "Switzerland Passport",
        type_che_id: "Switzerland ID Card",
        type_bel_p: "Belgium Passport",
        type_bel_id: "Belgium ID Card",
        type_aut_p: "Austria Passport",
        type_aut_id: "Austria ID Card",
        type_prt_p: "Portugal Passport",
        type_prt_id: "Portugal Citizen Card",
        type_grc_p: "Greece Passport",
        type_grc_id: "Greece ID Card",
        type_tur_p: "Turkey Passport",
        type_tur_id: "Turkey ID Card",
        type_isr_p: "Israel Passport",

        type_gen_p: "Standard E-Passport (TD3)",
        type_gen_id: "Standard ID Card (TD1/TD2)",
        type_other: "OTHER / INTERNATIONAL DOC",

        lbl_chn_id: "Hidden Data Decode (GBK)",
        lbl_hk_id: "HKID Number",
        lbl_mo_id: "Macau ID Number",
        lbl_personal_no: "Admin Code / Personal ID",
        lbl_struct_check: "Structure Analysis",
        risk_name_mismatch: "SUSPICIOUS: Chinese Name Pinyin Mismatch",
        risk_truncation_err: "SUSPICIOUS: Truncation Logic Mismatch",
        risk_truncation_logic: "CRITICAL: Truncation Tag Conflicts with Buffer Capacity",
        risk_truncation_len_mismatch: "SUSPICIOUS: Truncation Tag implies Hidden Chars, but MRZ is short",
        risk_truncation_vowel: "CRITICAL: MRZ suffix insufficient for claimed syllable count",
        risk_opt_check_fail: "ANOMALY: Optional Data Check Digit Failed"
    }
};

// -- COMPONENTS --

const StatBox = ({ label, value, status }: { label: string, value: string, status: 'ok' | 'warn' | 'fail' }) => {
    // Styles matching original V15
    const styles = {
        ok: { bg: 'bg-green-50', border: 'border-green-600', text: 'text-green-700' },
        warn: { bg: 'bg-amber-50', border: 'border-amber-600', text: 'text-amber-700' },
        fail: { bg: 'bg-red-50', border: 'border-red-700', text: 'text-red-700' }
    };
    const s = styles[status];
    
    return (
        <div className={`border border-slate-300 p-3 flex flex-col border-l-4 ${s.bg} ${s.border}`}>
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</div>
            <div className={`text-[15px] font-bold ${s.text}`}>{value}</div>
        </div>
    );
};

const DataRow = ({ label, value, mono = false }: { label: string, value: React.ReactNode, mono?: boolean }) => (
    <tr className="border-b border-slate-200">
        <td className="w-[35%] py-1.5 px-2 text-[10px] text-slate-600 font-bold uppercase align-middle">{label}</td>
        <td className={`py-1.5 px-2 text-[12px] font-bold text-slate-900 align-middle break-all ${mono ? 'font-mono' : ''}`}>
            {value || '--'}
        </td>
    </tr>
);

const CalcLog = ({ line }: { line: string }) => {
    const isOk = line.includes("Result: OK");
    const parts = line.split("Result: ");
    const mainText = parts[0];
    const resText = parts[1] || "";
    
    return (
        <div className="border-b border-dashed border-slate-200 py-0.5 last:border-0">
            {mainText}Result: <span className={isOk ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{resText}</span>
        </div>
    );
};

export default function App() {
    const [input, setInput] = useState('');
    const [autoFix, setAutoFix] = useState(true);
    const [result, setResult] = useState<MrzResult | null>(null);
    const [lang, setLang] = useState<'zh' | 'en'>('zh');
    const [sysTime, setSysTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setSysTime(new Date().toLocaleTimeString('en-GB'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const t = (key: string) => I18N[lang][key] || key;

    const handleAnalyze = () => {
        if (!input.trim()) return;
        const res = processMRZ(input, autoFix);
        setResult(res);
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
    };

    // Derived State
    const integrityStatus = result?.valid ? 'ok' : 'fail';
    const daysLeft = result?.parsed.daysRemaining;
    let validityStatus: 'ok' | 'warn' | 'fail' = 'ok';
    let validityText = t('val_valid');
    let riskStatus: 'ok' | 'warn' | 'fail' = 'ok';
    let riskText = t('val_risk_low');

    if (daysLeft !== null && daysLeft !== undefined) {
        if (daysLeft < 0) {
            validityStatus = 'fail'; validityText = t('val_expired');
            riskStatus = 'fail'; riskText = t('val_risk_high');
        } else if (daysLeft < 180) {
            validityStatus = 'warn'; validityText = t('val_near');
            riskStatus = 'warn'; riskText = t('val_risk_med');
        }
    }
    if (!result?.valid) {
        riskStatus = 'fail'; riskText = t('val_risk_crit');
    }
    
    // Explicit Risk Overrides
    if (result?.risks && result.risks.length > 0) {
        riskStatus = 'fail';
        riskText = t('val_risk_sus');
    }

    // Gender Text
    let genderText = t('sex_x');
    if (result?.fields.sex === 'M') genderText = t('sex_m');
    if (result?.fields.sex === 'F') genderText = t('sex_f');

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans text-[13px] pb-20">
            {/* TOP BAR */}
            <div className="h-12 bg-slate-900 text-slate-200 border-b-[3px] border-amber-600 flex items-center justify-between px-5">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                    <div className="font-extrabold tracking-[0.1em] text-[16px] uppercase" data-i18n="app_title">
                        {t('app_title')} <span className="text-[12px] opacity-70">[BCIS-V15]</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span>{sysTime || "00:00:00"}</span>
                    <span className="opacity-50">|</span>
                    <span>MODE: OFFLINE</span>
                    <span className="opacity-50">|</span>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setLang('zh')}
                            className={`px-2 py-0.5 border rounded ${lang === 'zh' ? 'bg-slate-200 text-slate-900 border-white font-bold' : 'border-slate-600 hover:bg-slate-800'}`}
                        >
                            中文
                        </button>
                        <span className="opacity-50 px-1">/</span>
                        <button 
                             onClick={() => setLang('en')}
                             className={`px-2 py-0.5 border rounded ${lang === 'en' ? 'bg-slate-200 text-slate-900 border-white font-bold' : 'border-slate-600 hover:bg-slate-800'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto p-5 grid gap-4">
                
                {/* INPUT PANEL */}
                <div className="bg-white border border-slate-400">
                    <div className="bg-slate-200 px-3 py-2 border-b border-slate-400 flex justify-between items-center text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                        <span>{t('pnl_input')}</span>
                        <span>TD3 (Passport) / TD1 (Card/Permit)</span>
                    </div>
                    
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder=">> SCAN PASSPORT OR CARD MRZ HERE..."
                        className="w-full h-20 bg-slate-900 text-green-500 font-mono text-[16px] p-3 border-none outline-none resize-y uppercase tracking-widest placeholder:text-slate-700 block"
                        spellCheck={false}
                    />
                    
                    <div className="bg-slate-50 border-t border-slate-300 p-2 flex gap-2 items-center flex-wrap">
                        <button onClick={handleAnalyze} className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 px-3 py-1 text-[11px] font-bold uppercase min-w-[80px]">
                            {t('btn_analyze')}
                        </button>
                        <button onClick={handleClear} className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-400 px-3 py-1 text-[11px] font-bold uppercase min-w-[80px]">
                            {t('btn_clear')}
                        </button>
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-200 px-2 py-1 border border-slate-300 ml-2">
                            <input type="checkbox" checked={autoFix} onChange={e => setAutoFix(e.target.checked)} />
                            <span className="text-[11px] font-bold text-slate-700">{t('lbl_autofix')}</span>
                        </label>
                    </div>
                </div>

                {/* RESULTS */}
                {result && (
                    <div className="grid gap-4">
                        
                        {result.logs.length > 0 && (
                            <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 p-2 text-[11px] font-mono">
                                <span className="font-bold">{t('log_prefix')}</span> {result.logs.join('; ')}
                            </div>
                        )}

                        {result.risks && result.risks.length > 0 && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-900 p-3 text-[12px] font-bold animate-pulse">
                                {result.risks.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>{t(r.messageKey)}</span>
                                        {r.details && <span className="font-mono text-[11px] bg-red-200 px-1 rounded ml-2">{r.details}</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STATUS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox label={t('lbl_integrity')} value={result.valid ? `[OK] ${t('val_pass')}` : `[FAIL] ${t('val_fail')}`} status={integrityStatus} />
                            <StatBox label={t('lbl_validity')} value={validityText} status={validityStatus} />
                            <StatBox label={t('lbl_risk')} value={riskText} status={riskStatus} />
                            <StatBox label={t('lbl_age')} value={result.parsed.age ? `${result.parsed.age}` : "--"} status={result.parsed.age ? 'ok' : 'warn'} />
                        </div>

                        {/* INFO CONTAINER */}
                        <div className="grid md:grid-cols-2 gap-4">
                            
                            {/* BIO PANEL */}
                            <div className="bg-white border border-slate-400">
                                <div className="bg-slate-200 px-3 py-2 border-b border-slate-400 text-[11px] font-bold text-slate-900 uppercase">
                                    {t('pnl_bio')}
                                </div>
                                <div className="p-4">
                                    <table className="w-full border-collapse">
                                        <tbody>
                                            <DataRow label={t('th_surname')} value={result.fields.surname} />
                                            <DataRow label={t('th_given')} value={result.fields.givenNames} />
                                            <DataRow label={t('th_gender')} value={genderText} />
                                            <DataRow label={t('th_dob')} value={result.parsed.birthDate ? result.parsed.birthDate.toLocaleDateString() : result.fields.birthDate} mono />
                                            <DataRow label={t('th_nat')} value={result.fields.nationality} />
                                        </tbody>
                                    </table>

                                    {result.parsed.extendedData && (
                                        <div className="mt-3 bg-slate-50 border border-slate-300 p-2">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">{t(result.parsed.extendedData.titleKey)}</div>
                                            <div className="text-[16px] text-blue-700 font-bold">{result.parsed.extendedData.text}</div>
                                            {result.parsed.extendedData.truncated !== null && (
                                                <div className="text-[10px] text-sky-600 mt-1 inline-block border border-sky-200 bg-sky-50 px-1 rounded">
                                                    [TRUNCATED: {result.parsed.extendedData.truncated} CHARS]
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DOC SPECS PANEL */}
                            <div className="bg-white border border-slate-400">
                                <div className="bg-slate-200 px-3 py-2 border-b border-slate-400 text-[11px] font-bold text-slate-900 uppercase">
                                    {t('pnl_doc')}
                                </div>
                                <div className="p-4">
                                    <table className="w-full border-collapse">
                                        <tbody>
                                            <DataRow label={t('th_type')} value={result.fields.detailedType ? t(result.fields.detailedType) : result.fields.documentTypeRaw} />
                                            <DataRow label={t('th_iss')} value={result.fields.issuingState} />
                                            <DataRow label={t('th_doc_no')} value={result.fields.documentNumber} mono />
                                            <DataRow label={t('th_exp')} value={result.parsed.expiryDate ? result.parsed.expiryDate.toLocaleDateString() : result.fields.expiryDate} mono />
                                            <DataRow label={t('th_rem')} value={result.parsed.daysRemaining !== null ? `${result.parsed.daysRemaining} DAYS` : '--'} />
                                            <DataRow label={t('th_final')} value={result.valid ? "MATCH" : "ERROR"} mono />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* VIZ PANEL */}
                        <div className="bg-white border border-slate-400">
                             <div className="bg-slate-200 px-3 py-2 border-b border-slate-400 flex justify-between items-center text-[11px] font-bold text-slate-900 uppercase">
                                <span>{t('pnl_viz')}</span>
                                <span className="opacity-60 text-[9px]">RAW BYTES ({result.format})</span>
                             </div>
                             <div className="p-0">
                                <MrzVisualizer data={result} />
                                <div className="bg-slate-50 border-t border-slate-200 p-3 font-mono text-[11px] text-slate-600 leading-relaxed">
                                    {result.calcLogs.map((log, i) => <CalcLog key={i} line={log} />)}
                                </div>
                             </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}