const jwt = require('jsonwebtoken');
const accessTokenKey = 'access-token'
const refreshTokenKey = 'refresh-token'


// Middleware to verify access token
exports.verifyAccessToken = (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization-access'];

        if (typeof bearerHeader !== 'undefined') {
            const accessArr = bearerHeader.split(' ');
            const accessToken = accessArr[1];

            jwt.verify(accessToken, accessTokenKey, (err, authUser) => {
                if (err) {
                    res.status(403).json({ message: 'Invalid Access Token' });
                } else {
                    req.user = authUser;
                    next();
                }
            });
        } else {
            res.status(401).send('Access Token is not provided.');
        }
    } catch (error) {
        console.error('Error verifying access token:', error);
        res.status(500).send('An error occurred while verifying the access token.');
    }
};


// Middleware to verify refresh token
exports.verifyRefreshToken = (req, res, next) => {
    try {
        const refreshHeader = req.headers['authorization-refresh'];

        if (typeof refreshHeader !== 'undefined') {
            const refreshArr = refreshHeader.split(' ');
            const refreshToken = refreshArr[1];

            jwt.verify(refreshToken, refreshTokenKey, (err, authUser) => {
                if (err) {
                    res.status(403).json({ message: 'Invalid Refresh Token' });
                } else {
                    req.refreshUser = authUser;
                    next();
                }
            });
        } else {
            res.status(401).send('Refresh Token is not provided.');
        }
    } catch (error) {
        console.error('Error verifying refresh token:', error);
        res.status(500).send('An error occurred while verifying the refresh token.');
    }
};

// Function to refresh tokens
exports.refreshTokens = async (req, res) => {
    try {
        const refreshHeader = req.headers['authorization-refresh'];

        if (typeof refreshHeader !== 'undefined') {
            const refreshArr = refreshHeader.split(' ');
            const refreshToken = refreshArr[1];

            jwt.verify(refreshToken, refreshTokenKey, (err, authUser) => {
                if (err) {
                    res.status(403).json({ message: 'Invalid Refresh Token' });
                } else {
                    const newAccessToken = jwt.sign({ authUser }, accessTokenKey, { expiresIn: '1000s' });
                    const newRefreshToken = jwt.sign({ authUser }, refreshTokenKey, { expiresIn: '5000s' });

                    res.json({
                        accessToken: newAccessToken,
                        message1: 'Access Token refreshed',
                        refreshToken: newRefreshToken,
                        message2: "Refresh Token refreshed again."
                    });
                }
            });
        } else {
            res.status(401).send('Refresh Token is not provided.');
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        res.status(500).send('An error occurred while refreshing the access token.');
    }
};