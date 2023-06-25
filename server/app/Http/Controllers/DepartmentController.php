<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    public function departments(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = validator($request->all(), [
            'department_id' => 'numeric|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $departments = (new \App\Models\Department)
            ->where('parent_id', $request->{'department_id'} ?? 0)
            ->get();
        return successResponse($departments);
    }

    public function updateDepartment(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = validator($request->all(), [
            'id' => 'numeric',
            'parent_id' => 'numeric|required|exists:departments,id',
            // 'code' => 'string|required',
            'name' => 'string|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        if ($request->has('id')) {
            // 编辑
            $d = (new Department)->find($request->{'id'});
            if ($request->{'parent_id'} !== $d->{'parent_id'}) {
                // 移动结点

            } else {
                // 未移动结点
                $d->{'name'} = $request->{'name'};
                $d->save();
            }
        } else {
            // 添加
            DB::transaction(function () use ($request) {
                $p = (new Department)->find($request->{'parent_id'});
                $p->{'is_leaf'} = false;
                $p->save();

                $d = new Department();
                $d->{'parent_id'} = $p->{'id'};
                $d->{'name'} = $request->{'name'};
                $d->save();
                $d->{'id_link'} = sprintf('%s%s/', $p->{'id_link'}, $d->{'id'});
                $d->save();
            });
        }
        return successResponse();
    }

    public function deleteDepartment(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $request->merge(['id' => $id]);
        $validator = validator($request->all(), [
            'id' => 'numeric|required|exists:departments,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $d = (new \App\Models\Department)->find($id);
        if ($d->hasChildren()) {
            return errorResponse('该部门下包含子部门，无法删除');
        }
        if ($d->{'parent_id'} === 0) {
            return errorResponse('根部门无法删除');
        }

        DB::transaction(function () use ($id) {
            $target = (new \App\Models\Department)->find($id);
            $parentId = $target->{'parent_id'};
            $target->delete();
            (new \App\Models\Department)->find($parentId)->freshIsLeaf();
        });
        return successResponse();
    }
}
