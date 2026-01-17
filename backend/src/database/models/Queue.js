const pool = require('../connection');

class Queue {
  static async create(data) {
    const {
      name,
      description,
      strategy = 'ringall',
      timeout = 30,
      maxWait = 300,
      retry = 5,
      wrapUpTime = 10,
      announcementFile,
      musicOnHold,
      enabled = true
    } = data;

    const query = `
      INSERT INTO queues (
        name, description, strategy, timeout, max_wait,
        retry, wrap_up_time, announcement_file, music_on_hold, enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      name,
      description,
      strategy,
      timeout,
      maxWait,
      retry,
      wrapUpTime,
      announcementFile,
      musicOnHold,
      enabled
    ];

    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM queues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM queues WHERE 1=1';
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

    const fields = {
      name: 'name',
      description: 'description',
      strategy: 'strategy',
      timeout: 'timeout',
      maxWait: 'max_wait',
      retry: 'retry',
      wrapUpTime: 'wrap_up_time',
      announcementFile: 'announcement_file',
      musicOnHold: 'music_on_hold',
      enabled: 'enabled'
    };

    for (const [key, dbField] of Object.entries(fields)) {
      if (data[key] !== undefined) {
        updates.push(`${dbField} = $${paramCount++}`);
        values.push(data[key]);
      }
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE queues
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM queues WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async addMember(queueId, extensionId, priority = 0) {
    const query = `
      INSERT INTO queue_members (queue_id, extension_id, priority)
      VALUES ($1, $2, $3)
      ON CONFLICT (queue_id, extension_id) 
      DO UPDATE SET priority = $3, enabled = TRUE
      RETURNING *
    `;
    const result = await pool.query(query, [queueId, extensionId, priority]);
    return result.rows[0];
  }

  static async removeMember(queueId, extensionId) {
    const query = 'DELETE FROM queue_members WHERE queue_id = $1 AND extension_id = $2 RETURNING *';
    const result = await pool.query(query, [queueId, extensionId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async getMembers(queueId) {
    const query = `
      SELECT qm.*, e.username, e.display_name
      FROM queue_members qm
      JOIN extensions e ON e.id = qm.extension_id
      WHERE qm.queue_id = $1
      ORDER BY qm.priority DESC, e.username ASC
    `;
    const result = await pool.query(query, [queueId]);
    return result.rows;
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      strategy: row.strategy,
      timeout: row.timeout,
      maxWait: row.max_wait,
      retry: row.retry,
      wrapUpTime: row.wrap_up_time,
      announcementFile: row.announcement_file,
      musicOnHold: row.music_on_hold,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Queue;
