/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: {
  currentUser?: API.CurrentUser | undefined;
}) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser?.role == "admin",
    canSuperAdmin: currentUser?.role == "superadmin",
    canManage:
      currentUser?.role == "admin" || currentUser?.role == "superadmin" || currentUser?.role == "programmanager",
    canTeacher: currentUser?.role == "teacher",
    canZoomManage: currentUser?.role == "zoom",
    canProgramManager: currentUser?.role == "programmanager",
  };
}
