class AccountController {
  async createAccount(req, res) {
    const { login, password } = req.body;
    console.log(login, password);
    res.json('account ok');
  }
  async getOneAccount(req, res) {}
}

module.exports = new AccountController();
