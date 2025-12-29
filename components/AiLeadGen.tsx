
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateText } from '../services/geminiService';

const AiLeadGen: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('leadgen_inputs', {
    industry: '电竞产品',
    keyword: 'Wheel Hub Bearing',
    targetMarket: '欧美市场，中东市场，南美市场，独联体国家',
    userPortrait: '品牌商、分销商',
    sellingPoints: '灵敏度高，颜值高，发货快'
  });

  const [resultData, setResultData, resetResultData] = usePersistence('leadgen_results', {
    analysis: '',
    sources: [] as any[]
  });

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `
        角色要求：你是一名有着 10 年经验的外贸业务员，擅长客户开发工作，你具备强大的信息收集与整理能力、市场调研能力，能够精准地识别客户的需求痛点，并给出有效的开发客户的解决方案。

        任务目标：
        你需要围绕我给出的行业关键词 and 用户画像，来挖掘相关的客户信息，以便于我顺利开展开发客户工作。

        背景介绍：
        行业：${inputs.industry}
        产品关键词：${inputs.keyword}
        目标市场：${inputs.targetMarket}
        用户画像：从是相关产${inputs.keyword}的${inputs.userPortrait}。
        产品卖点：${inputs.sellingPoints}
        公司背景：${globalSettings.enableGlobalInfo ? globalSettings.companyInfo : '未提供'}

        限定要求：
        回答结果要精准、有逻辑性、实操性强，不得伪造数据，所有内容都应该可以验真。你需要掌握客户的业务基本信息、核心产品线、市场定位和企业竞争力，并从中寻找开发客户的切入口。

        工作流程：
        1. 分析行业关键词和客户画像，准确识别需要什么类型的客户。
        2. 使用 Google Search 实时搜索公共资源，包括企业官网、电商平台、领英、FB、谷歌等公开资料。
        3. 给出至少 10 条（因单次输出限制，请优先保证质量和真实性）可验证的相关经商者/企业信息。

        输出格式：
        请使用 Markdown 表格形式，包含以下列：
        1. 企业基本信息（名称、官网、简介、成立时间）
        2. 企业相关产品（核心产品线、主要销售市场）
        3. 联系思路（邮箱、社媒思路等）
        4. 合作切入点（针对卖点：${inputs.sellingPoints}，给出具体的开发策略）

        并在表格下方列出引用的真实来源网址。
      `;

      const response = await generateText(prompt, '你是一个专业的外贸拓客专家。', true);
      setResultData({
        analysis: response.text,
        sources: response.sources || []
      });
    } catch (e) {
      console.error(e);
      alert('拓客分析失败，请检查网络或 API Key。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Card title="Ai 拓客需求配置" onReset={() => { resetInputs(); resetResultData(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="所属行业">
            <input 
              value={inputs.industry} 
              onChange={e => setInputs({...inputs, industry: e.target.value})}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="例如：智能穿戴、汽配行业"
            />
          </InputGroup>
          <InputGroup label="产品核心关键词">
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
              placeholder="例如：中东、欧洲、南美"
            />
          </InputGroup>
          <InputGroup label="目标用户画像">
            <input 
              value={inputs.userPortrait} 
              onChange={e => setInputs({...inputs, userPortrait: e.target.value})}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="例如：分销商、品牌商、修理厂"
            />
          </InputGroup>
          <div className="md:col-span-2">
            <InputGroup label="核心卖点 (优势)">
              <textarea 
                value={inputs.sellingPoints} 
                onChange={e => setInputs({...inputs, sellingPoints: e.target.value})}
                className="w-full h-20 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="例如：发货快、质保长、支持定制"
              />
            </InputGroup>
          </div>
        </div>
        <Button 
          className="mt-6 w-full md:w-auto px-10 py-3 text-lg" 
          onClick={handleGenerate} 
          loading={loading}
        >
          🔍 开始实时全网拓客分析
        </Button>
      </Card>

      {resultData.analysis && (
        <Card title="AI 拓客情报分析结果">
          <div className="prose prose-sm max-w-none overflow-x-auto">
            <div className="markdown-content whitespace-pre-wrap text-slate-700 leading-relaxed">
              {resultData.analysis}
            </div>
          </div>
          
          {resultData.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-blue-500">🔗</span> 参考真实来源：
              </h4>
              <div className="flex flex-wrap gap-2">
                {resultData.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.web?.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                  >
                    {source.web?.title || '来源 ' + (idx + 1)}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex gap-4">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(resultData.analysis);
                alert('情报已复制');
              }}
            >
              📋 复制情报内容
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiLeadGen;
