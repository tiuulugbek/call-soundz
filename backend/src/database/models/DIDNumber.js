const pool = require('../connection');

class DIDNumber {
    static async create(data) {
    const {
      number,
      provider = 'bell.uz',
      trunkUsername,
      trunkPassword,
      routeType,
      routeTargetId,
      enabled = true
    } = data;

    const query = `
      INSERT INTO did_numbers (
        number, provider, trunk_username, trunk_password, route_type, route_target_id, enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [number, provider, trunkUsername, trunkPassword || null, routeType, routeTargetId, enabled];
    const result = await pool.query(query, values);
    return this.mapRowToObject(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM did_numbers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findByNumber(number) {
    const query = 'SELECT * FROM did_numbers WHERE number = $1';
    const result = await pool.query(query, [number]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM did_numbers WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.enabled !== undefined) {
      query += ` AND enabled = $${paramCount++}`;
      values.push(filters.enabled);
    }
    if (filters.provider) {
      query += ` AND provider = $${paramCount++}`;
      values.push(filters.provider);
    }

    query += ' ORDER BY number ASC';
    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToObject(row));
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.routeType !== undefined) {
      updates.push(`route_type = $${paramCount++}`);
      values.push(data.routeType);
    }
    if (data.routeTargetId !== undefined) {
      updates.push(`route_target_id = $${paramCount++}`);
      values.push(data.routeTargetId);
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
      UPDATE did_numbers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM did_numbers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToObject(result.rows[0]) : null;
  }

  static mapRowToObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      number: row.number,
      provider: row.provider,
      trunkUsername: row.trunk_username,
      trunkPassword: row.trunk_password,
      routeType: row.route_type,
      routeTargetId: row.route_target_id,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = DIDNumber;
