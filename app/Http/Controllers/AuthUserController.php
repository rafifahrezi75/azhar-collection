<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;

class AuthUserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user()->load('roles');

        $permissions = $user->permissions();

        $menus = Menu::where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order');
            }])
            ->get()
            ->filter(function ($menu) use ($permissions) {
                return !$menu->permission_name || $permissions->contains($menu->permission_name);
            })
            ->map(function ($menu) use ($permissions) {
                $children = $menu->children
                    ->filter(function ($child) use ($permissions) {
                        return !$child->permission_name || $permissions->contains($child->permission_name);
                    })
                    ->values();

                return [
                    'id' => $menu->id,
                    'title' => $menu->title,
                    'path' => $menu->path,
                    'icon' => $menu->icon,
                    'permission_name' => $menu->permission_name,
                    'children' => $children->map(function ($child) {
                        return [
                            'id' => $child->id,
                            'title' => $child->title,
                            'path' => $child->path,
                            'icon' => $child->icon,
                            'permission_name' => $child->permission_name,
                        ];
                    }),
                ];
            })
            ->values();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->values(),
            ],
            'permissions' => $permissions,
            'menus' => $menus,
        ]);
    }
}
