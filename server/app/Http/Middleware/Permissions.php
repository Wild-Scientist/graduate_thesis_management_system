<?php

namespace App\Http\Middleware;

use App\Models\Permission;
use Closure;
use Illuminate\Http\Request;

class Permissions
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param $permissions
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permissionCodes): mixed
    {
        $user = $request->user();
        if ($user->isSuper()) {
            return $next($request);
        } else {
            $permissionCodes = explode('|', $permissionCodes);
            $hasPermission = $user->hasPermissions($permissionCodes);
            return $hasPermission ? $next($request) : errorResponse('无权限');
        }
    }
}
