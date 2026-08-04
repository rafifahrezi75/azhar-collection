import React from 'react';
import { hasPermission } from "@/utils/permissions";

export default function PermissionButton({
    permissions = [],
    permission,
    children,
    ...props
}) {
    if (!hasPermission(permissions, permission)) {
        return null;
    }

    return (
        <button {...props}>
            {children}
        </button>
    );
}
