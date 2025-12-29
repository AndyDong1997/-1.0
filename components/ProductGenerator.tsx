
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateStructuredText } from '../services/geminiService';
import { Type } from '@google/genai';

const ProductGenerator: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('prod_gen_inputs', {
    prodInfo: '',
    brand: '',
    keyword: '',
    amazonUrl: '',
    bulletPoints: '',
    companyInfo: globalSettings.enableGlobalInfo ? globalSettings.companyInfo : ''
  });

  const [results, setResults, resetResults] = usePersistence('prod_gen_results', {
    titles: [] as string[],
    bullets: [] as string[],
    imagePrompts: [] as string[],
    attributes: [] as { param: string; value: string }[]
  });

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `
        You are a cross-border e-commerce expert specialized in Amazon and Alibaba Global.
        
        CONTEXT:
        Brand: ${inputs.brand}
        Core Keyword: ${inputs.keyword}
        Amazon Reference: URL (${inputs.amazonUrl}) | Bullets (${inputs.bulletPoints})
        Product Details: ${inputs.prodInfo}
        Company Context: ${globalSettings.enableGlobalInfo ? globalSettings.companyInfo : ''}

        TASKS:
        1. Generate exactly 5 high-converting SEO product titles.
           Structure: [Important Attribute] + [Product Center Word] + [Attribute Synonyms/Variants] + [Center Word Synonyms/Variants] + [Usage Scene].
           Requirements: Max 128 characters. End with the Core Keyword "${inputs.keyword}". NO special symbols except "-" and "/". Capitalize the first letter of every word except prepositions.
        
        2. Generate 5 professional Amazon Bullet Points (Points of Description).
        
        3. Create exactly 10 Technical Attributes (Attribute Value pairs):
           - Product Name: A long-tail SEO keyword based on the core keyword and Google trends, max 50 chars.
           - Dimensions: Based on input or standard size.
           - Weight: Based on input or standard weight.
           - Material: Based on input.
           - Bearing Type: Professional bearing specification.
           - Universal Model: Common industry standard models.
           - ABS Included: Specify "Yes" or "No".
           - Applicable Vehicle: List compatible vehicles or "Universal".
           - Packaging: Default to "Regular Packaging" unless specified.
           - Shipping Time: Default to "7 Days".
        
        4. Generate prompts for 6 product images (1 Main Studio shot, 5 Secondary/Sub images).
           - Prompts must be optimized for Gemini 3 Pro (Nano Banana Pro).
           - Requirements: Include "1:1 aspect ratio" in all prompts. Focus on lighting, materials, and angles.

        STRICT RULES:
        - OUTPUT ALL CONTENT IN ENGLISH ONLY. NO CHINESE CHARACTERS.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          attributes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                param: { type: Type.STRING },
                value: { type: Type.STRING }
              },
              required: ['param', 'value']
            }
          },
          imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['titles', 'bullets', 'attributes', 'imagePrompts']
      };

      const data = await generateStructuredText<any>(prompt, schema);
      setResults(data);
    } catch (e) {
      console.error(e);
      alert('Generation failed. Ensure your PROJECT is enabled for billing if using Pro models.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <Card title="产品资料录入" onReset={() => { resetInputs(); resetResults(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="产品参数描述">
            <textarea 
              value={inputs.prodInfo} 
              onChange={e => setInputs({...inputs, prodInfo: e.target.value})}
              className="w-full h-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="输入材质、功能、尺寸等基础参数..."
            />
          </InputGroup>
          <InputGroup label="亚马逊五点描述 (参考)">
            <textarea 
              value={inputs.bulletPoints} 
              onChange={e => setInputs({...inputs, bulletPoints: e.target.value})}
              className="w-full h-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="粘贴已有的五点描述或卖点以供 AI 参考..."
            />
          </InputGroup>
          <InputGroup label="品牌信息">
            <input 
              type="text" 
              value={inputs.brand} 
              onChange={e => setInputs({...inputs, brand: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="输入品牌名称"
            />
          </InputGroup>
          <InputGroup label="主关键词">
            <input 
              type="text" 
              value={inputs.keyword} 
              onChange={e => setInputs({...inputs, keyword: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="将以此词为词根结尾 (放在标题末尾)"
            />
          </InputGroup>
          <div className="md:col-span-2">
            <InputGroup label="亚马逊产品链接">
              <input 
                type="text" 
                value={inputs.amazonUrl} 
                onChange={e => setInputs({...inputs, amazonUrl: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                placeholder="https://www.amazon.com/dp/..."
              />
            </InputGroup>
          </div>
        </div>
        <Button 
          className="mt-6 w-full md:w-auto px-12" 
          onClick={handleGenerate} 
          loading={loading}
        >
          开始生成全套资料
        </Button>
      </Card>

      {results.titles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="生成标题 (GEO/SEO Optimized)">
            <div className="space-y-3">
              {results.titles.map((t, i) => (
                <div key={i} className="flex gap-2 items-start group">
                  <div className="flex-1 p-3 bg-slate-50 rounded-lg text-sm border border-slate-100 group-hover:border-blue-200 transition-colors">
                    {t}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(t)}
                    title="复制"
                    className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="亚马逊五点描述 (Bullets)">
            <div className="space-y-2">
              {results.bullets.map((b, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                  <span className="font-bold mr-2 text-blue-600">•</span> {b}
                </div>
              ))}
              <Button 
                variant="secondary" 
                className="w-full text-xs mt-2" 
                onClick={() => copyToClipboard(results.bullets.join('\n'))}
              >
                复制全部描述
              </Button>
            </div>
          </Card>

          <Card title="产品10点属性 (Attributes)">
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-2 font-semibold">参数项目</th>
                    <th className="px-4 py-2 font-semibold">具体数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.attributes.map((attr, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2 text-slate-500 font-medium">{attr.param}</td>
                      <td className="px-4 py-2 text-slate-900">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="图片生成提示词 (Nano Banana Pro)">
            <div className="space-y-4">
              {results.imagePrompts.map((p, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {i === 0 ? '01 - Main Image Prompt' : `0${i+1} - Detail Image Prompt`}
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg text-xs font-mono border border-slate-100 leading-relaxed">
                      {p}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(p)}
                      className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm self-start"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductGenerator;
