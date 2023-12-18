import * as crypto from 'crypto';
import * as otpGenerator from 'otp-generator';
import * as twilio from 'twilio';
import { formatISO, addMinutes, isAfter } from 'date-fns';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { OneTimePassword } from './one-time-password.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

const hashOTP = (oneTimePassword: string, salt) =>
  new Promise<string>((resolve, reject) =>
    crypto.pbkdf2(oneTimePassword, salt, 1000, 64, `sha512`, (err, h) => {
      if (err) {
        reject(err);
      }
      resolve(h.toString('hex'));
    }),
  );

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(OneTimePassword)
    private otpRepository: Repository<OneTimePassword>,
  ) {}

  smsClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  async signIn(username: string, oneTimePassword: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const entry = await this.otpRepository.findOneBy({
      username,
    });

    if (isAfter(new Date(), new Date(entry.expiration))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const hash = await hashOTP(oneTimePassword, entry.salt);

    if (hash !== entry.hash) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    // TODO: Generate a token
    // TODO: Add endpoints for checking, updating token
    return { success: true };
  }

  async requestOTP(username: string): Promise<boolean> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.otpRepository.delete({ username });

    const oneTimePassword = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashOTP(oneTimePassword, salt);

    await this.otpRepository.insert({
      username,
      hash,
      salt,
      expiration: formatISO(addMinutes(new Date(), 15)),
    });

    await new Promise((resolve, reject) =>
      this.smsClient.messages
        .create({
          body: `Your one-time passcode is ${oneTimePassword}`,
          from: process.env.ONE_TIME_PASSWORD_SMS_SENDER_NUMBER,
          to: user.phoneNumber,
        })
        .then(resolve)
        .catch(reject),
    );
    return oneTimePassword;
  }
}
