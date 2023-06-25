<?php

namespace App\Http\Controllers;

use App\Constants;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * 获取角色列表
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'page' => Constants::VALIDATOR_PAGE,
            'page_size' => Constants::VALIDATOR_PAGE_SIZE,
            'created_at' => Constants::VALIDATOR_ORDER,
            'updated_at' => Constants::VALIDATOR_ORDER,
            'keyword' => 'string|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $roles = Role::query();
        if ($request->has('keyword')) {
            $keyword = $request->{'keyword'};
            $roles = $roles->where(function ($query) use ($keyword) {
                return $query->where('id', 'like', "%$keyword%")
                    ->orWhere('name', 'like', "%$keyword%");
            });
        }
        if ($request->has('created_at')) {
            $roles = $roles->orderBy('created_at', $request->created_at);
        }
        if ($request->has('updated_at')) {
            $roles = $roles->orderBy('updated_at', $request->updated_at);
        }
        $roles = $roles->paginate($request->page_size ?? Constants::DEFAULT_PAGE_SIZE);
        foreach ($roles as $role) {
            $role->permissions = $role->permissions()->get();
            $role->permission_ids = collect($role->permissions)->pluck('id')->all();
        }
        return successResponse($roles);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'id' => 'numeric|exists:roles,id',
            'name' => 'string',
            'permission_ids' => 'array',
            'permission_ids.*' => 'numeric|exists:permissions,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        if ($request->has('id')) {
            // 编辑
            if ($request->id === Role::ROLE_ID_SUPER) {
                return errorResponse('不能编辑超管');
            }
            DB::transaction(function () use ($request) {
                $r = (new Role)->find($request->id);
                $r->name = $request->name;
                $r->save();
                $r->permissions()->sync($request->permission_ids);
            });

            return successResponse();
        } else {
            // 新增
            DB::transaction(function () use ($request) {
                $r = new Role();
                $r->name = $request->name;
                $r->save();
                $r->permissions()->sync($request->permission_ids);
            });
            return successResponse();
        }
    }

    public function options(): JsonResponse
    {
        $options = [];
        $valueEnum = [];
        foreach ((new Role)->cursor() as $role) {
            array_push($options, ['label' => $role->name, 'value' => $role->id]);
            $valueEnum[$role->id] = ['text' => $role->name];
        }
        return successResponse([
            'options' => $options,
            'valueEnum' => $valueEnum,
        ]);
    }

    public function delete(Request $request): JsonResponse
    {
        // 1. 检查请求是否正确
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        if ($request->id === Role::ROLE_ID_SUPER || $request->id === Role::ROLE_ID_USER) {
            return errorResponse('不能删除基本角色');
        }

        // 2. 删除角色
        DB::beginTransaction();
        $r = (new Role)->find($request->id);
        if ($r === null) {
            DB::rollBack();
            return errorResponse("不存在该角色");
        }

        // 2.1 查询拥有该角色的用户列表
        $users = User::query();
        $users->whereHas('roles', function ($query) use ($request) {
            $query->where('roles.id', $request->id);
        });
        $users = $users->get();
        foreach ($users as $user) {
            $roles = $user->roles()->pluck('roles.id')->toArray();
            $roles = array_diff($roles, [$request->id]);
            if (count($roles) === 0) {
                $roles[] = Role::ROLE_ID_USER;
            }
            $user->roles()->sync($roles);
        }
        $r->delete();
        DB::commit();
        return successResponse();
    }
}
