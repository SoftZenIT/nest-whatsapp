import type { AxiosRequestConfig } from 'axios';

export enum WhatsAppMode {
  SANDBOX = 'sandbox',
  LIVE = 'live',
}

export interface WhatsAppSandboxOptions {
  mode: WhatsAppMode.SANDBOX;
  testPhoneNumberId: string;
  temporaryAccessToken: string;
  testRecipients: string[];
  httpConfig?: AxiosRequestConfig;
}

export interface WhatsAppLiveOptions {
  mode: WhatsAppMode.LIVE;
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string;
  httpConfig?: AxiosRequestConfig;
}

export type WhatsAppClientOptions = WhatsAppSandboxOptions | WhatsAppLiveOptions;
