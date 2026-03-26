import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WhatsAppEvents } from './whatsapp.events';
import { type WhatsAppStatusEvent, type WhatsAppReferralEvent } from '../interfaces/events';
import {
  WhatsAppMessageType,
  type WhatsAppMessage,
  type WhatsAppWebhookPayload,
} from '../interfaces/webhook.interfaces';
import { getAllValues } from '../utils/webhook';

@Injectable()
export class WhatsAppWebhookProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly boundProcessPayload = (payload: WhatsAppWebhookPayload): void =>
    this.processPayload(payload);

  constructor(private readonly events: WhatsAppEvents) {}

  onModuleInit(): void {
    // Subscribe to raw webhook payloads and emit normalized typed sub-events
    this.events.onMessageReceived(this.boundProcessPayload);
  }

  onModuleDestroy(): void {
    this.events.offMessageReceived(this.boundProcessPayload);
  }

  private processPayload(payload: WhatsAppWebhookPayload): void {
    for (const value of getAllValues(payload)) {
      const contact = value.contacts?.[0];
      const metadata = value.metadata;

      for (const status of value.statuses ?? []) {
        const statusEvent: WhatsAppStatusEvent = { status, contact, metadata };
        this.events.emitStatusReceived(statusEvent);
      }

      for (const msg of value.messages ?? []) {
        this.dispatchMessageEvent(msg, contact, metadata);

        if (msg.referral) {
          const referralEv: WhatsAppReferralEvent = {
            message: msg,
            referral: msg.referral,
            contact,
            metadata,
          };
          this.events.emitReferralReceived(referralEv);
        }
      }
    }
  }

  private dispatchMessageEvent(
    msg: WhatsAppMessage,
    contact: WhatsAppStatusEvent['contact'],
    metadata: WhatsAppStatusEvent['metadata']
  ): void {
    switch (msg.type) {
      case WhatsAppMessageType.TEXT:
        this.events.emitTextReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.IMAGE:
        this.events.emitImageReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.AUDIO:
        this.events.emitAudioReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.DOCUMENT:
        this.events.emitDocumentReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.LOCATION:
        this.events.emitLocationReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.TEMPLATE:
        this.events.emitTemplateReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.INTERACTIVE:
        this.events.emitInteractiveReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.CONTACTS:
        this.events.emitContactsReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.SYSTEM:
        this.events.emitSystemReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.ORDER:
        this.events.emitOrderReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.PRODUCT:
        this.events.emitProductReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.VIDEO:
        this.events.emitVideoReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.STICKER:
        this.events.emitStickerReceived({ message: msg, contact, metadata });
        break;
      case WhatsAppMessageType.REACTION:
        this.events.emitReactionReceived({ message: msg, contact, metadata });
        break;
    }
  }
}
