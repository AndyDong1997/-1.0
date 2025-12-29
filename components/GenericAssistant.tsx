
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateText } from '../services/geminiService';

interface GenericAssistantProps {
  moduleKey: string;
  title: string;
  placeholder: string;
  systemPrompt: string;
  globalSettings: any;
}

const GenericAssistant: React.FC<GenericAssistantProps> = ({ moduleKey, title, placeholder, systemPrompt, globalSettings }) => {
  const [input, setInput, resetInput] = usePersistence(`${moduleKey}_input`, '');
  const [result, setResult, resetResult] = usePersistence(`${moduleKey}_result`, '');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const finalSystemPrompt = globalSettings.enableGlobalInfo 
        ? `${systemPrompt}\n\nCompany Context: ${globalSettings.companyInfo}`
        : systemPrompt;
      
      const res = await generateText(input, finalSystemPrompt);
      setResult(res);
    } catch (e) {
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title={title} onReset={() => { resetInput(); resetResult(); }}>
        <InputGroup label="输入背景信息或要求">
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
          />
        </InputGroup>
        <Button onClick={handleGenerate} loading={loading} className="mt-4 w-full">
          生成专业文案
        </Button>
      </Card>
      <Card title="AI 生成结果">
        {result ? (
          <div className="prose prose-sm max-w-none prose-slate">
            <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[16rem]">
              {result}
            </div>
            <Button 
              variant="secondary" 
              className="mt-4 w-full"
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('Copied!');
              }}
            >
              📋 复制全文
            </Button>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            等待生成...
          </div>
        )}
      </Card>
    </div>
  );
};

export default GenericAssistant;
