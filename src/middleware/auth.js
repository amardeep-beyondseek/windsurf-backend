const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize the JWKS client to fetch public keys from Keycloak
const client = jwksClient({
  jwksUri: 'http://0.0.0.0:8080/realms/windsurf/protocol/openid-connect/certs',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5
});

// Function to get the signing key
const getSigningKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

/**
 * Middleware to validate Keycloak access tokens
 * This middleware extracts the Bearer token from the Authorization header,
 * verifies it against the Keycloak public key, and attaches the decoded token
 * to the request object if valid.
 */
const validateToken = (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Headers:', req.headers);
  
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  // Check if the authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('No valid Authorization header found');
    
    // For development only - allow requests without tokens
    // IMPORTANT: Remove this in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      console.warn('DEVELOPMENT MODE: Allowing request without valid token');
      req.user = { developmentMode: true };
      return next();
    }
    
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  console.log('Token received:', token.substring(0, 10) + '...');
  
  // Verify the token
  jwt.verify(token, getSigningKey, {
    algorithms: ['RS256'],
    issuer: 'http://0.0.0.0:8080/realms/windsurf'
  }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      
      // For development only - allow requests with invalid tokens
      // IMPORTANT: Remove this in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        console.warn('DEVELOPMENT MODE: Allowing request with invalid token');
        req.user = { developmentMode: true };
        return next();
      }
      
      return res.status(401).json({ error: 'Invalid access token' });
    }
    
    // Attach the decoded token to the request object
    req.user = decoded;
    console.log('Token verified successfully');
    
    // Continue to the next middleware or route handler
    next();
  });
};

/**
 * Middleware to check if the user has the required roles
 * @param {string[]} requiredRoles - Array of roles required to access the resource
 */
const hasRoles = (requiredRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get user roles from the token
    const userRoles = req.user.realm_access?.roles || [];
    
    // Check if the user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // User has the required role, continue
    next();
  };
};

module.exports = {
  validateToken,
  hasRoles
};
