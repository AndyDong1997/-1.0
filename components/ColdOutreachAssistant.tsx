
import React, { useState, useEffect } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateText } from '../services/geminiService';

const SearchableInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}> = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click on option
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b last:border-0 border-slate-50 text-slate-700"
              onMouseDown={() => {
                setSearch(opt);
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ColdOutreachAssistant: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('outreach_inputs_v2', {
    targetMarket: 'Germany',
    language: 'English',
    productName: 'Precision Wheel Hub Bearing',
    productCategory: 'Auto Parts / Bearings',
    productSpecs: 'High-carbon chromium steel, G3 precision, zero-noise technology',
    applicationScenario: 'Aftermarket repair, high-end vehicle maintenance',
    sellingPoints: 'Direct factory price, CE & IATF16949 certified, 24-hour shipping from stock'
  });

  const [resultData, setResultData, resetResultData] = usePersistence('outreach_result_v2', {
    title: '',
    body: '',
    expertNotes: '',
    suggestions: ''
  });

  const [loading, setLoading] = useState(false);

  const marketPresets = [
    'USA', 'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Canada', 'Australia', 
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Brazil', 'Mexico', 'Chile', 
    'Russia', 'Kazakhstan', 'Uzbekistan', 'Indonesia', 'Japan', 'Vietnam', 'Thailand', 
    'Malaysia', 'Philippines', 'South Korea', 'India', 'South Africa', 'Nigeria', 'Egypt'
  ].sort();

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 
    'Russian', 'Japanese', 'Korean', 'Chinese (Simplified)', 'Chinese (Traditional)', 
    'Vietnamese', 'Thai', 'Indonesian', 'Turkish', 'Dutch', 'Polish'
  ].sort();

  const handleGenerate = async () => {
    if (!inputs.targetMarket || !inputs.language) {
      alert('请确保已填写目标市场和语言。');
      return;
    }
    setLoading(true);
    try {
      const companyContext = globalSettings.enableGlobalInfo ? `\n[Company Profile]: ${globalSettings.companyInfo}` : '';
      
      const prompt = `
        Role: You are a 20-year veteran Foreign Trade Expert (Senior Export Manager).
        
        Input Context:
        - Target Market: ${inputs.targetMarket}
        - Email Language: ${inputs.language}
        - Product Name: ${inputs.productName}
        - Product Category: ${inputs.productCategory}
        - Core Specs: ${inputs.productSpecs}
        - Application Scenarios: ${inputs.applicationScenario}
        - Key USPs: ${inputs.sellingPoints}
        ${companyContext}

        Task:
        Generate a high-converting, professional B2B cold outreach email in ${inputs.language}.

        Strategy Guidelines based on Market:
        - Europe/USA: Direct, value-driven, high-efficiency, focus on certifications and quality standards.
        - Middle East: Respectful, emphasis on company reputation, longevity, and long-term partnership.
        - SE Asia: Pragmatic, clear cost-benefit analysis, focus on lead times and reliability.
        - Latin America: Warm yet professional, focus on relationship building and local market success.

        Structure:
        1. Professional Greeting (Market-appropriate).
        2. Strong Hook / Value Prop.
        3. Company & Product Intro (Customized to context).
        4. TOP 3 Selling Points selection.
        5. Clear Call to Action (CTA).
        6. Professional Sign-off.

        Output Requirements (NO TABLES):
        Please output in the following blocks:
        ---TITLE---
        [Email Subject Line]
        ---BODY---
        [Email Content]
        ---EXPERT NOTES---
        [1-2 sentences explaining the logic for this market]
        ---SUGGESTIONS---
        [1-2 improvement tips for the user]

        STRICT: Use only ${inputs.language} for the Title and Body. Use Chinese for Expert Notes and Suggestions.
      `;

      const response = await generateText(prompt, 'You are a 20-year B2B Export Expert.');
      const text = response.text;
      
      const titleMatch = text.match(/---TITLE---([\s\S]*?)---BODY---/);
      const bodyMatch = text.match(/---BODY---([\s\S]*?)---EXPERT NOTES---/);
      const notesMatch = text.match(/---EXPERT NOTES---([\s\S]*?)---SUGGESTIONS---/);
      const suggestMatch = text.match(/---SUGGESTIONS---([\s\S]*?)$/);

      setResultData({
        title: titleMatch ? titleMatch[1].trim() : '',
        body: bodyMatch ? bodyMatch[1].trim() : text,
        expertNotes: notesMatch ? notesMatch[1].trim() : '',
        suggestions: suggestMatch ? suggestMatch[1].trim() : ''
      });
    } catch (e) {
      console.error(e);
      alert('生成失败，请检查网络或 API Key。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="开发信参数配置" onReset={() => { resetInputs(); resetResultData(); }}>
            <div className="space-y-4">
              <InputGroup label="目标市场 (支持搜索/输入)">
                <SearchableInput
                  value={inputs.targetMarket}
                  onChange={(val) => setInputs({ ...inputs, targetMarket: val })}
                  options={marketPresets}
                  placeholder="搜索或直接输入国家/地区"
                />
              </InputGroup>
              
              <InputGroup label="邮件语言 (支持搜索/输入)">
                <SearchableInput
                  value={inputs.language}
                  onChange={(val) => setInputs({ ...inputs, language: val })}
                  options={languageOptions}
                  placeholder="搜索或直接输入语言名称"
                />
              </InputGroup>

              <InputGroup label="产品名称">
                <input 
                  value={inputs.productName}
                  onChange={e => setInputs({...inputs, productName: e.target.value})}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="例如：Precision Bearings"
                />
              </InputGroup>

              <InputGroup label="核心卖点 (USPs)">
                <textarea 
                  value={inputs.sellingPoints}
                  onChange={e => setInputs({...inputs, sellingPoints: e.target.value})}
                  className="w-full h-24 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="例如：源头工厂、价格优势、交期快..."
                />
              </InputGroup>

              <div className={`p-3 rounded-lg border text-[11px] ${globalSettings.enableGlobalInfo ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {globalSettings.enableGlobalInfo ? '✅ 已关联全局公司背景信息' : '⚠️ 未开启全局公司信息，建议在设置中开启'}
              </div>

              <Button onClick={handleGenerate} loading={loading} className="w-full py-3 shadow-lg shadow-blue-200">
                ✨ 生成高转化开发信
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="AI 生成预览">
            {resultData.body ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Subject Line</label>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm font-semibold text-blue-900 flex justify-between items-center group">
                    <span>{resultData.title}</span>
                    <button onClick={() => { navigator.clipboard.writeText(resultData.title); alert('Title Copied'); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded">📋</button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email Content</label>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-sans min-h-[300px]">
                    {resultData.body}
                  </div>
                  <Button variant="secondary" className="w-full mt-3" onClick={() => { navigator.clipboard.writeText(resultData.body); alert('Email Body Copied'); }}>
                    📋 复制正文内容
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1 mb-2">
                      <span>💡</span> 专家优化说明
                    </h5>
                    <p className="text-xs text-amber-800 leading-relaxed italic">{resultData.expertNotes}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1 mb-2">
                      <span>🚀</span> 提升转化建议
                    </h5>
                    <p className="text-xs text-blue-800 leading-relaxed italic">{resultData.suggestions}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="text-5xl opacity-30">📧</div>
                <p className="text-sm">在左侧配置参数，让 20 年外贸专家为您代写开发信</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColdOutreachAssistant;
