/**
 *
 * @param body
 * @returns
 */

const sampleBody = {
  action: "create",
  user_info: {
    email: "jchill@example.com",
    type: 1,
    first_name: "Jill",
    last_name: "Chill",
    password: "if42!LfH@",
    feature: {
      zoom_phone: true,
    },
  },
};

async function createUser(body = {}) {
  return await this.handleAPI(
    async () => await this.axios.post(`/users`, body)
  );
}

module.exports = createUser;
