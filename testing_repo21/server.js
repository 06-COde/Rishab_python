require('module-alias/register');
require('dotenv').config({ path: '../../.env' });

const express = require('express');
const cors = require('cors');

// Import configuration and middleware
const config = require('@shared/config');
const { users: logger, logStartupBanner } = require('@shared/utils/logger');
const {
    requestLogger,
    errorHandler,
    healthCheck,
    addRequestId,
    createRateLimit,
    securityMiddleware
} = require('./middleware');

// Import routes
const user_routes = require('./user_routes');

// Initialize express app
const app = express();
app.set('trust proxy', 'loopback');

// Debug: Log all route/middleware registrations
const debugRegister = (type, path) => {
    console.log(`[DEBUG] Registering ${type} on path:`, path);
};

// Security middleware (helmet, etc.)
app.use(securityMiddleware);
debugRegister('middleware', 'securityMiddleware');

// Rate limiting
const apiRateLimit = createRateLimit(
    config.rateLimit.windowMs, 
    config.rateLimit.max,
    'Too many API requests, please try again later.'
);

app.use(`/${config.routes.user}`, apiRateLimit);
debugRegister('middleware', `/${config.routes.user} (apiRateLimit)`);

// Enhanced CORS configuration (secure)
const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
  
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
        : [
            'http://localhost:4007',
            'http://localhost:4040',
            'http://localhost:8080',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:4015',
            'https://oms-ims.onrender.com', // ✅ Add your production frontend
          ];
  
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // ✅ Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'Cookie',
    ],
    exposedHeaders: ['X-Request-ID', 'Set-Cookie'],
  };
  

app.use(cors(corsOptions));
debugRegister('middleware', 'cors');

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
debugRegister('middleware', 'express.json');
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
debugRegister('middleware', 'express.urlencoded');

// Request ID and logging middleware
app.use(addRequestId);
debugRegister('middleware', 'addRequestId');
app.use(requestLogger);
debugRegister('middleware', 'requestLogger');

// Health check endpoint
app.get(`/${config.routes.user}/health`, healthCheck);
debugRegister('route', `/${config.routes.user}/health`);

// API documentation endpoint
app.get('/', async(req, res) => {
    res.redirect(`/${config.routes.user}/docs`);  
});

app.get(`/${config.routes.user}/docs`, async (req, res) => {
    debugRegister('route', `/${config.routes.user}/docs`);
    const PORT = config.port.user;
    const base_url = `http://localhost:${PORT}`;    
    const apiDocumentation = {
        service: 'User Management Service',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: {
                url: `${base_url}/${config.routes.user}/health`,
                method: 'GET',
                description: 'Service health check'
            },
            // NEW PROFILE ENDPOINT
            getProfile: {
                url: `${base_url}/${config.routes.user}/profile`,
                method: 'GET',
                description: 'Get user profile information',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    }
                }
            },
            // NEW REFRESH TOKEN ENDPOINT
            refreshToken: {
                url: `${base_url}/${config.routes.user}/refresh-token`,
                method: 'POST',
                description: 'Refresh access token using refresh token',
                parameters: {
                    refreshToken: {
                        type: 'string',
                        required: true,
                        description: 'Valid refresh token'
                    }
                }
            },
            resendOTP: {
                url: `${base_url}/${config.routes.user}/resend_otp`,
                method: 'POST',
                description: 'Resend OTP.',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    },
                    event: {
                        type: 'string',
                        required: true,
                        description: 'event required to identify the action',
                        value: "'Reset Password' to resend otp at reset password OR 'Register' to resend otp at register time",
                    }                 
                }
            },
            registerNewUsers: {
                url: `${base_url}/${config.routes.user}/register`,
                method: 'POST',
                description: 'Register New Users',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    },
                    phone: {
                        type: 'string',
                        required: true,
                        description: 'User identifier'
                    },
                    companyName: {
                        type: 'string',
                        required: false,
                        description: 'User identifier'
                    },
                    password: {
                        type: 'string',
                        required: true,
                        description: 'User account password'
                    },
                    first_name: {
                        type: 'string',
                        required: true,
                        description: 'User first name'
                    },
                    last_name: {
                        type: 'string',
                        required: true,
                        description: 'User last name'
                    }                    
                }
            },
            verifyAccount: {
                url: `${base_url}/${config.routes.user}/register_auth`, // Corrected to match route
                method: 'POST',
                description: 'Account verification for newly registered users.',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    },
                    otp: {
                        type: 'string',
                        required: true,
                        description: '6-digit OTP received via email'
                    }                
                }
            },
            login: {
    url: `${base_url}/${config.routes.user}/login`,
    method: 'POST',
    description: 'Login user using their credentials. Returns access and refresh tokens.',
    parameters: {
        email: {
            type: 'string',
            required: true,
            description: 'User account identifier'
        },
        password: {
            type: 'string',
            required: true,
            description: 'User account password'
        }                
    },
    response: {
        accessToken: 'JWT access token (15min expiry)',
        refreshToken: 'JWT refresh token (7 days expiry)',
        tokenType: 'Bearer',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
        user: 'User profile object'
    }
},
            forgotPassword: {
                url: `${base_url}/${config.routes.user}/reset_pass_user_auth`, // Corrected to match route
                method: 'POST',
                description: 'Email verification to the user before resetting the password (sends OTP).',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    }             
                }
            },
            verifyResetPasswordOTP: {
                url: `${base_url}/${config.routes.user}/reset_pass_otp_auth`, // Corrected to match route
                method: 'POST',
                description: 'OTP verification before resetting the password.',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    },
                    otp: {
                        type: 'string',
                        required: true,
                        description: '6-digit OTP received via email'
                    }             
                }
            },
            updateNewPassword: {
                url: `${base_url}/${config.routes.user}/reset_password`,
                method: 'POST',
                description: 'After OTP verification, update the new password.',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    },
                    newPassword: {
                        type: 'string',
                        required: true,
                        description: 'New password for the account'
                    }             
                }
            },
            logout: {
                url: `${base_url}/${config.routes.user}/logout`,
                method: 'POST',
                description: 'Invalidate tokens in the database and clear authentication cookies.',
                parameters: {
                    email: {
                        type: 'string',
                        required: true,
                        description: 'User account identifier'
                    }             
                }
            }
        },
        authentication: {
            type: 'JWT Tokens + Cookies',
            features: [
                'Access Token (15min expiry)',
                'Refresh Token (7 days expiry)',
                'HTTP-only Cookies',
                'Automatic token refresh'
            ]
        },
        rateLimit: {
            windowMs: config.rateLimit.windowMs,
            maxRequests: config.rateLimit.max
        },
        security: {
            cors: 'enabled',
            helmet: 'enabled',
            rateLimit: 'enabled',
            inputValidation: 'enabled',
            httpOnlyCookies: 'enabled'
        }
    };
    res.json(apiDocumentation);
});

// user API routes
app.use(`/${config.routes.user}`, user_routes);
debugRegister('middleware', `/${config.routes.user} (user_router)`);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    debugRegister('middleware', '* (404 handler)');
    logger.warn('404 - Route not found', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip
    });
    
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist',
        requestId: req.requestId,
        availableEndpoints: [
            `/${config.routes.user}/docs`,
            `/${config.routes.user}/health`,
            `/${config.routes.user}/profile`, // NEW
            `/${config.routes.user}/refresh-token`, // NEW
            `/${config.routes.user}/register`,
            `/${config.routes.user}/register_auth`, // Corrected
            `/${config.routes.user}/login`,
            `/${config.routes.user}/reset_pass_user_auth`, // Corrected
            `/${config.routes.user}/reset_pass_otp_auth`, // Corrected
            `/${config.routes.user}/reset_password`,
            `/${config.routes.user}/resend_otp`, 
            `/${config.routes.user}/logout`
        ]
    });
});

// Global error handler (must be last)
app.use(errorHandler);
debugRegister('middleware', 'errorHandler');

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        reason: reason,
        promise: promise
    });
    process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// Start server
const PORT = config.port.user;
const base_url = `http://localhost:${PORT}`;

const server = app.listen(PORT, () => {
    logStartupBanner('User Service', '1.0.0', PORT, base_url);
});

// Handle server startup errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} already in use`, { port: PORT });
    } else {
        logger.error('Server startup failed', { error: error.message });
    }
    process.exit(1);
});

module.exports = app;