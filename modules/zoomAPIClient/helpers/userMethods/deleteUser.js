async function deleteUser() {
  this.method = "deleteUser";
  return await this.handleAPI(
    async () =>
      await this.axios.delete(`/users/${this.user.id}`, { action: "delete" })
  );
}

module.exports = deleteUser;
