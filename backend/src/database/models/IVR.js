const pool = require('../connection');

class IVR {
  static async create(data) {
    const {
      name,
      description,
      greetingFile,
      timeout = 10,
      maxAttempts = 3,
      invalidAudioFile,
      timeoutAudioFile,
      config,
      enabled = true
    } = data;

    const query = `
      INSERT INTO ivr_menus (
        name, description, greeting_file, timeout, max_attempts,
        invalid_audio_file, timeout_audio_file, config, enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      name,
      description,
      greetingFile,
      timeout,
      maxAttempts,
      invalidAudioFile,
      timeoutAudioFile,
      JSON.stringify(config),
      enabled
    ];

    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM ivr_menus WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM ivr_menus WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.enabled !== undefined) {
      query += ` AND enabled = $${paramCount++}`;
      values.push(filters.enabled);
    }

    query += ' ORDER BY name ASC';
    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.greetingFile !== undefined) {
      updates.push(`greeting_file = $${paramCount++}`);
      values.push(data.greetingFile);
    }
    if (data.timeout !== undefined) {
      updates.push(`timeout = $${paramCount++}`);
      values.push(data.timeout);
    }
    if (data.maxAttempts !== undefined) {
      updates.push(`max_attempts = $${paramCount++}`);
      values.push(data.maxAttempts);
    }
    if (data.config !== undefined) {
      updates.push(`config = $${paramCount++}`);
      values.push(JSON.stringify(data.config));
    }
    if (data.enabled !== undefined) {
      updates.push(`enabled = $${paramCount++}`);
      values.push(data.enabled);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE ivr_menus
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM ivr_menus WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      greetingFile: row.greeting_file,
      timeout: row.timeout,
      maxAttempts: row.max_attempts,
      invalidAudioFile: row.invalid_audio_file,
      timeoutAudioFile: row.timeout_audio_file,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = IVR;
