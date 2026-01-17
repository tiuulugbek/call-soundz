const pool = require('../connection');

class Recording {
  static async create(data) {
    const {
      callId,
      filePath,
      fileName,
      fileSize,
      duration,
      format = 'wav'
    } = data;

    const query = `
      INSERT INTO recordings (
        call_id, file_path, file_name, file_size, duration, format
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [callId, filePath, fileName, fileSize, duration, format];
    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM recordings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findByCallId(callId) {
    const query = 'SELECT * FROM recordings WHERE call_id = $1';
    const result = await pool.query(query, [callId]);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM recordings WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.fromDate) {
      query += ` AND created_at >= $${paramCount++}`;
      values.push(filters.fromDate);
    }
    if (filters.toDate) {
      query += ` AND created_at <= $${paramCount++}`;
      values.push(filters.toDate);
    }

    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(filters.limit);
    }
    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async delete(id) {
    const query = 'DELETE FROM recordings WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      callId: row.call_id,
      filePath: row.file_path,
      fileName: row.file_name,
      fileSize: row.file_size,
      duration: row.duration,
      format: row.format,
      createdAt: row.created_at
    };
  }
}

module.exports = Recording;
