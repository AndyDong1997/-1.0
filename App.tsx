
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProductGenerator from './components/ProductGenerator';
import ImageAssistant from './components/ImageAssistant';
import ProductFission from './components/ProductFission';
import SettingsComponent from './components/Settings';
import AiLeadGen from './components/AiLeadGen';
import MarketingCopyAssistant from './components/MarketingCopyAssistant';
import ColdOutreachAssistant from './components/ColdOutreachAssistant';
import VideoScriptAssistant from './components/VideoScriptAssistant';
import { ModuleType, Settings } from './types';
import { usePersistence } from './hooks/usePersistence';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.PRODUCT_GENERATOR);
  const [globalSettings, setGlobalSettings] = usePersistence<Settings>('global_settings', {
    companyInfo: '',
    enableGlobalInfo: false
  });

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.PRODUCT_GENERATOR:
        return <ProductGenerator globalSettings={globalSettings} />;
      case ModuleType.IMAGE_ASSISTANT:
        return <ImageAssistant />;
      case ModuleType.AI_LEAD_GEN:
        return <AiLeadGen globalSettings={globalSettings} />;
      case ModuleType.PRODUCT_FISSION:
        return <ProductFission globalSettings={globalSettings} />;
      case ModuleType.MARKETING_COPY:
        return <MarketingCopyAssistant globalSettings={globalSettings} />;
      case ModuleType.VIDEO_SCRIPT:
        return <VideoScriptAssistant globalSettings={globalSettings} />;
      case ModuleType.COLD_OUTREACH:
        return <ColdOutreachAssistant globalSettings={globalSettings} />;
      case ModuleType.SETTINGS:
        return <SettingsComponent settings={globalSettings} setSettings={setGlobalSettings} />;
      default:
        return <div>Module not found</div>;
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case ModuleType.PRODUCT_GENERATOR: return '国际站产品资料生成器';
      case ModuleType.IMAGE_ASSISTANT: return '智能主图助手 (Nano Banana Pro)';
      case ModuleType.AI_LEAD_GEN: return 'Ai 全网拓客情报专家';
      case ModuleType.PRODUCT_FISSION: return '跨境产品裂变工具';
      case ModuleType.MARKETING_COPY: return '汽配资深营销策划师';
      case ModuleType.VIDEO_SCRIPT: return '短视频/TikTok 脚本专家';
      case ModuleType.COLD_OUTREACH: return '商务开发信智能助手';
      case ModuleType.SETTINGS: return '全局资料与设置';
      default: return '';
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end border-b pb-6 border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{getModuleTitle()}</h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              {activeModule === ModuleType.SETTINGS ? '配置您的全局公司信息，提升 AI 理解力' : '为跨境卖家打造的智能生产力工具'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Model</span>
              <span className="text-xs font-bold text-blue-600">Gemini 3 Pro</span>
            </div>
            {(activeModule === ModuleType.IMAGE_ASSISTANT || activeModule === ModuleType.AI_LEAD_GEN || activeModule === ModuleType.MARKETING_COPY || activeModule === ModuleType.COLD_OUTREACH || activeModule === ModuleType.VIDEO_SCRIPT) && (
              <p className="text-[10px] text-slate-400 italic">需要付费项目 API Key 以启用高级生成功能</p>
            )}
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
        
        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>&copy; 2024 Cross-Border AI Commerce Agent. Powered by Nano Banana Pro.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
