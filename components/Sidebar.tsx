
import React from 'react';
import { ModuleType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: ModuleType.PRODUCT_GENERATOR, label: '国际站资料生成', icon: '📦' },
    { id: ModuleType.IMAGE_ASSISTANT, label: '主图助手', icon: '🖼️' },
    { id: ModuleType.AI_LEAD_GEN, label: 'Ai 拓客工具', icon: '🔍' },
    { id: ModuleType.PRODUCT_FISSION, label: '产品裂变工具', icon: '🔗' },
    { id: ModuleType.MARKETING_COPY, label: '营销文案助手', icon: '✍️' },
    { id: ModuleType.VIDEO_SCRIPT, label: '短视频脚本助手', icon: '📹' },
    { id: ModuleType.COLD_OUTREACH, label: '开发信助手', icon: '📧' },
    { id: ModuleType.SETTINGS, label: '全局设置', icon: '⚙️' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Cross-Border AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Global Commerce Agent</p>
      </div>
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeModule === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold">A</div>
          <div>
            <p className="text-xs font-semibold">AI Agent Online</p>
            <p className="text-[10px] text-slate-500 italic">Nano Banana Pro Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
