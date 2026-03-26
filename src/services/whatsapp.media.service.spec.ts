import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WhatsAppMediaService } from './whatsapp.media.service';
import {
  WhatsAppAuthException,
  WhatsAppRateLimitException,
} from '../exceptions/whatsapp.exceptions';

function mockGet<T>(data: T): jest.Mock {
  return jest.fn().mockReturnValue(of({ data } as AxiosResponse<T>));
}
function mockPost<T>(data: T): jest.Mock {
  return jest.fn().mockReturnValue(of({ data } as AxiosResponse<T>));
}
function mockDelete<T>(data: T): jest.Mock {
  return jest.fn().mockReturnValue(of({ data } as AxiosResponse<T>));
}
function mockError(status: number): jest.Mock {
  return jest.fn().mockReturnValue(throwError(() => ({ response: { status } })));
}

const liveConfig = {
  mode: 'live' as const,
  businessAccountId: 'waba-123',
  phoneNumberId: 'pn-123',
  accessToken: 'token-abc',
};

describe('WhatsAppMediaService', () => {
  let service: WhatsAppMediaService;
  let httpGet: jest.Mock;
  let httpPost: jest.Mock;
  let httpDelete: jest.Mock;

  beforeEach(async () => {
    httpGet = jest.fn();
    httpPost = jest.fn();
    httpDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppMediaService,
        {
          provide: HttpService,
          useValue: { get: httpGet, post: httpPost, delete: httpDelete },
        },
        { provide: 'WHATSAPP_CLIENT_LIVE', useValue: liveConfig },
      ],
    }).compile();

    service = module.get(WhatsAppMediaService);
  });

  describe('uploadMedia', () => {
    it('posts multipart form and returns media ID', async () => {
      httpPost.mockImplementation(mockPost({ id: 'media-id-1' }));
      const file = Buffer.from('fake-image-data');
      const result = await service.uploadMedia(file, 'image/jpeg', 'photo.jpg');
      expect(result).toEqual({ id: 'media-id-1' });
      expect(httpPost).toHaveBeenCalledWith(
        expect.stringContaining('/pn-123/media'),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
        })
      );
    });

    it('throws WhatsAppAuthException on 401', async () => {
      httpPost.mockImplementation(mockError(401));
      await expect(service.uploadMedia(Buffer.from('x'), 'image/jpeg')).rejects.toThrow(
        WhatsAppAuthException
      );
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpPost.mockImplementation(mockError(429));
      await expect(service.uploadMedia(Buffer.from('x'), 'image/jpeg')).rejects.toThrow(
        WhatsAppRateLimitException
      );
    });
  });

  describe('getMediaUrl', () => {
    it('returns normalized media URL response', async () => {
      const raw = {
        id: 'media-id-1',
        url: 'https://example.com/media',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        messaging_product: 'whatsapp',
      };
      httpGet.mockImplementation(mockGet(raw));
      const result = await service.getMediaUrl('media-id-1');
      expect(result).toEqual({
        id: 'media-id-1',
        url: 'https://example.com/media',
        mimeType: 'image/jpeg',
        sha256: 'abc123',
        fileSize: 12345,
        messagingProduct: 'whatsapp',
      });
      expect(httpGet).toHaveBeenCalledWith(
        expect.stringContaining('/media-id-1'),
        expect.objectContaining({ params: { phone_number_id: 'pn-123' } })
      );
    });

    it('throws WhatsAppAuthException on 401', async () => {
      httpGet.mockImplementation(mockError(401));
      await expect(service.getMediaUrl('media-id-1')).rejects.toThrow(WhatsAppAuthException);
    });
  });

  describe('deleteMedia', () => {
    it('returns true on success', async () => {
      httpDelete.mockImplementation(mockDelete({ deleted: true }));
      const result = await service.deleteMedia('media-id-1');
      expect(result).toBe(true);
      expect(httpDelete).toHaveBeenCalledWith(
        expect.stringContaining('/media-id-1'),
        expect.objectContaining({ params: { phone_number_id: 'pn-123' } })
      );
    });

    it('throws WhatsAppAuthException on 403', async () => {
      httpDelete.mockImplementation(mockError(403));
      await expect(service.deleteMedia('media-id-1')).rejects.toThrow(WhatsAppAuthException);
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpDelete.mockImplementation(mockError(429));
      await expect(service.deleteMedia('media-id-1')).rejects.toThrow(WhatsAppRateLimitException);
    });

    it('rethrows unknown errors', async () => {
      const unknown = new Error('network fail');
      httpDelete.mockReturnValue(throwError(() => unknown));
      await expect(service.deleteMedia('media-id-1')).rejects.toThrow('network fail');
    });
  });

  describe('sandbox client', () => {
    let sandboxService: WhatsAppMediaService;
    let sandboxHttpGet: jest.Mock;
    let sandboxHttpPost: jest.Mock;
    let sandboxHttpDelete: jest.Mock;

    beforeEach(async () => {
      sandboxHttpGet = jest.fn();
      sandboxHttpPost = jest.fn();
      sandboxHttpDelete = jest.fn();

      const sandboxConfig = {
        mode: 'sandbox' as const,
        testPhoneNumberId: 'sb-pn',
        temporaryAccessToken: 'sandbox-tok',
        testRecipients: [],
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppMediaService,
          {
            provide: HttpService,
            useValue: { get: sandboxHttpGet, post: sandboxHttpPost, delete: sandboxHttpDelete },
          },
          { provide: 'WHATSAPP_CLIENT_SANDBOX', useValue: sandboxConfig },
        ],
      }).compile();

      sandboxService = module.get(WhatsAppMediaService);
    });

    it('uploadMedia uses sandbox phoneNumberId and token', async () => {
      sandboxHttpPost.mockReturnValue(
        of({ data: { id: 'sb-media-1' } } as AxiosResponse<{ id: string }>)
      );
      const result = await sandboxService.uploadMedia(
        Buffer.from('x'),
        'image/jpeg',
        undefined,
        'sandbox'
      );
      expect(result).toEqual({ id: 'sb-media-1' });
      expect(sandboxHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('/sb-pn/media'),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer sandbox-tok' }),
        })
      );
    });

    it('deleteMedia returns deleted flag from response', async () => {
      sandboxHttpDelete.mockReturnValue(
        of({ data: { deleted: false } } as AxiosResponse<{ deleted: boolean }>)
      );
      const result = await sandboxService.deleteMedia('m1', 'sandbox');
      expect(result).toBe(false);
    });

    it('deleteMedia falls back to true when deleted field absent', async () => {
      sandboxHttpDelete.mockReturnValue(of({ data: {} } as AxiosResponse<{ deleted: boolean }>));
      const result = await sandboxService.deleteMedia('m1', 'sandbox');
      expect(result).toBe(true);
    });
  });
});
