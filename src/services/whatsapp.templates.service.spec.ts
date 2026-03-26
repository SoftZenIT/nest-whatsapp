import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WhatsAppTemplatesService } from './whatsapp.templates.service';
import {
  WhatsAppAuthException,
  WhatsAppRateLimitException,
} from '../exceptions/whatsapp.exceptions';
import type {
  WhatsAppCreateTemplateDto,
  WhatsAppTemplate,
} from '../interfaces/whatsapp-management.interfaces';

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

describe('WhatsAppTemplatesService', () => {
  let service: WhatsAppTemplatesService;
  let httpGet: jest.Mock;
  let httpPost: jest.Mock;
  let httpDelete: jest.Mock;

  beforeEach(async () => {
    httpGet = jest.fn();
    httpPost = jest.fn();
    httpDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppTemplatesService,
        { provide: HttpService, useValue: { get: httpGet, post: httpPost, delete: httpDelete } },
        { provide: 'WHATSAPP_CLIENT_LIVE', useValue: liveConfig },
      ],
    }).compile();

    service = module.get(WhatsAppTemplatesService);
  });

  describe('listTemplates', () => {
    it('returns an array of templates', async () => {
      const templates: WhatsAppTemplate[] = [
        { id: 't1', name: 'hello', status: 'APPROVED', category: 'UTILITY', language: 'en_US' },
      ];
      httpGet.mockImplementation(mockGet({ data: templates }));
      const result = await service.listTemplates('waba-123');
      expect(result).toEqual(templates);
      expect(httpGet).toHaveBeenCalledWith(
        expect.stringContaining('/waba-123/message_templates'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
        })
      );
    });

    it('throws WhatsAppAuthException on 401', async () => {
      httpGet.mockImplementation(mockError(401));
      await expect(service.listTemplates('waba-123')).rejects.toThrow(WhatsAppAuthException);
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpGet.mockImplementation(mockError(429));
      await expect(service.listTemplates('waba-123')).rejects.toThrow(WhatsAppRateLimitException);
    });
  });

  describe('getTemplate', () => {
    it('returns a template by ID', async () => {
      const template: WhatsAppTemplate = {
        id: 't1',
        name: 'hello',
        status: 'APPROVED',
        category: 'UTILITY',
        language: 'en_US',
      };
      httpGet.mockImplementation(mockGet(template));
      const result = await service.getTemplate('t1');
      expect(result).toEqual(template);
      expect(httpGet).toHaveBeenCalledWith(expect.stringContaining('/t1'), expect.anything());
    });

    it('throws WhatsAppAuthException on 401', async () => {
      httpGet.mockImplementation(mockError(401));
      await expect(service.getTemplate('t1')).rejects.toThrow(WhatsAppAuthException);
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpGet.mockImplementation(mockError(429));
      await expect(service.getTemplate('t1')).rejects.toThrow(WhatsAppRateLimitException);
    });

    it('rethrows unknown errors', async () => {
      const unknown = new Error('network fail');
      httpGet.mockReturnValue(throwError(() => unknown));
      await expect(service.getTemplate('t1')).rejects.toThrow('network fail');
    });
  });

  describe('createTemplate', () => {
    it('returns created template id', async () => {
      httpPost.mockImplementation(mockPost({ id: 'new-t1' }));
      const dto: WhatsAppCreateTemplateDto = {
        name: 'my_template',
        language: 'en_US',
        category: 'UTILITY',
      };
      const result = await service.createTemplate('waba-123', dto);
      expect(result).toEqual({ id: 'new-t1' });
      expect(httpPost).toHaveBeenCalledWith(
        expect.stringContaining('/waba-123/message_templates'),
        dto,
        expect.anything()
      );
    });

    it('throws WhatsAppAuthException on 403', async () => {
      httpPost.mockImplementation(mockError(403));
      await expect(
        service.createTemplate('waba-123', { name: 'x', language: 'en', category: 'UTILITY' })
      ).rejects.toThrow(WhatsAppAuthException);
    });
  });

  describe('updateTemplate', () => {
    it('returns true on success', async () => {
      httpPost.mockImplementation(mockPost({ success: true }));
      const result = await service.updateTemplate('t1', { category: 'MARKETING' });
      expect(result).toBe(true);
    });

    it('throws WhatsAppAuthException on 401', async () => {
      httpPost.mockImplementation(mockError(401));
      await expect(service.updateTemplate('t1', {})).rejects.toThrow(WhatsAppAuthException);
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpPost.mockImplementation(mockError(429));
      await expect(service.updateTemplate('t1', {})).rejects.toThrow(WhatsAppRateLimitException);
    });
  });

  describe('deleteTemplate', () => {
    it('returns true on success', async () => {
      httpDelete.mockImplementation(mockDelete({ success: true }));
      const result = await service.deleteTemplate('waba-123', 'hello');
      expect(result).toBe(true);
      expect(httpDelete).toHaveBeenCalledWith(
        expect.stringContaining('/waba-123/message_templates'),
        expect.objectContaining({ params: { name: 'hello' } })
      );
    });

    it('throws WhatsAppAuthException on 403', async () => {
      httpDelete.mockImplementation(mockError(403));
      await expect(service.deleteTemplate('waba-123', 'hello')).rejects.toThrow(
        WhatsAppAuthException
      );
    });

    it('throws WhatsAppRateLimitException on 429', async () => {
      httpDelete.mockImplementation(mockError(429));
      await expect(service.deleteTemplate('waba-123', 'hello')).rejects.toThrow(
        WhatsAppRateLimitException
      );
    });
  });
});
