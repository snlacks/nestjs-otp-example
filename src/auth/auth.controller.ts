import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO } from './sign-in.dto';
import { RequestOTPDTO } from './one-time-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('request-otp')
  requestOTP(@Body() requestOTPDTO: RequestOTPDTO) {
    return this.authService.requestOTP(requestOTPDTO.username);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDTO) {
    return this.authService.signIn(
      signInDto.username,
      signInDto.oneTimePassword,
    );
  }
}
