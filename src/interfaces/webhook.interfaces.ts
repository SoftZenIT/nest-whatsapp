export type HubMode = 'subscribe';

/** Identifies a media asset by either a hosted URL or an uploaded media ID. */
export type WhatsAppMediaSource = { url: string } | { mediaId: string };

export interface VerifyWebhookQuery {
  'hub.mode'?: HubMode;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

// WhatsApp Cloud API webhook payload (subset)
export interface WhatsAppProfile {
  name?: string;
}
export interface WhatsAppContact {
  wa_id: string;
  profile?: WhatsAppProfile;
}

export interface WhatsAppContext {
  message_id: string;
}
export interface WhatsAppText {
  body: string;
}
export interface WhatsAppImage {
  link: string;
  caption?: string;
}
export interface WhatsAppAudio {
  link: string;
}
export interface WhatsAppDocument {
  link: string;
  filename?: string;
}
export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}
export interface WhatsAppVideo {
  link: string;
  caption?: string;
}
export interface WhatsAppSticker {
  link: string;
}
export interface WhatsAppInteractiveButtonReply {
  id: string;
  title: string;
}
export interface WhatsAppInteractiveListReply {
  id: string;
  title: string;
  description?: string;
}
export interface WhatsAppInteractive {
  type: 'button' | 'list';
  button_reply?: WhatsAppInteractiveButtonReply;
  list_reply?: WhatsAppInteractiveListReply;
}
export interface WhatsAppContactPhone {
  phone: string;
  type?: string;
  wa_id?: string;
}
export interface WhatsAppContactName {
  formatted_name?: string;
  first_name?: string;
  last_name?: string;
}
export interface WhatsAppContactCard {
  name?: WhatsAppContactName;
  phones?: WhatsAppContactPhone[];
}
export interface WhatsAppSystemPayload {
  type?: string;
  body?: string;
}
export interface WhatsAppOrderItem {
  product_retailer_id: string;
  quantity: number;
  item_price?: string;
  currency?: string;
}
export interface WhatsAppOrder {
  catalog_id?: string;
  product_items?: WhatsAppOrderItem[];
}
export interface WhatsAppProduct {
  retailer_id: string;
}
export interface WhatsAppReaction {
  message_id: string;
  emoji?: string;
  action?: 'react' | 'unreact';
}

/** Referral data present when a message originates from a Click-to-WhatsApp ad. */
export interface WhatsAppReferral {
  sourceUrl?: string;
  sourceId?: string;
  sourceType?: 'ad' | 'post';
  headline?: string;
  body?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  ctwaClid?: string;
}

/** Typed constants for all WhatsApp message type discriminants. */
export enum WhatsAppMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  VIDEO = 'video',
  STICKER = 'sticker',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
  CONTACTS = 'contacts',
  SYSTEM = 'system',
  ORDER = 'order',
  PRODUCT = 'product',
  REACTION = 'reaction',
}

export type WhatsAppMessageBase = {
  id?: string;
  from?: string;
  timestamp?: string;
  context?: WhatsAppContext;
  referral?: WhatsAppReferral;
};

export type WhatsAppMessage =
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.TEXT; text: WhatsAppText })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.IMAGE; image: WhatsAppImage })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.AUDIO; audio: WhatsAppAudio })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.DOCUMENT;
      document: WhatsAppDocument;
    })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.LOCATION;
      location: WhatsAppLocation;
    })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.VIDEO; video: WhatsAppVideo })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.STICKER; sticker: WhatsAppSticker })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.TEMPLATE;
      template: { name: string; language?: { code: string } };
    })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.INTERACTIVE;
      interactive: WhatsAppInteractive;
    })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.CONTACTS;
      contacts: WhatsAppContactCard[];
    })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.SYSTEM;
      system: WhatsAppSystemPayload;
    })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.ORDER; order: WhatsAppOrder })
  | (WhatsAppMessageBase & { type: WhatsAppMessageType.PRODUCT; product: WhatsAppProduct })
  | (WhatsAppMessageBase & {
      type: WhatsAppMessageType.REACTION;
      reaction: WhatsAppReaction;
    });

export interface WhatsAppMetadata {
  phone_number_id?: string;
  display_phone_number?: string;
}

export interface WhatsAppStatus {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
}

export interface WhatsAppWebhookChangeValue {
  messaging_product: 'whatsapp';
  metadata?: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppWebhookChange {
  field: string;
  value: WhatsAppWebhookChangeValue;
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: WhatsAppWebhookChange[];
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

export interface RawBodyRequestLike<TBody, TQuery> {
  rawBody: Buffer;
  body: TBody;
  query: TQuery;
}

export type WhatsAppOutboundPayload = {
  messaging_product: 'whatsapp';
  to: string;
  type: WhatsAppMessageType;
  context?: { message_id: string };
  [key: string]: unknown;
};

export interface WhatsAppOutboundButton {
  type: 'reply';
  reply: { id: string; title: string };
}
export interface WhatsAppOutboundSection {
  title?: string;
  rows: Array<{ id: string; title: string; description?: string }>;
}
export interface WhatsAppOutboundInteractive {
  type: 'button' | 'list';
  header?: { type: 'text'; text: string };
  body: { text: string };
  footer?: { text: string };
  action:
    | { buttons: WhatsAppOutboundButton[] }
    | { button: string; sections: WhatsAppOutboundSection[] };
}
