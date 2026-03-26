import {
  getFirstEntry,
  getFirstChange,
  getValue,
  getFirstMessage,
  getAllEntries,
  getAllChanges,
  getAllValues,
  getAllMessages,
  getAllStatuses,
  getFirstContact,
  isTextMessage,
  isImageMessage,
  isAudioMessage,
  isDocumentMessage,
  isLocationMessage,
  isTemplateMessage,
  isInteractiveMessage,
  isVideoMessage,
  isStickerMessage,
  isContactsMessage,
  isSystemMessage,
  isOrderMessage,
  isProductMessage,
  isReactionMessage,
} from './webhook';
import type {
  WhatsAppWebhookPayload,
  WhatsAppWebhookChangeValue,
  WhatsAppMessage,
} from '../interfaces/webhook.interfaces';
import { unsafeCast } from '../test-utils/type-helpers';

describe('webhook utils', () => {
  const empty: WhatsAppWebhookPayload = { object: 'whatsapp_business_account', entry: [] };

  it('handles empty payload', () => {
    expect(getFirstEntry(empty)).toBeUndefined();
    expect(getFirstChange(empty)).toBeUndefined();
    expect(getValue(empty)).toBeUndefined();
    expect(getFirstMessage(empty)).toBeUndefined();
    expect(getAllEntries(empty)).toEqual([]);
    expect(getAllChanges(empty)).toEqual([]);
    expect(getAllValues(empty)).toEqual([]);
    expect(getAllMessages(empty)).toEqual([]);
    expect(getAllStatuses(empty)).toEqual([]);
  });

  it('handles missing entry and undefined changes/messages', () => {
    // Missing entry property entirely
    const noEntry = unsafeCast<WhatsAppWebhookPayload>({ object: 'whatsapp_business_account' });
    expect(getAllEntries(noEntry)).toEqual([]);
    expect(getAllChanges(noEntry)).toEqual([]);
    expect(getAllValues(noEntry)).toEqual([]);
    expect(getAllMessages(noEntry)).toEqual([]);

    // Entry with undefined changes
    const withUndefinedChanges = unsafeCast<WhatsAppWebhookPayload>({
      object: 'x',
      entry: [{ id: 'e', changes: undefined }],
    });
    expect(getAllChanges(withUndefinedChanges)).toEqual([]);

    // Change without messages (only statuses)
    const valueOnlyStatuses: WhatsAppWebhookChangeValue = {
      messaging_product: 'whatsapp',
      statuses: [{ id: '1', status: 'read' }],
    };
    const onlyStatuses: WhatsAppWebhookPayload = {
      object: 'x',
      entry: [{ id: 'e', changes: [{ field: 'messages', value: valueOnlyStatuses }] }],
    } as WhatsAppWebhookPayload;
    expect(getAllMessages(onlyStatuses)).toEqual([]);
    expect(getAllStatuses(onlyStatuses).length).toBe(1);
  });

  it('extracts elements from payload', () => {
    const msg1: WhatsAppMessage = { type: 'text', text: { body: 'a' } } as WhatsAppMessage;
    const msg2: WhatsAppMessage = { type: 'image', image: { link: 'u' } } as WhatsAppMessage;
    const value1: WhatsAppWebhookChangeValue = {
      messaging_product: 'whatsapp',
      messages: [msg1],
      statuses: [{ id: '1', status: 'sent' }],
    };
    const value2: WhatsAppWebhookChangeValue = { messaging_product: 'whatsapp', messages: [msg2] };
    const payload: WhatsAppWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        { id: 'e1', changes: [{ field: 'messages', value: value1 }] },
        { id: 'e2', changes: [{ field: 'messages', value: value2 }] },
      ],
    };
    expect(getFirstEntry(payload)?.id).toBe('e1');
    expect(getFirstChange(payload)?.field).toBe('messages');
    expect(getValue(payload)?.messages?.length).toBe(1);
    expect(getFirstMessage(payload)).toBe(msg1);
    expect(getAllEntries(payload).length).toBe(2);
    expect(getAllChanges(payload).length).toBe(2);
    expect(getAllValues(payload).length).toBe(2);
    expect(getAllMessages(payload)).toEqual([msg1, msg2]);
    expect(getAllStatuses(payload).length).toBe(1);
  });

  describe('getFirstContact', () => {
    it('returns the first contact when present', () => {
      const payload: WhatsAppWebhookPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'e1',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [{ wa_id: '123', profile: { name: 'Alice' } }],
                },
              },
            ],
          },
        ],
      };
      expect(getFirstContact(payload)?.wa_id).toBe('123');
    });

    it('returns undefined when no contacts', () => {
      expect(getFirstContact(empty)).toBeUndefined();
    });
  });

  describe('type guards', () => {
    const guards: Array<{
      name: string;
      fn: (msg: WhatsAppMessage | undefined) => boolean;
      type: WhatsAppMessage['type'];
      payload: Record<string, unknown>;
    }> = [
      { name: 'isTextMessage', fn: isTextMessage, type: 'text', payload: { text: { body: 'hi' } } },
      {
        name: 'isImageMessage',
        fn: isImageMessage,
        type: 'image',
        payload: { image: { link: 'u' } },
      },
      {
        name: 'isAudioMessage',
        fn: isAudioMessage,
        type: 'audio',
        payload: { audio: { link: 'u' } },
      },
      {
        name: 'isDocumentMessage',
        fn: isDocumentMessage,
        type: 'document',
        payload: { document: { link: 'u' } },
      },
      {
        name: 'isLocationMessage',
        fn: isLocationMessage,
        type: 'location',
        payload: { location: { latitude: 0, longitude: 0 } },
      },
      {
        name: 'isTemplateMessage',
        fn: isTemplateMessage,
        type: 'template',
        payload: { template: { name: 't' } },
      },
      {
        name: 'isInteractiveMessage',
        fn: isInteractiveMessage,
        type: 'interactive',
        payload: { interactive: { type: 'button' } },
      },
      {
        name: 'isVideoMessage',
        fn: isVideoMessage,
        type: 'video',
        payload: { video: { link: 'u' } },
      },
      {
        name: 'isStickerMessage',
        fn: isStickerMessage,
        type: 'sticker',
        payload: { sticker: { link: 'u' } },
      },
      {
        name: 'isContactsMessage',
        fn: isContactsMessage,
        type: 'contacts',
        payload: { contacts: [] },
      },
      {
        name: 'isSystemMessage',
        fn: isSystemMessage,
        type: 'system',
        payload: { system: { body: 'x' } },
      },
      {
        name: 'isOrderMessage',
        fn: isOrderMessage,
        type: 'order',
        payload: { order: { catalog_id: 'c' } },
      },
      {
        name: 'isProductMessage',
        fn: isProductMessage,
        type: 'product',
        payload: { product: { retailer_id: 'r' } },
      },
      {
        name: 'isReactionMessage',
        fn: isReactionMessage,
        type: 'reaction',
        payload: { reaction: { message_id: 'm' } },
      },
    ];

    for (const { name, fn, type, payload } of guards) {
      it(`${name}: returns true for matching type`, () => {
        const msg = { type, ...payload } as unknown as WhatsAppMessage;
        expect(fn(msg)).toBe(true);
      });

      it(`${name}: returns false for non-matching type`, () => {
        const other = { type: 'text', text: { body: 'x' } } as WhatsAppMessage;
        if (type !== 'text') expect(fn(other)).toBe(false);
        else {
          const alt = { type: 'image', image: { link: 'u' } } as WhatsAppMessage;
          expect(isImageMessage(alt)).toBe(true); // sanity: image guard passes for image
          expect(fn({ type: 'image', image: { link: 'u' } } as WhatsAppMessage)).toBe(false);
        }
      });

      it(`${name}: returns false for undefined`, () => {
        expect(fn(undefined)).toBe(false);
      });
    }
  });
});
