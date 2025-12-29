
export enum ModuleType {
  PRODUCT_GENERATOR = 'PRODUCT_GENERATOR',
  IMAGE_ASSISTANT = 'IMAGE_ASSISTANT',
  PRODUCT_FISSION = 'PRODUCT_FISSION',
  MARKETING_COPY = 'MARKETING_COPY',
  VIDEO_SCRIPT = 'VIDEO_SCRIPT',
  COLD_OUTREACH = 'COLD_OUTREACH',
  AI_LEAD_GEN = 'AI_LEAD_GEN',
  SETTINGS = 'SETTINGS'
}

export interface Settings {
  companyInfo: string;
  enableGlobalInfo: boolean;
}

export interface GeneratedData {
  titles?: string[];
  bullets?: string[];
  imagePrompts?: string[];
  attributes?: { param: string; value: string }[];
  content?: string;
  images?: string[];
}
