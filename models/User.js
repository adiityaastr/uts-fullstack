const pool = require('../config/database');

const User = {
  async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findAll({ search, page = 1, limit = 10 }) {
    let sql = 'SELECT u.*, e.full_name AS employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id';
    let countSql = 'SELECT COUNT(*) AS total FROM users';
    const params = [];
    const conditions = [];

    if (search) {
      const s = `%${search}%`;
      conditions.push('(u.username LIKE ? OR u.email LIKE ? OR e.full_name LIKE ?)');
      params.push(s, s, s);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    const allParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];

    const [rows] = await pool.execute(sql, allParams);
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    return { rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  },

  async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const [result] = await pool.execute(
      `INSERT INTO users (${fields}) VALUES (${placeholders})`,
      Object.values(data)
    );
    return result.insertId;
  },

  async update(id, data) {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const [result] = await pool.execute(
      `UPDATE users SET ${sets} WHERE id = ?`,
      [...Object.values(data), id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async updateLastLogin(id) {
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  async findByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async findByRememberToken(token) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE remember_token = ?', [token]);
    return rows[0] || null;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    return rows[0].total;
  },

  async getEmployeesWithoutUser() {
    const [rows] = await pool.execute(
      `SELECT e.id, e.full_name, e.employee_code 
       FROM employees e 
       LEFT JOIN users u ON e.id = u.employee_id 
       WHERE u.id IS NULL`
    );
    return rows;
  },
};

module.exports = User;
