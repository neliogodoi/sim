import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

interface R2UploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class R2UploadService {
  async uploadImage(file: File): Promise<string> {
    const uploadUrl = environment.r2Upload.url.trim();
    const uploadToken = environment.r2Upload.token.trim();

    if (!uploadUrl || !uploadToken) {
      throw new Error('Upload R2 nao configurado.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Selecione um arquivo de imagem.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter no maximo 5 MB.');
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'content-type': file.type,
        'x-upload-token': uploadToken,
      },
      body: file,
    });

    const data = (await response.json().catch(() => ({}))) as Partial<R2UploadResponse> & {
      error?: string;
    };

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Nao foi possivel enviar a imagem.');
    }

    return data.url;
  }
}
