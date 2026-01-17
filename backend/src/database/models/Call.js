const pool = require('../connection');

class Call {
  static async create(data) {
    const {
      callId,
      fromNumber,
      toNumber,
      fromExtensionId,
      toExtensionId,
      didNumberId,
      direction,
      status = 'ringing'
    } = data;

    const query = `
      INSERT INTO calls (
        call_id, from_number, to_number, from_extension_id,
        to_extension_id, did_number_id, direction, status, started_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const values = [
      callId,
      fromNumber,
      toNumber,
      fromExtensionId,
      toExtensionId,
      didNumberId,
      direction,
      status
    ];

    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findByCallId(callId) {
    const query = 'SELECT * FROM calls WHERE call_id = $1';
    const result = await pool.query(query, [callId]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM calls WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findActive() {
    const query = `
      SELECT * FROM calls
      WHERE status IN ('ringing', 'answered')
      ORDER BY started_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM calls WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.fromNumber) {
      query += ` AND from_number = $${paramCount++}`;
      values.push(filters.fromNumber);
    }
    if (filters.toNumber) {
      query += ` AND to_number = $${paramCount++}`;
      values.push(filters.toNumber);
    }
    if (filters.direction) {
      query += ` AND direction = $${paramCount++}`;
      values.push(filters.direction);
    }
    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }
    if (filters.fromDate) {
      query += ` AND started_at >= $${paramCount++}`;
      values.push(filters.fromDate);
    }
    if (filters.toDate) {
      query += ` AND started_at <= $${paramCount++}`;
      values.push(filters.toDate);
    }

    query += ' ORDER BY started_at DESC';
    
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

  static async update(callId, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.answeredAt !== undefined) {
      updates.push(`answered_at = $${paramCount++}`);
      values.push(data.answeredAt);
    }
    if (data.endedAt !== undefined) {
      updates.push(`ended_at = $${paramCount++}`);
      values.push(data.endedAt);
    }
    if (data.duration !== undefined) {
      updates.push(`duration = $${paramCount++}`);
      values.push(data.duration);
    }
    if (data.hangupCause !== undefined) {
      updates.push(`hangup_cause = $${paramCount++}`);
      values.push(data.hangupCause);
    }
    if (data.recordingPath !== undefined) {
      updates.push(`recording_path = $${paramCount++}`);
      values.push(data.recordingPath);
    }
    if (data.recordingEnabled !== undefined) {
      updates.push(`recording_enabled = $${paramCount++}`);
      values.push(data.recordingEnabled);
    }

    if (updates.length === 0) {
      return await this.findByCallId(callId);
    }

    values.push(callId);

    const query = `
      UPDATE calls
      SET ${updates.join(', ')}
      WHERE call_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      callId: row.call_id,
      fromNumber: row.from_number,
      toNumber: row.to_number,
      fromExtensionId: row.from_extension_id,
      toExtensionId: row.to_extension_id,
      didNumberId: row.did_number_id,
      direction: row.direction,
      status: row.status,
      duration: row.duration,
      recordingPath: row.recording_path,
      recordingEnabled: row.recording_enabled,
      startedAt: row.started_at,
      answeredAt: row.answered_at,
      endedAt: row.ended_at,
      hangupCause: row.hangup_cause,
      createdAt: row.created_at
    };
  }
}

module.exports = Call;
