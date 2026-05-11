const pool = require('../config/database');

const Employee = {
  async findAll({ search, page = 1, limit = 10 }) {
    let sql = 'SELECT * FROM employees';
    let countSql = 'SELECT COUNT(*) AS total FROM employees';
    const params = [];
    const conditions = [];

    if (search) {
      const s = `%${search}%`;
      conditions.push('(full_name LIKE ? OR email LIKE ? OR division LIKE ? OR employment_status LIKE ?)');
      params.push(s, s, s, s);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const allParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];

    const [rows] = await pool.execute(sql, allParams);
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    return { rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(
      `INSERT INTO employees (${fields}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  },

  async update(id, data) {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await pool.execute(
      `UPDATE employees SET ${sets} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async bulkCreate(rows) {
    const fields = Object.keys(rows[0]).join(', ');
    const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
    const sql = `INSERT INTO employees (${fields}) VALUES (${placeholders})`;
    let inserted = 0;
    for (const row of rows) {
      try {
        await pool.execute(sql, Object.values(row));
        inserted++;
      } catch {}
    }
    return inserted;
  },

  async countByStatus(status) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM employees WHERE employment_status = ?', [status]
    );
    return rows[0].total;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM employees');
    return rows[0].total;
  },

  async countDivisions() {
    const [rows] = await pool.execute('SELECT COUNT(DISTINCT division) AS total FROM employees');
    return rows[0].total;
  },

  async getByDivision() {
    const [rows] = await pool.execute(
      'SELECT division, COUNT(*) AS total FROM employees GROUP BY division'
    );
    return rows;
  },

  async getByStatus() {
    const [rows] = await pool.execute(
      'SELECT employment_status AS status, COUNT(*) AS total FROM employees GROUP BY employment_status'
    );
    return rows;
  },

  async getAllForExport() {
    const [rows] = await pool.execute('SELECT * FROM employees ORDER BY created_at DESC');
    return rows;
  },
};

module.exports = Employee;
