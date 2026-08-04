<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HakAksesController extends Controller
{
    public function page()
    {
        return Inertia::render('HakAkses/Index');
    }

    public function index()
    {
        return response()->json([
            'roles' => Role::with('permissions')->orderBy('label')->get(),
            'users' => User::with(['roles.permissions', 'directPermissions'])->orderBy('name')->get(),
            'permissions' => Permission::orderBy('group_name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $requestedIds = $validated['permission_ids'] ?? [];

        // Security rule: 'hak_akses' permissions cannot be modified via matrix.
        // Role Admin ALWAYS retains 'hak_akses' permissions.
        // Non-admin roles can NEVER be granted 'hak_akses' permissions.
        $protectedPermissionIds = Permission::whereIn('name', ['hak_akses.view', 'hak_akses.update'])
            ->pluck('id')
            ->toArray();

        if ($role->name === 'admin') {
            $safePermissionIds = array_unique(array_merge($requestedIds, $protectedPermissionIds));
        } else {
            $safePermissionIds = array_diff($requestedIds, $protectedPermissionIds);
        }

        $role->permissions()->sync($safePermissionIds);

        return response()->json([
            'message' => "Hak akses role {$role->label} berhasil diperbarui.",
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        if ($request->boolean('reset')) {
            $user->directPermissions()->detach();
            return response()->json([
                'message' => "Hak akses khusus pengguna {$user->name} dihapus. Pengguna kembali mengikuti aturan Role bawaan.",
            ]);
        }

        $validated = $request->validate([
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $requestedIds = $validated['permission_ids'] ?? [];

        // Security rule: 'hak_akses' permissions cannot be stripped from Admin users
        $protectedPermissionIds = Permission::whereIn('name', ['hak_akses.view', 'hak_akses.update'])
            ->pluck('id')
            ->toArray();

        if ($user->hasRole('admin')) {
            $safePermissionIds = array_unique(array_merge($requestedIds, $protectedPermissionIds));
        } else {
            $safePermissionIds = array_diff($requestedIds, $protectedPermissionIds);
        }

        $user->directPermissions()->sync($safePermissionIds);

        return response()->json([
            'message' => "Hak akses khusus pengguna {$user->name} berhasil diperbarui.",
        ]);
    }
}
