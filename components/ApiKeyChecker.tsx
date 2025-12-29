
import React, { useState, useEffect } from 'react';
import { checkApiKeySelection, openApiKeySelector } from '../services/geminiService';
import { Card, Button } from './SharedUI';

const ApiKeyChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      const selected = await checkApiKeySelection();
      setHasKey(selected);
    };
    verify();
  }, []);

  const handleSelectKey = async () => {
    await openApiKeySelector();
    setHasKey(true); // Assume success per guidelines
  };

  if (hasKey === null) return <div className="p-8 text-center text-slate-500">Checking authorization...</div>;

  if (!hasKey) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card title="需要选择 API Key">
          <div className="space-y-4 text-center">
            <p className="text-slate-600">
              您正在尝试使用 Gemini 3 Pro (Nano Banana Pro) 模型。
              根据 Google 政策，使用此模型需要您选择一个付费项目的 API Key。
            </p>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 text-left">
              <p className="font-bold mb-1">注意：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>请确保您的 GCP 项目已开启计费 (Billing)。</li>
                <li>更多详情请参考 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-medium">计费文档</a>。</li>
              </ul>
            </div>
            <Button onClick={handleSelectKey} className="w-full py-4 text-lg">
              🔑 选择 API Key 并进入
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeyChecker;
