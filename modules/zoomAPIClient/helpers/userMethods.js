/**
 *
 * @param {
 *  status: string,
 *  page_size: number,
 *  role_id: number,
 *  page_number: number,
 *  include_fields: string,
 *  next_page_token: string,
 * } params
 * @returns
 */
async function listUsers(params = {}) {
  return await this.handleAPI(
    async () => await this.axios.get(`/users`, { params })
  );
}

module.exports = {
  listUsers,
};
