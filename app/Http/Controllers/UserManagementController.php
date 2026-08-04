<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function page()
    {
        return Inertia::render('Users/Index');
    }

    public function index()
    {
        return response()->json([
            'users' => User::with('roles')->latest()->get(),
            'roles' => Role::where('is_active', true)->orderBy('label')->get(),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_ids' => ['array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync($validated['role_ids'] ?? []);

        return response()->json([
            'message' => 'Role user berhasil diperbarui.',
        ]);
    }
}
