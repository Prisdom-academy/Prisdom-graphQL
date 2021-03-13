import { ReadStream } from 'typeorm/platform/PlatformTools';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Bucket, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '../interfaces/EnvVariable.interface';

export enum StorageFolder {
  instructor = 'Instructors',
  course = 'Courses',
  ClientUsers = 'ClientUsers',
}

@Injectable()
export class GCStorageService {
  private bucket: Bucket;

  constructor(private configService: ConfigService<EnvVariable>) {
    const storage = new Storage({
      projectId: this.configService.get('PROJECT_ID'),
      keyFile: this.configService.get('KEY_FILE_PATH'),
    });
    this.bucket = storage.bucket('schoolx-dev-bucket');
  }

  getFiles() {
    return this.bucket.getFiles();
  }

  uploadFile(config: {
    fileName: string;
    readStream: ReadStream;
    type: StorageFolder;
    makePublic: boolean;
  }): Promise<{ publicUrl: string; filePath: string }> {
    const { fileName, readStream, type, makePublic } = config;
    return new Promise((resolve) => {
      const filePath = `${type}/${this.makeFileNameUnique(fileName)}`;
      const cloudFile = this.bucket.file(filePath);
      readStream
        .pipe(cloudFile.createWriteStream())
        .on('error', (err) => {
          throw new InternalServerErrorException(err);
        })
        .on('finish', async () => {
          if (makePublic) {
            try {
              await cloudFile.makePublic();
            } catch (err) {
              throw new InternalServerErrorException(err);
            }
          }
          resolve({
            publicUrl: cloudFile.publicUrl(),
            filePath,
          });
        });
    });
  }

  async deleteFile(filePath: string) {
    const cloudFile = this.bucket.file(filePath);

    try {
      await cloudFile.delete();
      return true;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  private makeFileNameUnique(fileName: string) {
    const fileNameArr = fileName.split('.');
    if (fileNameArr.length !== 2) {
      throw new InternalServerErrorException(
        'File name should be like "image.jpg")',
      );
    }
    const randomNumber = Math.random().toString(24).slice(2, 15);
    return `${fileNameArr[0]}-${randomNumber}.${fileNameArr[1]}`;
  }
}
