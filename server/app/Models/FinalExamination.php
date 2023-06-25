<?php

namespace App\Models;

use App\Models\Feishu\FsDepartment;
use App\Traits\ModelSerializeDate;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;

/**
 * @mixin Builder
 */
class FinalExamination extends Model
{
    use HasFactory, ModelSerializeDate, SoftDeletes;

    protected $hidden = [
        'file_key',
        'project_content'
    ];

    const STATUS_DRAFT = ['label' => '草稿', 'value' => 'draft'];
    const STATUS_SCHOOL_APPROVING = ['label' => '待学院批准', 'value' => 'school_approving'];
    const STATUS_GRADUATE_SCHOOL_APPROVING = ['label' => '待研究生学院审核', 'value' => 'graduate_school_approving'];

    const STATUS_DONE = ['label' => '待学院审核', 'value' => 'done'];

    const STATUS_FAIL=['label'=>'项目不通过','value'=>'failed'];

    const FLOW = [
        self::STATUS_DRAFT,
        self::STATUS_SCHOOL_APPROVING,
        self::STATUS_GRADUATE_SCHOOL_APPROVING,
        self::STATUS_DONE
    ];

    /**
     * 获取：发起人
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 获取：所属部门
     *
     * @return BelongsTo
     */
    public function fsDepartment(): BelongsTo
    {
        return $this->belongsTo(FsDepartment::class, 'fs_department_open_id', 'open_department_id');
    }

    /**
     * 获取：操作日志
     * @return HasMany
     */
    public function operationLogs(): HasMany
    {
        return $this->hasMany(OperationLog::class);

    }

    public function attachment(): hasOne
    {
        return $this->hasOne(File::class, 'key', 'file_key');
    }


    /**
     * 状态流程正向流转（提交 or 通过）
     *
     * @throws Exception
     */
    public function statusForward()
    {
        $currentStatusIndex = self::getStatusIndex($this->status);
        $nextStatusIndex = $currentStatusIndex + 1;
        if ($nextStatusIndex >= sizeof(self::FLOW)) {
            logger(sprintf(
                '（id:%s）正向流转（从:%s）失败，没有后续状态了',
                $this->id,
                $this->status,
            ));
            throw new Exception();
        }
        $nextStatusValue = self::FLOW[$nextStatusIndex]['value'];
        $this->status = $nextStatusValue;
        $this->save();
    }

    /**
     * 状态流程逆向流转（撤回 or 退回）
     * @throws Exception
     */
    public function statusBackward()
    {
        $currentStatusIndex = self::getStatusIndex($this->status);
        if ($currentStatusIndex === 0) {
            $this->deleted_at=time(); //如果在草稿阶段撤销就直接删除
        }
        else
            $this->status = self::FLOW[$currentStatusIndex - 1]['value'];
        $this->save();
    }

    /**
     * 保存操作日志
     *
     * @param $userId
     * @param $content
     */
    public function storeOperationLog($userId, $content)
    {
        $log = new OperationLog();
        $log->final_examination_id = $this->id;
        $log->user_id = $userId;
        $log->status = $this->status;
        $log->content = $content;
//        $log->type=OperationLog::TYPE_PROJECT_STARTUP['value'];
        $log->save();
    }

    /**
     * 获取状态在状态流中的序号（从 0 开始）
     *
     * @param $statusValue
     * @return int|null
     */
    public static function getStatusIndex($statusValue): ?int
    {
        for ($i = 0; $i < sizeof(self::FLOW); $i++) {
            if (self::FLOW[$i]['value'] === $statusValue) {
                return $i;
            }
        }
        return null;
    }

    /**
     * 根据 value 获取 status 实例
     */
    public static function getStatusObjectByValue($value)
    {
        return collect(self::FLOW)->where('value', $value)->first();
    }

    public static function checkWithdrawPermission(User $user, FinalExamination $project): bool
    {
        if($project->failed===true)return false;
        //为不同角色添加不同权限
        $student_permission = collect([FinalExamination::STATUS_DRAFT,
            FinalExamination::STATUS_SCHOOL_APPROVING])->pluck('value')->all();

        $school_permission = collect([FinalExamination::STATUS_GRADUATE_SCHOOL_APPROVING])->pluck('value')->all();

        $graduate_school_permission=collect([FinalExamination::STATUS_DONE])->pluck('value')->all();

        $permissions = $user->permissions()->pluck('code')->all();
        if (in_array(Permission::FLOW_FINAL_EXAMINATION_STUDENT['value'], $permissions)) {
            if (in_array($project->status, $student_permission)) {
                //只有本人才能撤销草稿
                if($project->status===FinalExamination::STATUS_DRAFT['value']){
                    if($project->user_id !== $user->id){
                        return false;
                    }
                }
                return true;
            }
        }
        if (in_array(Permission::FLOW_FINAL_EXAMINATION_SCHOOL['value'], $permissions)) {
            if (in_array($project->status, $school_permission)) {
                return true;
            }
        }
        if (in_array(Permission::FLOW_FINAL_EXAMINATION_GRADUATE_SCHOOL['value'], $permissions)) {
            if (in_array($project->status, $graduate_school_permission)) {
                return true;
            }
        }
        return false;
    }

    public static function checkPassPermission(User $user, FinalExamination $project): bool
    {
        if($project->failed===true)return false;
        //为不同角色添加不同权限
        $school_permission = collect([FinalExamination::STATUS_SCHOOL_APPROVING])->pluck('value')->all();

        $graduate_school_permission=collect([FinalExamination::STATUS_GRADUATE_SCHOOL_APPROVING])->pluck('value')->all();

        $permissions = $user->permissions()->pluck('code')->all();
        if (in_array(Permission::FLOW_FINAL_EXAMINATION_SCHOOL['value'], $permissions)) {
            if (in_array($project->status, $school_permission)) {
                return true;
            }
        }
        if (in_array(Permission::FLOW_FINAL_EXAMINATION_GRADUATE_SCHOOL['value'], $permissions)) {
            if (in_array($project->status, $graduate_school_permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查用户是否具有操作流程节点的权限
     */
    public static function checkStatusPermission(User $user, $statusValue): bool
    {
        if (is_array($statusValue)) {
            for ($i = 0; $i < sizeof($statusValue); $i++) {
                if (self::checkStatusPermission($user, $statusValue[$i])) {
                    return true;
                }
            }
            return false;
        } else {
            return $user->hasPermissions(['flow.' . $statusValue]);
        }
    }
}
