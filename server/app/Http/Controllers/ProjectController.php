<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Feishu\FeishuCloudDocumentController;
use App\Models\Contract;
use App\Models\FinalExamination;
use App\Models\MiddleExamination;
use App\Models\ProjectStartUp;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /*
     * 通过project_type获取model
     */
    private static function get_model($project_type)
    {
        switch ($project_type) {
            case 'project_start_up':
                return ProjectStartUp::class;
            case 'middle_examination':
                return MiddleExamination::class;
            case 'final_examination':
                return FinalExamination::class;
        }
    }

    public function index(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'page_type' => 'string|required|in:my_projects,project_examination',
            'page' => 'numeric|nullable',
            'page_size' => 'numeric|nullable',
            'keyword' => 'string|nullable',
            'created_at' => 'string|nullable|in:asc,desc',
            'updated_at' => 'string|nullable|in:asc,desc',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $e = $p::query()->whereNull('deleted_at');
        $permissions = $request->user()->permissions()->pluck('code')->all();
        if ($request->page_type === 'my_projects') {
            if (!$request->user()->isSuper()) {
                // 可查看自己发起的
                $e = $e->where('user_id', $request->user()->id);
            }
        } else if ($request->page_type === 'project_examination') {
            $e = $e->whereNotIn('status', [$p::STATUS_DRAFT['value']]);
        } else if ($request->page_type === 'done') {

        } else {
            throw new Exception('page_type error.');
        }

        // 再处理搜索、筛选、排序
        if ($request->has('keyword')) {
            $keyword = $request->{'keyword'};
            $e = $e->where(function ($query) use ($keyword) {
                return $query->where('id', 'like', "%$keyword%")
                    ->orWhere('title', 'like', "%$keyword%")
                    ->orWhereHas('user', function ($query) use ($keyword) {
                        return $query->where('name', 'like', "%$keyword%");
                    });
            });
        }
        if ($request->has('created_at')) {
            $e = $e->orderBy('created_at', $request->created_at);
        }
        if ($request->has('updated_at')) {
            $e = $e->orderBy('updated_at', $request->updated_at);
        }
        $e = $e->with('user');
        // 分页
        $e = $e->paginate($request->page_size ?? config('constants.default_page_size'));
        return successResponse($e);
    }

    public function getContract(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $contract = (new Contract())->where( 'project_start_up_id',$request->id)->first();
        $document_id = null;
        if ($contract === null) {
            #没有合同，需要新建合同
            $document_id = FeishuCloudDocumentController
                ::createContract($project_type, $request->id, $request->user()->id);
        } else {
            #合同存在直接查找合同
            $document_id = Contract::getDocument($project_type, $request->id);
        }
        return successResponse($document_id);
    }

    public function details(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        $validator = validator($request->all(), [
            'id' => 'numeric'
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $id = $request->id;
        $e = $p::query()->where('id', $id)->whereNull('deleted_at');
        $e = $e
            ->with('user')
            ->with('fsDepartment')
            ->with('operationLogs.user')->with('attachment');
        $e = $e->first()->makeVisible(['file_key', 'project_content']);
        $e['contract_token']=self::getContract($request,$project_type);

        return successResponse($e);
    }

    /**
     * 发起 or 更新申请
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function update(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        $currentStatusValue = $p::STATUS_DRAFT['value'];
        $project = $request->has('id') ? (new $p)->find($request->id) : (new $p);

        if ($request->has('id')) {
            // 编辑
            if ($project->user_id !== $request->user()->id) {
                return errorResponse('非法访问');
            }
            DB::transaction(function () use ($project, $currentStatusValue, $request) {
                $project->title = $request->title;
                $project->type = 'my_project';
                $project->project_content = $request->project_content;
                $project->file_key = $request->attachment['key'];
                $project->save();
                $project->storeOperationLog($request->user()->id, '编辑草稿');
                if ($request->boolean('submit')) {
                    $project->storeOperationLog($request->user()->id, '提交');
                    $project->statusForward();
                }
            });
        } else {
            // 新增
            DB::transaction(function () use ($project, $currentStatusValue, $request) {
                $project->user_id = $request->user()->id;
                $project->fs_department_open_id = $request->user()->fs_department_open_id;
                $project->title = $request->title;
                $project->type = 'my_project';
                $project->file_key = $request->attachment['key'];
                $project->project_content = $request->project_content;
                $project->status = $currentStatusValue;
                $project->save();
                $project->storeOperationLog($request->user()->id, '创建草稿');
                if ($request->boolean('submit')) {
                    $project->storeOperationLog($request->user()->id, '提交');
                    $project->statusForward();
                }
            });
        }
        return successResponse();
    }

    /**
     * 撤回申请
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function withdraw(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $e = (new $p)->find($request->id);
        // 权限验证
        if (!$request->user()->isSuper()) {
            $noPermission = !$p::checkWithdrawPermission($request->user(), $e);
            if ($noPermission) {
                return errorResponse('无权限');
            }
        }
        $e->storeOperationLog($request->user()->id, '撤回');
        $e->statusBackward();
        $e->save();
        return successResponse();
    }

    public function pass(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $e = (new $p)->find($request->id);
        // 权限验证
        if (!$request->user()->isSuper()) {
            $noPermission = !$p::checkPassPermission($request->user(), $e);
            if ($noPermission) {
                return errorResponse('无权限');
            }
        }
        $e->storeOperationLog($request->user()->id, '通过');
        $e->statusForward();
        $e->save();
        return successResponse();
    }

    public function reject(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $e = (new $p)->find($request->id);
        // 权限验证
        if (!$request->user()->isSuper()) {
            $noPermission = !$p::checkPassPermission($request->user(), $e);
            if ($noPermission) {
                return errorResponse('无权限');
            }
        }
        $e->storeOperationLog($request->user()->id, '退回');
        $e->statusBackward();
        $e->save();
        return successResponse();
    }

    public function fail(Request $request, $project_type): JsonResponse
    {
        $p = $this::get_model($project_type);
        // 表单验证
        $validator = validator($request->all(), [
            'id' => 'numeric|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $e = (new $p)->find($request->id);
        // 权限验证
        if (!$request->user()->isSuper()) {
            $noPermission = !$p::checkPassPermission($request->user(), $e);
            if ($noPermission) {
                return errorResponse('无权限');
            }
        }
        $e->storeOperationLog($request->user()->id, '项目不通过');
        $e->failed = true;
        $e->save();
        return successResponse();
    }


}
