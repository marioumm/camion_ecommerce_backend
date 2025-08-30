/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// settings-service/src/settings-service.service.ts
import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class SettingsServiceService {

  async saveLogo(data: { buffer: Buffer, originalname: string, mimetype: string }) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');

      try {
        await fsPromises.access(uploadsDir);
      } catch {
        await fsPromises.mkdir(uploadsDir, { recursive: true });
      }

      const ext = path.extname(data.originalname);
      const filename = `logo${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await fsPromises.writeFile(filepath, data.buffer);

      return {
        success: true,
        message: 'Logo uploaded successfully! ✅',
        filename,
        path: `/uploads/logos/${filename}`,
        size: data.buffer.length
      };
    } catch (error) {
      console.error('Error in saveLogo:', error);
      return {
        success: false,
        message: 'Failed to upload logo',
        error: error.message
      };
    }
  }

  async getLogoPath() {
    const logoDir = path.join(process.cwd(), 'uploads', 'logos');

    try {
      await fsPromises.access(logoDir);
    } catch {
      return { path: '/assets/default-logo.png' };
    }

    const files = await fsPromises.readdir(logoDir);
    const logoFile = files.find(file => file.startsWith('logo.'));

    return logoFile
      ? { path: `/uploads/logos/${logoFile}` }
      : { path: '/assets/default-logo.png' };
  }
}
