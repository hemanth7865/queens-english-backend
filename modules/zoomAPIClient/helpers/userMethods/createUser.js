async function createUser(body = {}) {
  this.method = "createUser";
  console.log(body);
  return await this.handleAPI(
    async () => await this.axios.post(`/users`, body)
  );
}

module.exports = createUser;

/**
 *
 * @param body
 * @returns
 */

module.exports.createUserSample = {
  action: "create",
  user_info: {
    email: "jchill@example.com",
    type: 1,
    first_name: "Jill",
    last_name: "Chill",
    password: "if42!LfH@",
  },
};
