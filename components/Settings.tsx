
import React from 'react';
import { Card, InputGroup, Button } from './SharedUI';
import { Settings } from '../types';

interface SettingsProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card title="全局配置">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <h4 className="font-semibold text-blue-900">开启全局背景信息</h4>
              <p className="text-xs text-blue-700">开启后，所有文案生成功能都会自动引用下方公司资料</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enableGlobalInfo}
                onChange={e => setSettings({ ...settings, enableGlobalInfo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <InputGroup label="公司/品牌介绍资料">
            <textarea 
              value={settings.companyInfo}
              onChange={e => setSettings({ ...settings, companyInfo: e.target.value })}
              className="w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="输入公司主营业务、品牌历史、服务特色、公司实力等..."
            />
          </InputGroup>
          
          <div className="p-4 bg-slate-50 rounded-lg border text-xs text-slate-500">
            <p className="font-bold mb-1">💡 小贴士：</p>
            完善公司介绍可以大幅提高 AI 生成文案的专业度和准确性，特别是对于开发信和产品裂变工具。
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsComponent;
