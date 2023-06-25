<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param Request $request
     * @return string|null
     */
    protected function redirectTo($request): ?string
    {
        if (!$request->expectsJson()) {
            return route('login');
        }
    }

    /**
     * 接口未认证处理逻辑
     * @param Request $request
     * @param array $guards
     */
    protected function unauthenticated($request, array $guards)
    {
        abort(response()->json([
            'errorMessage' => '未登录',
            'showType' => env('FS_PRO') ? 0 : 2 // 纯飞书项目不弹通知
        ], 401));
    }
}
