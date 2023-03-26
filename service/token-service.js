const db = require('../db');
const jwt = require('jsonwebtoken');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(accountId, refreshToken) {
    const tokenData = await db.query(`SELECT * FROM tokens WHERE account_id = $1`, [accountId]);
    if (tokenData.rows[0]) {
      const newToken = await db.query(
        `UPDATE tokens SET refresh_token = $1 WHERE account_id = $2 RETURNING *`,
        [refreshToken, accountId],
      );
      return newToken;
    }
    const token = await db.query(
      `INSERT INTO tokens(account_id, refresh_token) VALUES ($1, $2) RETURNING *`,
      [accountId, refreshToken],
    );
    return token;
  }
}

module.exports = new TokenService();
