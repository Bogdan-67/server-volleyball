module.exports = class UserDTO {
  id_account;
  login;
  role_id;

  constructor(model) {
    this.id_account = model.id_account;
    this.login = model.login;
    this.role_id = model.role_id;
  }
};
