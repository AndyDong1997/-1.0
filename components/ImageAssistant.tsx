
import React, { useState, useRef } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateImages, reverseImagePrompt } from '../services/geminiService';
import ApiKeyChecker from './ApiKeyChecker';

const ImageAssistant: React.FC = () => {
  const [inputs, setInputs, resetInputs] = usePersistence('img_asst_inputs', {
    prompt: '',
    aspectRatio: '1:1',
    imageSize: '1K'
  });

  // sourceImage is kept in memory only to prevent LocalStorage Quota crashes
  const [sourceImage, setSourceImage] = useState<string>('');

  const [results, setResults, resetResults] = usePersistence('img_asst_results', {
    images: [] as string[],
    reversedPrompt: ''
  });

  const [loading, setLoading] = useState(false);
  const [reversing, setReversing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.prompt.trim()) {
      alert('Please enter a prompt first.');
      return;
    }
    setLoading(true);
    try {
      const imgs = await generateImages(inputs.prompt, {
        aspectRatio: inputs.aspectRatio,
        imageSize: inputs.imageSize
      }, sourceImage);
      setResults({ ...results, images: imgs });
    } catch (e) {
      console.error(e);
      alert('Generation failed. Ensure you have selected a valid API Key from a paid project.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size to avoid browser memory issues
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSourceImage(base64);
      
      setReversing(true);
      try {
        const prompt = await reverseImagePrompt(base64);
        setResults({ ...results, reversedPrompt: prompt });
        setInputs({ ...inputs, prompt: prompt });
      } catch (err) {
        console.error("Reversing failed:", err);
      } finally {
        setReversing(false);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const clearSourceImage = () => {
    setSourceImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <ApiKeyChecker>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="AI 创意配置" onReset={() => { resetInputs(); resetResults(); clearSourceImage(); }}>
            <div className="space-y-5">
              <InputGroup label="参考图/反推提示词">
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-all bg-slate-50/50">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  {sourceImage ? (
                    <div className="relative group inline-block">
                      <img src={sourceImage} className="h-24 mx-auto rounded-lg shadow-md border border-white" />
                      <button 
                        onClick={(e) => { e.preventDefault(); clearSourceImage(); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="text-3xl mb-1">📷</div>
                      <div className="text-xs font-medium text-slate-600">
                        {reversing ? '正在智能分析...' : '上传图片进行反推或图生图'}
                      </div>
                    </div>
                  )}
                </div>
              </InputGroup>

              <InputGroup label="画面描述 (提示词)">
                <textarea 
                  value={inputs.prompt}
                  onChange={e => setInputs({ ...inputs, prompt: e.target.value })}
                  className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                  placeholder="Describe your product image in detail (English only)..."
                />
              </InputGroup>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="纵横比 (Aspect Ratio)">
                  <select 
                    value={inputs.aspectRatio}
                    onChange={e => setInputs({ ...inputs, aspectRatio: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="4:3">4:3 Landscape</option>
                    <option value="3:4">3:4 Portrait</option>
                    <option value="16:9">16:9 Cinema</option>
                    <option value="9:16">9:16 Story</option>
                  </select>
                </InputGroup>
                <InputGroup label="清晰度 (Resolution)">
                  <select 
                    value={inputs.imageSize}
                    onChange={e => setInputs({ ...inputs, imageSize: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  >
                    <option value="1K">1K Standard</option>
                    <option value="2K">2K Ultra HD</option>
                    <option value="4K">4K Masterpiece</option>
                  </select>
                </InputGroup>
              </div>

              <Button onClick={handleGenerate} loading={loading} className="w-full py-3 shadow-lg shadow-blue-200">
                🚀 生成创意图片
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="生成画布">
            {results.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.images.map((img, i) => (
                  <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
                    <img src={img} alt="Generated result" className="w-full h-auto block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-6 transition-opacity">
                      <div className="flex gap-2">
                        <a 
                          href={img} 
                          download={`ai-image-${i}.png`}
                          className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold text-sm shadow-xl hover:bg-slate-50"
                        >
                          💾 下载
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(inputs.prompt);
                            alert('Prompt copied!');
                          }}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-xl hover:bg-blue-700"
                        >
                          📋 复制提示词
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 space-y-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <div className="text-6xl animate-pulse">✨</div>
                <div className="text-center">
                  <p className="font-medium text-slate-500">灵感画布正在等待</p>
                  <p className="text-xs text-slate-400 mt-1">在左侧输入您的创意指令并点击生成</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ApiKeyChecker>
  );
};

export default ImageAssistant;
