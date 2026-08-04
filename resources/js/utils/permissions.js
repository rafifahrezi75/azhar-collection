export const hasPermission = (permissions = [], permission) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissions.includes(permission);
};

export const hasAnyPermission = (permissions = [], permissionList = []) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissionList.some((permission) => permissions.includes(permission));
};
