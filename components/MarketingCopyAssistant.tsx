
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateText } from '../services/geminiService';

const MarketingCopyAssistant: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('marketing_v2_inputs', {
    keyword: 'Wheel Hub Bearing',
    targetMarket: '欧美市场、中东市场',
    targetCustomers: ['海外品牌商', '区域分销商'],
    platforms: ['TikTok', 'Facebook', 'Instagram', 'YouTube', 'X (Twitter)'],
    productDesc: '我们的轮毂轴承采用高碳铬轴承钢，具有极高的灵敏度和精密适配度。外观经过防锈涂层处理，颜值高且耐用。现货充足，支持极速发货。'
  });

  const [result, setResult, resetResult] = usePersistence('marketing_v2_result', '');
  const [loading, setLoading] = useState(false);

  const customerPresets = ['海外品牌商', '区域分销商', '汽配批发商', '汽修连锁店', 'OEM/ODM 客户'];
  const platformPresets = ['TikTok', 'Facebook', 'Instagram', 'YouTube', 'X (Twitter)'];

  const toggleSelection = (list: string[], item: string, key: 'targetCustomers' | 'platforms') => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    setInputs({ ...inputs, [key]: newList });
  };

  const handleGenerate = async () => {
    if (inputs.platforms.length === 0) {
      alert('请至少选择一个发布平台');
      return;
    }
    setLoading(true);
    try {
      const companyContext = globalSettings.enableGlobalInfo ? `\n[公司背景介绍]: ${globalSettings.companyInfo}` : '';
      
      const prompt = `
        角色要求：你是一名有着 10 年经验的外贸汽配行业资深营销文案策划师。

        背景信息：
        - 产品关键词：${inputs.keyword}
        - 目标市场：${inputs.targetMarket}
        - 目标客户人群：${inputs.targetCustomers.join(', ')}
        - 发布平台：${inputs.platforms.join(', ')}
        - 产品描述/卖点：${inputs.productDesc}
        ${companyContext}

        任务目标：
        请针对所选平台生成可直接复制使用的营销文案。

        输出格式要求（严禁使用表格）：
        1. 按照平台分类显示。
        2. 每个平台下提供三种文案：【正式开发版】、【简洁引流版】、【种草宣传版】。
        3. 每段文案后紧跟【推荐标签库】。
        4. 文案要求：中英双语对照（英文在前，中文在后），包含 Emoji 以适配社媒风格。
        5. 卖点植入：自然融入“精密灵敏、外观规整/颜值高、现货极速发货”等核心优势。

        文案调性：
        - TikTok: 重钩子描述和视觉感，节奏快。
        - Facebook: 重专业背书和供应能力，适合 B2B。
        - X/Twitter: 极简，突出行业动态或现货优势。
        - YouTube: 详细的视频描述格式，包含 SEO 关键词。
        - Instagram: 突出工艺美感和细节。

        请直接开始输出平台文案。
      `;

      const res = await generateText(prompt, '你是一个精通全平台社媒营销的汽配外贸专家。你只输出可以直接复制的文案块，不使用表格。');
      setResult(res.text);
    } catch (e) {
      console.error(e);
      alert('生成失败，请检查 API Key 状态');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Card title="文案助手 2.0 - 汽配社媒策划" onReset={() => { resetInputs(); resetResult(); }}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="产品关键词">
              <input 
                value={inputs.keyword} 
                onChange={e => setInputs({...inputs, keyword: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="例如：Wheel Hub Bearing"
              />
            </InputGroup>
            <InputGroup label="目标市场">
              <input 
                value={inputs.targetMarket} 
                onChange={e => setInputs({...inputs, targetMarket: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="例如：欧美、中东、独联体"
              />
            </InputGroup>
          </div>

          <InputGroup label="目标客户人群（点击选择）">
            <div className="flex flex-wrap gap-2 mt-1">
              {customerPresets.map(c => (
                <button
                  key={c}
                  onClick={() => toggleSelection(inputs.targetCustomers, c, 'targetCustomers')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    inputs.targetCustomers.includes(c)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {inputs.targetCustomers.includes(c) && <span className="mr-1">✓</span>}
                  {c}
                </button>
              ))}
            </div>
          </InputGroup>

          <InputGroup label="发布平台（支持多选）">
            <div className="flex flex-wrap gap-2 mt-1">
              {platformPresets.map(p => (
                <button
                  key={p}
                  onClick={() => toggleSelection(inputs.platforms, p, 'platforms')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    inputs.platforms.includes(p)
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {inputs.platforms.includes(p) && <span className="mr-1">✓</span>}
                  {p}
                </button>
              ))}
            </div>
          </InputGroup>

          <InputGroup label="产品详细描述与核心卖点">
            <textarea 
              value={inputs.productDesc} 
              onChange={e => setInputs({...inputs, productDesc: e.target.value})}
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
              placeholder="请描述产品的材质、性能、发货优势等关键信息..."
            />
          </InputGroup>

          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${globalSettings.enableGlobalInfo ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${globalSettings.enableGlobalInfo ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
              🏢
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${globalSettings.enableGlobalInfo ? 'text-blue-900' : 'text-slate-600'}`}>
                {globalSettings.enableGlobalInfo ? '全局公司信息已就绪' : '未关联公司信息'}
              </p>
              <p className="text-xs text-slate-500">
                {globalSettings.enableGlobalInfo 
                  ? 'AI 将在生成文案时自动融入您的品牌历史与实力背景' 
                  : '建议前往“设置”配置公司资料，以获得更具商业背书力的文案'}
              </p>
            </div>
          </div>
        </div>

        <Button 
          className="mt-8 w-full md:w-auto px-12 py-4 text-lg shadow-xl shadow-blue-200" 
          onClick={handleGenerate} 
          loading={loading}
        >
          🚀 生成即拿即用营销文案
        </Button>
      </Card>

      {result && (
        <Card title="全平台营销文案预览 (可直接复制)">
          <div className="prose prose-sm max-w-none">
            <div className="markdown-content whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 font-sans">
              {result}
            </div>
          </div>
          <div className="mt-8 flex gap-4 border-t pt-6">
            <Button 
              variant="secondary" 
              className="flex-1 h-12"
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('文案内容已复制到剪贴板，可直接粘贴使用');
              }}
            >
              📋 一键复制全部文案
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarketingCopyAssistant;
