<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * 获取权限列表
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return successResponse(
            Permission::query()
                ->orderBy('order')
                ->get()
        );
    }
}
