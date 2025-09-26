import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id);

    const payload = { 
      email: user.email, 
      sub: user._id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear,
        gpa: user.gpa,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user data
    const userData = {
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role || UserRole.STUDENT,
      university: registerDto.university,
      major: registerDto.major,
      graduationYear: registerDto.graduationYear,
      gpa: registerDto.gpa,
      isActive: true,
      isVerified: false,
    };

    // Create user
    const user = await this.usersService.create(userData);

    // Generate JWT token
    const payload = { 
      email: user.email, 
      sub: user._id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear,
        gpa: user.gpa,
      },
    };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload = { 
      email: user.email, 
      sub: user._id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
