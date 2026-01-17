const pool = require('../connection');
const bcrypt = require('bcrypt');
const logger = require('../../utils/logger');

class Extension {
  static async create(data) {
    const {
      username,
      password,
      displayName,
      email,
      enabled = true,
      callForwardEnabled = false,
      callForwardNumber = null,
      voicemailEnabled = true,
      recordingEnabled = false
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO extensions (
        username, password, display_name, email, enabled,
        call_forward_enabled, call_forward_number,
        voicemail_enabled, recording_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      username,
      hashedPassword,
      displayName,
      email,
      enabled,
      callForwardEnabled,
      callForwardNumber,
      voicemailEnabled,
      recordingEnabled
    ];

    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM extensions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM extensions WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM extensions WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.enabled !== undefined) {
      query += ` AND enabled = $${paramCount++}`;
      values.push(filters.enabled);
    }

    query += ' ORDER BY username ASC';

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.displayName !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(data.displayName);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.enabled !== undefined) {
      updates.push(`enabled = $${paramCount++}`);
      values.push(data.enabled);
    }
    if (data.callForwardEnabled !== undefined) {
      updates.push(`call_forward_enabled = $${paramCount++}`);
      values.push(data.callForwardEnabled);
    }
    if (data.callForwardNumber !== undefined) {
      updates.push(`call_forward_number = $${paramCount++}`);
      values.push(data.callForwardNumber);
    }
    if (data.voicemailEnabled !== undefined) {
      updates.push(`voicemail_enabled = $${paramCount++}`);
      values.push(data.voicemailEnabled);
    }
    if (data.recordingEnabled !== undefined) {
      updates.push(`recording_enabled = $${paramCount++}`);
      values.push(data.recordingEnabled);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE extensions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE extensions
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM extensions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async verifyPassword(extension, password) {
    return await bcrypt.compare(password, extension.password);
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      email: row.email,
      enabled: row.enabled,
      callForwardEnabled: row.call_forward_enabled,
      callForwardNumber: row.call_forward_number,
      voicemailEnabled: row.voicemail_enabled,
      recordingEnabled: row.recording_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Extension;
