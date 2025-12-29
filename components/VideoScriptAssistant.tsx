
import React, { useState } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import { Card, InputGroup, Button } from './SharedUI';
import { generateStructuredText, startVideoGeneration, pollVideoOperation, getDownloadableVideoUrl } from '../services/geminiService';
import { Type } from '@google/genai';

interface Scene {
  id: number;
  visualDescription: string;
  audioBgm: string;
  duration: string;
  voiceover: string;
  subtitles: string;
  notes: string;
  veoPrompt: string;
}

interface ScriptData {
  title: string;
  duration: string;
  aspectRatio: string;
  concept: string;
  scenes: Scene[];
  platformPosts: { platform: string; content: string }[];
}

const SceneCard: React.FC<{ 
  scene: Scene; 
  aspectRatio: string;
}> = ({ scene, aspectRatio }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleGenerateVideo = async () => {
    setLoading(true);
    setProgress('正在初始化 Veo 3.1...');
    try {
      const ratio = aspectRatio.includes('9:16') || aspectRatio.includes('Portrait') ? '9:16' : '16:9';
      let operation = await startVideoGeneration(scene.veoPrompt, ratio as '9:16' | '16:9');
      
      setProgress('渲染引擎已启动，预计 1-2 分钟...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await pollVideoOperation(operation);
        setProgress('渲染中... 进度更新中');
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const url = await getDownloadableVideoUrl(operation.response.generatedVideos[0].video.uri);
        setVideoUrl(url);
        setProgress('生成成功');
      }
    } catch (e) {
      console.error(e);
      alert('生成视频失败，请检查 API Key 权限。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="p-5 flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SCENE {scene.id}</span>
            <span className="text-xs text-slate-500 font-medium">时长: {scene.duration}</span>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">画面描述</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{scene.visualDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-1">口播配音 (VO)</h4>
              <p className="text-xs text-blue-900 italic">"{scene.voiceover}"</p>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-1">屏幕字幕</h4>
              <p className="text-xs text-emerald-900">{scene.subtitles}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button 
              onClick={() => { navigator.clipboard.writeText(scene.veoPrompt); alert('Veo 提示词已复制'); }}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              📋 复制 Veo 提示词
            </button>
            <span className="text-slate-200">|</span>
            <div className="text-[10px] text-slate-400">
              <span className="font-bold">BGM:</span> {scene.audioBgm}
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-center items-center gap-3">
          {videoUrl ? (
            <div className="w-full space-y-3">
              <div className="aspect-[9/16] max-h-64 mx-auto bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <video src={videoUrl} controls className="max-h-full" />
              </div>
              <div className="flex gap-2">
                <a 
                  href={videoUrl} 
                  download={`scene_${scene.id}.mp4`}
                  className="flex-1 text-center bg-emerald-600 text-white text-[10px] font-bold py-2 rounded hover:bg-emerald-700"
                >
                  下载视频
                </a>
                <button 
                  onClick={() => setVideoUrl(null)}
                  className="px-3 bg-white border border-slate-200 text-[10px] rounded hover:bg-slate-100"
                >
                  重制
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl text-slate-400">
                {loading ? '⏳' : '🎬'}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600">{loading ? '生成中...' : '准备就绪'}</p>
                <p className="text-[10px] text-slate-400 mt-1">{loading ? progress : '点击下方按钮生成此镜头'}</p>
              </div>
              <Button 
                onClick={handleGenerateVideo} 
                loading={loading}
                className="w-full text-[10px] py-2 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                生成本段视频
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoScriptAssistant: React.FC<{ globalSettings: any }> = ({ globalSettings }) => {
  const [inputs, setInputs, resetInputs] = usePersistence('video_script_v3_inputs', {
    productDesc: '高精密度轮毂轴承，耐磨抗高温，支持多款高端车型适配',
    platforms: ['TikTok', 'YouTube'],
    targetMarket: 'USA',
    videoStyle: 'Cinematic Product Showcase'
  });

  const [script, setScript, resetScript] = usePersistence<ScriptData | null>('video_script_v3_data', null);
  const [loading, setLoading] = useState(false);

  const platformOptions = ['TikTok', 'YouTube', 'Instagram', 'Facebook', 'VK'];
  const marketOptions = ['USA', 'UK', 'Germany', 'Saudi Arabia', 'UAE', 'Russia', 'Brazil', 'Japan', 'Vietnam', 'Indonesia', 'Thailand'].sort();

  const handleGenerateScript = async () => {
    if (!inputs.productDesc || inputs.platforms.length === 0) {
      alert('请填写产品描述并选择平台。');
      return;
    }
    setLoading(true);
    try {
      const companyContext = globalSettings.enableGlobalInfo ? `\n[Company Background]: ${globalSettings.companyInfo}` : '';
      
      const prompt = `
        Role: You are a 20-year veteran Video Director and Global Social Media Strategist.
        
        INPUTS:
        - Product Description: ${inputs.productDesc}
        - Platforms: ${inputs.platforms.join(', ')}
        - Target Market: ${inputs.targetMarket}
        - Style: ${inputs.videoStyle}
        ${companyContext}

        TASK:
        Create a detailed, interactive video script structured for high conversion.
        
        SCENE REQUIREMENTS:
        For each scene, provide a "veoPrompt" which is a highly descriptive English paragraph for the Veo 3.1 video generation model. It must describe lighting, materials, motion, and camera angles.

        OUTPUT FORMAT: JSON ONLY
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          duration: { type: Type.STRING },
          aspectRatio: { type: Type.STRING },
          concept: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                visualDescription: { type: Type.STRING },
                audioBgm: { type: Type.STRING },
                duration: { type: Type.STRING },
                voiceover: { type: Type.STRING },
                subtitles: { type: Type.STRING },
                notes: { type: Type.STRING },
                veoPrompt: { type: Type.STRING }
              },
              required: ['id', 'visualDescription', 'audioBgm', 'duration', 'voiceover', 'subtitles', 'veoPrompt']
            }
          },
          platformPosts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ['platform', 'content']
            }
          }
        },
        required: ['title', 'duration', 'aspectRatio', 'concept', 'scenes', 'platformPosts']
      };

      const data = await generateStructuredText<ScriptData>(prompt, schema, 'You are an expert video producer. Output strictly valid JSON.');
      setScript(data);
    } catch (e) {
      console.error(e);
      alert('生成脚本失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: string) => {
    const newList = inputs.platforms.includes(p) ? inputs.platforms.filter(x => x !== p) : [...inputs.platforms, p];
    setInputs({...inputs, platforms: newList});
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <Card title="策划参数" onReset={() => { resetInputs(); resetScript(); }}>
            <div className="space-y-4">
              <InputGroup label="产品描述与卖点">
                <textarea 
                  value={inputs.productDesc}
                  onChange={e => setInputs({...inputs, productDesc: e.target.value})}
                  className="w-full h-32 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="产品功能、材质、核心优势..."
                />
              </InputGroup>

              <InputGroup label="目标市场">
                <select 
                  value={inputs.targetMarket}
                  onChange={e => setInputs({...inputs, targetMarket: e.target.value})}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                >
                  {marketOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </InputGroup>

              <InputGroup label="发布平台">
                <div className="flex flex-wrap gap-1.5">
                  {platformOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                        inputs.platforms.includes(p) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </InputGroup>

              <InputGroup label="期望风格">
                <input 
                  value={inputs.videoStyle}
                  onChange={e => setInputs({...inputs, videoStyle: e.target.value})}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="如: 高端写实、活力动感"
                />
              </InputGroup>

              <Button onClick={handleGenerateScript} loading={loading} className="w-full py-3">
                🎬 生成交互式脚本
              </Button>
            </div>
          </Card>

          {script && (
            <Card title="发布贴文预设">
              <div className="space-y-4">
                {script.platformPosts.map((post, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">{post.platform} POST</p>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {post.content}
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(post.content); alert(`${post.platform} 贴文已复制`); }}
                      className="text-[10px] text-slate-400 hover:text-blue-500 font-bold"
                    >
                      复制此平台文案
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>

        <main className="lg:col-span-3 space-y-6">
          {script ? (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{script.title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">⏱️ 总长: {script.duration}</span>
                      <span className="flex items-center gap-1">📐 比例: {script.aspectRatio}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">核心创意</p>
                    <p className="text-xs text-blue-800 font-medium">{script.concept}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {script.scenes.map(scene => (
                    <SceneCard key={scene.id} scene={scene} aspectRatio={script.aspectRatio} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="text-6xl grayscale opacity-30">🎬</div>
              <div className="text-center max-w-sm">
                <p className="font-bold text-slate-600">交互式导演台已就绪</p>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  在左侧配置您的产品需求，我们将为您规划每一镜头的视觉逻辑，并支持一键调用 Veo 3.1 生成真实的视频预览。
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VideoScriptAssistant;
