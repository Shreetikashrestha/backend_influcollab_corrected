# Re-WebAPI Backend - Copilot Instructions

## Project Overview
This is a **Node.js/Express/TypeScript backend API** for a mobile influencer platform featuring user auth, campaigns, messaging, and payments. Uses **MongoDB**, **Socket.io** for real-time messaging, and **JWT tokens** for authentication.

## Architecture Patterns

### 1. Layered Request Flow
```
Routes → Controllers → Services → Repositories → MongoDB
```
- **Routes** ([src/routes/](src/routes/)) - Define endpoints, instantiate controllers
- **Controllers** ([src/controllers/](src/controllers/)) - Handle req/res, validate with Zod DTOs, throw `HttpError`
- **Services** ([src/services/](src/services/)) - Contain business logic (hashing, JWT, validation)
- **Repositories** ([src/repositories/](src/repositories/)) - Mongoose queries, return models directly
- **Models** ([src/models/](src/models/)) - Mongoose schemas with interfaces extending `Document`

### 2. Error Handling
- Custom `HttpError` class ([src/errors/http-error.ts](src/errors/http-error.ts)) with `statusCode` property
- Controllers wrap logic in try/catch, returning structured JSON: `{ success: bool, data?, message }`
- Zod validation failures return 400 with `z.prettifyError()`

### 3. Authentication & Authorization
- **JWT tokens** stored in `Authorization: Bearer <token>` header
- **Middleware**: `authorizedMiddleware` decodes token → attaches `req.user` (from DB) → calls `next()`
- **Role-based**: Check `req.user.role` ('admin' or 'user') in middleware or controllers
- **Token payload** includes: `id`, `email`, `role`, `isInfluencer` (30-day expiry)

### 4. Validation with Zod
- DTOs in [src/dtos/](src/dtos/) define schema via `z.object()` with custom refinements
- Controllers call `DTO.safeParse(req.body)`, handling `success: false` case
- Example: [src/dtos/user.dto.ts](src/dtos/user.dto.ts) accepts `fullName` OR `name` alias

### 5. Real-time Communication
- **Socket.io** initialized in [src/index.ts](src/index.ts#L21-L48) with CORS for localhost:3000/3003
- Events: `join_conversation`, `typing`, `stop_typing`, `disconnect`
- Socket instance passed to controllers via `req.io` middleware (line 58)

## Key Files & Responsibilities

| File | Purpose |
|------|---------|
| [src/config/index.ts](src/config/index.ts) | Load env vars (PORT, MONGODB_URI, JWT_SECRET, SMTP_*, FRONTEND_URL) |
| [src/database/mongodb.ts](src/database/mongodb.ts) | Mongoose connection function called in `start()` |
| [src/middleware/authorization.middleware.ts](src/middleware/authorization.middleware.ts) | Decode JWT, fetch user, attach to req |
| [src/middleware/brand.middleware.ts](src/middleware/brand.middleware.ts) | Verify req.user is brand/admin |
| [src/middleware/influencer.middleware.ts](src/middleware/influencer.middleware.ts) | Verify req.user.isInfluencer === true |
| [src/services/email.service.ts](src/services/email.service.ts) | Nodemailer integration (password reset, notifications) |

## Conventions & Patterns

1. **Constructor Injection**: Services/controllers instantiate dependencies at class/method level
   ```typescript
   let userService = new UserService();
   export class AuthController { async register(req, res) { ... } }
   ```

2. **Route Pattern**: Import controller, instantiate, define routes on Router
   ```typescript
   let controller = new Controller();
   router.post('/path', controller.method);
   ```

3. **Request User**: Always check `req.user` exists via `authorizedMiddleware` before using it

4. **Password Hashing**: Use bcrypt.hash(password, 10), never store plain text

5. **Timestamps**: Add `timestamps: true` to Mongoose schemas for `createdAt`/`updatedAt`

6. **Response Format**: Controllers return consistent JSON structure with `success`, `data`, `message` fields

## Development Workflow

```bash
npm run dev        # Start with nodemon (ts-node, hot-reload)
npm run build      # Compile TypeScript → dist/
npm start          # Run compiled dist/index.js
npm test           # Jest tests (configure in jest.config.js)
```

## Cross-Module Communication
- **User → Campaign**: Campaigns reference `userId` in schema
- **User → Message**: Messages link `senderId`/`recipientId` to User docs
- **Conversation**: Model references `participantIds` (array of user IDs)
- **Profile**: Brand/Influencer profiles extend core user with domain-specific fields

## Testing Notes
- Test patterns in [src/tests/user_mgmt.test.ts](src/tests/user_mgmt.test.ts) use Jest + Supertest
- Set `NODE_ENV=test`, use separate test DB connection
- Mock services where needed to avoid DB calls
