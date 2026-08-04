<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $roles = [];
        $permissions = collect([]);
        $menus = collect([]);

        if ($user) {
            $user->load('roles');
            $roles = $user->roles->pluck('name')->values()->toArray();
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
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roles,
                ] : null,
                'permissions' => $permissions->toArray(),
                'menus' => $menus->toArray(),
            ],
        ];
    }
}
