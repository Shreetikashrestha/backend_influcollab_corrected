import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { HttpError } from '../../errors/http-error';
import bcrypt from 'bcryptjs';

// Mock the repository and bcrypt
jest.mock('../../repositories/user.repository');
jest.mock('bcryptjs');

describe('UserService Unit Tests', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        // Create mock repository
        mockUserRepository = {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
            getUserById: jest.fn(),
            updateOneUser: jest.fn(),
            deleteOneUser: jest.fn(),
            getAllUsers: jest.fn(),
        } as any;

        // Inject mock repository into service
        userService = new UserService(mockUserRepository);
        
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        const userData = {
            email: 'test@example.com',
            password: 'Test@1234',
            fullName: 'Test User',
            role: 'influencer' as const,
            isInfluencer: true
        };

        test('should register a new user successfully', async () => {
            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                _id: '123',
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(mockUser as any);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await userService.registerUser(userData);

            expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(mockUserRepository.createUser).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.email).toBe(userData.email);
        });

        test('should throw error if email already exists', async () => {
            const existingUser = { email: userData.email };
            mockUserRepository.getUserByEmail.mockResolvedValue(existingUser as any);

            await expect(userService.registerUser(userData))
                .rejects
                .toThrow(HttpError);
            
            expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
        });

        test('should hash password before creating user', async () => {
            const hashedPassword = 'hashedPassword123';
            
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue({ ...userData, password: hashedPassword } as any);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            await userService.registerUser(userData);

            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(mockUserRepository.createUser).toHaveBeenCalled();
        });
    });

    describe('loginUser', () => {
        const loginData = {
            email: 'test@example.com',
            password: 'Test@1234'
        };

        test('should login user with valid credentials', async () => {
            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                _id: '123',
                email: loginData.email,
                password: hashedPassword,
                fullName: 'Test User',
                role: 'influencer',
                isInfluencer: true
            };

            mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await userService.loginUser(loginData);

            expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, hashedPassword);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
        });

        test('should throw error if user not found', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            await expect(userService.loginUser(loginData))
                .rejects
                .toThrow(HttpError);
        });

        test('should throw error if password is incorrect', async () => {
            const mockUser = {
                _id: '123',
                email: loginData.email,
                password: 'hashedPassword'
            };

            mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.loginUser(loginData))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe('getUserById', () => {
        test('should return user by id', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                fullName: 'Test User'
            };

            mockUserRepository.getUserById.mockResolvedValue(mockUser as any);

            const result = await userService.getUserById('123');

            expect(mockUserRepository.getUserById).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockUser);
        });

        test('should throw error if user not found', async () => {
            mockUserRepository.getUserById.mockResolvedValue(null);

            await expect(userService.getUserById('123'))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe('updateUser', () => {
        test('should update user successfully', async () => {
            const updateData = {
                fullName: 'Updated Name'
            };

            const mockUpdatedUser = {
                _id: '123',
                email: 'test@example.com',
                fullName: 'Updated Name'
            };

            mockUserRepository.updateOneUser.mockResolvedValue(mockUpdatedUser as any);

            const result = await userService.updateUser('123', updateData);

            expect(mockUserRepository.updateOneUser).toHaveBeenCalledWith('123', updateData);
            expect(result.fullName).toBe(updateData.fullName);
        });

        test('should throw error if user not found', async () => {
            mockUserRepository.updateOneUser.mockResolvedValue(null);

            await expect(userService.updateUser('123', {}))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe('deleteUser', () => {
        test('should delete user successfully', async () => {
            mockUserRepository.deleteOneUser.mockResolvedValue(true);

            const result = await userService.deleteUser('123');

            expect(mockUserRepository.deleteOneUser).toHaveBeenCalledWith('123');
            expect(result).toEqual({ message: 'User deleted successfully' });
        });

        test('should throw error if user not found', async () => {
            mockUserRepository.deleteOneUser.mockResolvedValue(null);

            await expect(userService.deleteUser('123'))
                .rejects
                .toThrow(HttpError);
        });
    });
});
