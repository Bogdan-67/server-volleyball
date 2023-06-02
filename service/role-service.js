const db = require('../db');
const ApiError = require('../exceptions/api-error');

class RoleService {
  async getRoles(req, res) {
    const roles = await db.query(`SELECT role_name FROM roles`);
    const map = roles.rows.map((obj) => obj.role_name);
    return map;
  }

  async giveRole(role, users) {
    if (!role) {
      throw ApiError.BadRequest('Не введена роль!');
    }
    if (!Array.isArray(users)) {
      throw ApiError.BadRequest('users не является массивом!');
    }
    if (users.length === 0) {
      throw ApiError.BadRequest('Не введено ни одного игрока!');
    }
    const promises = users.map(async (user) => {
      const roleId = await db.query(`SELECT id_role FROM roles WHERE role_name=$1`, [role]);
      const updRole = await db.query(
        `UPDATE accounts SET role_id=$1 WHERE id_account=$2 RETURNING *`,
        [roleId.rows[0].id_role, user],
      );
      console.log(updRole.rows[0]);
    });

    await Promise.all(promises);

    return 0;
  }

  async removeRole(role, users) {
    if (!role) {
      throw ApiError.BadRequest('Не введена роль!');
    }
    if (!Array.isArray(users)) {
      throw ApiError.BadRequest('users не является массивом!');
    }
    if (users.length === 0) {
      throw ApiError.BadRequest('Не введено ни одного игрока!');
    }
  }
}

module.exports = new RoleService();
