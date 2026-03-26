/** Interfaces for WhatsApp Cloud API management endpoints (templates, phone numbers, media). */

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export enum WhatsAppTemplateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  DISABLED = 'DISABLED',
  IN_APPEAL = 'IN_APPEAL',
  DELETED = 'DELETED',
}

export enum WhatsAppTemplateCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
  text?: string;
  buttons?: WhatsAppTemplateButton[];
  example?: Record<string, unknown>;
}

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OTP' | 'COPY_CODE';
  text?: string;
  url?: string;
  phoneNumber?: string;
  otpType?: 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: WhatsAppTemplateStatus;
  category: WhatsAppTemplateCategory;
  language: string;
  components?: WhatsAppTemplateComponent[];
  qualityScore?: { score?: string };
  rejectedReason?: string;
}

export interface WhatsAppTemplateListResponse {
  data: WhatsAppTemplate[];
  paging?: { cursors?: { before?: string; after?: string }; next?: string };
}

export interface WhatsAppCreateTemplateDto {
  name: string;
  language: string;
  category: WhatsAppTemplateCategory;
  components?: WhatsAppTemplateComponent[];
  allowCategoryChange?: boolean;
}

export interface WhatsAppUpdateTemplateDto {
  components?: WhatsAppTemplateComponent[];
  category?: WhatsAppTemplateCategory;
}

// ---------------------------------------------------------------------------
// Phone Numbers
// ---------------------------------------------------------------------------

export enum WhatsAppNameStatus {
  APPROVED = 'APPROVED',
  AVAILABLE_WITHOUT_REVIEW = 'AVAILABLE_WITHOUT_REVIEW',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  NONE = 'NONE',
}

export enum WhatsAppQualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN',
}

export interface WhatsAppPhoneNumber {
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
  nameStatus?: WhatsAppNameStatus;
  qualityRating?: WhatsAppQualityRating;
  accountMode?: 'SANDBOX' | 'LIVE';
  isOfficialBusinessAccount?: boolean;
}

export interface WhatsAppPhoneNumberListResponse {
  data: WhatsAppPhoneNumber[];
  paging?: { cursors?: { before?: string; after?: string }; next?: string };
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface WhatsAppMediaUploadResponse {
  id: string;
}

export interface WhatsAppMediaUrlResponse {
  url: string;
  mimeType: string;
  sha256: string;
  fileSize: number;
  id: string;
  messagingProduct: 'whatsapp';
}
