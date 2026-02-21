# Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Install test dependency
npm install --save-dev mongodb-memory-server

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app.ts              # Express app configuration
├── index.ts            # Server entry point
├── config/             # Configuration
│   ├── index.ts       # Environment variables
│   └── socket.ts      # Socket.io setup
├── controllers/        # HTTP request handlers
├── services/          # Business logic
├── repositories/      # Data access layer
├── models/            # Mongoose schemas
├── routes/            # API endpoints
├── middleware/        # Express middleware
├── dtos/              # Data Transfer Objects
├── types/             # TypeScript types
├── errors/            # Custom errors
└── tests/             # Test files
    ├── setup.ts       # Test configuration
    └── integration/   # Integration tests
```

## 🔄 Data Flow

```
Request → Route → Middleware → Controller → Service → Repository → Model → Database
                                                                              ↓
Response ← Route ← Middleware ← Controller ← Service ← Repository ← Model ← Database
```

## 📝 Code Examples

### Creating a New Repository

```typescript
// src/repositories/example.repository.ts
import Example from '../models/example.model';
import { IExample } from '../types/example.type';

export class ExampleRepository {
    async create(data: Partial<IExample>): Promise<IExample> {
        const example = new Example(data);
        return await example.save();
    }

    async findById(id: string): Promise<IExample | null> {
        return await Example.findById(id);
    }

    async findAll(): Promise<IExample[]> {
        return await Example.find();
    }

    async update(id: string, data: Partial<IExample>): Promise<IExample | null> {
        return await Example.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IExample | null> {
        return await Example.findByIdAndDelete(id);
    }
}

export default new ExampleRepository();
```

### Creating a New Service

```typescript
// src/services/example.service.ts
import exampleRepository from '../repositories/example.repository';
import { IExample } from '../types/example.type';

export class ExampleService {
    async create(data: any): Promise<IExample> {
        // Business validation
        if (!data.name) {
            throw new Error('Name is required');
        }

        // Create record
        const example = await exampleRepository.create(data);

        // Additional business logic
        // e.g., send notification, update related records, etc.

        return example;
    }

    async getById(id: string): Promise<IExample | null> {
        const example = await exampleRepository.findById(id);
        if (!example) {
            throw new Error('Example not found');
        }
        return example;
    }

    async getAll(): Promise<IExample[]> {
        return await exampleRepository.findAll();
    }

    async update(id: string, data: any): Promise<IExample> {
        const example = await exampleRepository.update(id, data);
        if (!example) {
            throw new Error('Example not found');
        }
        return example;
    }

    async delete(id: string): Promise<void> {
        const example = await exampleRepository.delete(id);
        if (!example) {
            throw new Error('Example not found');
        }
    }
}

export default new ExampleService();
```

### Creating a New Controller

```typescript
// src/controllers/example.controller.ts
import { Request, Response } from 'express';
import exampleService from '../services/example.service';

export class ExampleController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            const result = await exampleService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await exampleService.getById(id);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await exampleService.getAll();
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await exampleService.update(id, data);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await exampleService.delete(id);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default new ExampleController();
```

### Creating Routes

```typescript
// src/routes/example.route.ts
import { Router } from 'express';
import exampleController from '../controllers/example.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';

const router = Router();

router.post('/', authorizedMiddleware, exampleController.create);
router.get('/', exampleController.getAll);
router.get('/:id', exampleController.getById);
router.put('/:id', authorizedMiddleware, exampleController.update);
router.delete('/:id', authorizedMiddleware, exampleController.delete);

export default router;
```

### Adding Routes to App

```typescript
// src/app.ts
import exampleRoutes from './routes/example.route';

// ... other imports and setup

app.use('/api/examples', exampleRoutes);
```

### Creating a Type Definition

```typescript
// src/types/example.type.ts
import { Document, Types } from 'mongoose';

export interface IExample extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
```

### Creating a Model

```typescript
// src/models/example.model.ts
import mongoose, { Schema } from 'mongoose';
import { IExample } from '../types/example.type';

const exampleSchema = new Schema<IExample>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IExample>('Example', exampleSchema);
```

### Writing Integration Tests

```typescript
// src/tests/integration/example.test.ts
import request from 'supertest';
import app from '../../app';

describe('Example API', () => {
    describe('POST /api/examples', () => {
        it('should create a new example', async () => {
            const response = await request(app)
                .post('/api/examples')
                .send({
                    name: 'Test Example',
                    description: 'Test Description',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
        });
    });

    describe('GET /api/examples', () => {
        it('should get all examples', async () => {
            const response = await request(app).get('/api/examples');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
```

## 🔐 Authentication

### Protected Routes

```typescript
import { authorizedMiddleware } from '../middleware/authorization.middleware';

router.post('/', authorizedMiddleware, controller.create);
```

### Role-Based Access

```typescript
import { authorizedMiddleware } from '../middleware/authorization.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

router.delete('/:id', authorizedMiddleware, adminMiddleware, controller.delete);
```

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- example.test.ts
```

## 🐛 Debugging

### VS Code Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/index.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## 📊 Common Patterns

### Pagination

```typescript
async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const items = await Example.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = await Example.countDocuments();
    
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
```

### Search/Filter

```typescript
async search(query: string, filters: any) {
    const searchQuery: any = {};
    
    if (query) {
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ];
    }
    
    if (filters.status) {
        searchQuery.status = filters.status;
    }
    
    return await Example.find(searchQuery);
}
```

### Populate Relations

```typescript
async findById(id: string) {
    return await Example.findById(id)
        .populate('userId')
        .populate('categoryId');
}
```

## 🔗 Useful Links

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Documentation](https://jestjs.io/)
- [Socket.io Documentation](https://socket.io/)

## 💡 Tips

1. **Always use repositories** - Never access models directly from controllers
2. **Keep services focused** - One service per domain entity
3. **Write tests first** - TDD helps design better APIs
4. **Use TypeScript strictly** - Enable strict mode in tsconfig.json
5. **Handle errors properly** - Use try-catch and custom error classes
6. **Validate input** - Use Zod schemas for validation
7. **Document your code** - Add JSDoc comments for complex functions
8. **Keep functions small** - Single responsibility principle
9. **Use async/await** - Avoid callback hell
10. **Log important events** - But don't log sensitive data

## 🚨 Common Mistakes to Avoid

❌ Accessing models directly in controllers
✅ Use services and repositories

❌ Mixing business logic in controllers
✅ Keep business logic in services

❌ Not handling errors
✅ Use try-catch and proper error responses

❌ Not validating input
✅ Use DTOs and validation schemas

❌ Hardcoding values
✅ Use environment variables

❌ Not writing tests
✅ Write tests for all new features

❌ Committing sensitive data
✅ Use .env files and .gitignore
