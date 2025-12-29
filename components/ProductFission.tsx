
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateStructuredText } from '../services/geminiService';
import { Type } from '@google/genai';

const ProductFission: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('fission_inputs', {
    amazonUrl: '',
    brand: '',
    keyword: ''
  });

  const [results, setResults, resetResults] = usePersistence('fission_results', {
    title: '',
    bullets: [] as string[],
    mainImagePrompt: '',
    subImagePrompts: [] as string[]
  });

  const [loading, setLoading] = useState(false);

  const handleFission = async () => {
    setLoading(true);
    try {
      const prompt = `
        Amazon URL: ${inputs.amazonUrl}
        Brand Name: ${inputs.brand}
        Core Keyword: ${inputs.keyword}
        Company Info: ${globalSettings.enableGlobalInfo ? globalSettings.companyInfo : ''}

        TASK: Parse the Amazon product and create a "fission" version (a new variant optimization).
        1. Optimized Title: Max 128 chars, Title Case, no symbols except - and /.
        2. Product 5 Bullet Points: English only, high conversion focus.
        3. 6 Image Prompts for Nano Banana Pro:
           - 1 Main Image (Amazon standard studio shot)
           - 5 Sub Images (Features, Detail, Environment, Multi-angle, Packaging)
           - Requirement: Specify 1:1 aspect ratio in each prompt.
        
        OUTPUT ENGLISH ONLY.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          mainImagePrompt: { type: Type.STRING },
          subImagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'bullets', 'mainImagePrompt', 'subImagePrompts']
      };

      const data = await generateStructuredText<any>(prompt, schema);
      setResults(data);
    } catch (e) {
      alert('Fission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="产品裂变参数录入" onReset={() => { resetInputs(); resetResults(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputGroup label="亚马逊产品链接 (参考源)">
              <input 
                type="text" 
                value={inputs.amazonUrl} 
                onChange={e => setInputs({...inputs, amazonUrl: e.target.value})}
                className="w-full p-2 border rounded-lg" 
                placeholder="https://www.amazon.com/..."
              />
            </InputGroup>
          </div>
          <InputGroup label="品牌名称">
            <input 
              type="text" 
              value={inputs.brand} 
              onChange={e => setInputs({...inputs, brand: e.target.value})}
              className="w-full p-2 border rounded-lg" 
              placeholder="Brand Name"
            />
          </InputGroup>
          <InputGroup label="核心关键词">
            <input 
              type="text" 
              value={inputs.keyword} 
              onChange={e => setInputs({...inputs, keyword: e.target.value})}
              className="w-full p-2 border rounded-lg" 
              placeholder="Core Keyword"
            />
          </InputGroup>
        </div>
        <Button className="mt-6 w-full md:w-auto" onClick={handleFission} loading={loading}>
          执行产品裂变
        </Button>
      </Card>

      {results.title && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="裂变优化标题">
            <div className="p-4 bg-blue-50 rounded-lg text-lg font-medium border border-blue-100 text-blue-900">
              {results.title}
            </div>
            <Button 
              variant="secondary" 
              className="w-full mt-3"
              onClick={() => navigator.clipboard.writeText(results.title)}
            >
              复制标题
            </Button>
          </Card>

          <Card title="裂变五点描述">
            <div className="space-y-3">
              {results.bullets.map((b, i) => (
                <div key={i} className="text-sm p-3 bg-slate-50 rounded-lg">
                  <span className="font-bold text-blue-600 mr-1">#0{i+1}</span> {b}
                </div>
              ))}
            </div>
          </Card>

          <Card title="裂变视觉提示词 (1:1)" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500">主图提示词 (1张)</p>
                <div className="p-3 bg-slate-50 border rounded-lg text-xs font-mono">
                  {results.mainImagePrompt}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500">副图提示词 (5张)</p>
                <div className="space-y-2">
                  {results.subImagePrompts.map((p, i) => (
                    <div key={i} className="p-2 bg-slate-50 border rounded-lg text-[10px] font-mono">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductFission;
