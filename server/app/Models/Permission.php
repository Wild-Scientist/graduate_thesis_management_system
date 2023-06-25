<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Mockery\Matcher\Any;
use ReflectionClass;

/**
 * @mixin Builder
 */
class Permission extends Model
{
    use HasFactory;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    const MENUS_USERS = ['label' => '【菜单】用户管理', 'value' => 'menus.users'];
    const MENUS_USERS_LIST = ['label' => '【菜单】用户管理-用户列表', 'value' => 'menus.users-list'];
    const MENUS_USERS_PERMISSION = ['label' => '【菜单】用户管理-角色权限', 'value' => 'menus.users-permission'];
    const MENUS_PROJECT_START_UP =
        ['label' => '【菜单】立项', 'value' => 'menus.project_start_up'];
    const MENUS_PROJECT_START_UP_MY_PROJECTS =
        ['label' => '【菜单】立项-我的项目', 'value' => 'menus.project_start_up-my_projects'];
    const MENUS_PROJECT_START_UP_PROJECT_EXAMINATION =
        ['label' => '【菜单】立项-项目审批', 'value' => 'menus.project_start_up-project_examination'];

    const MENUS_MIDDLE_EXAMINATION =
        ['label' => '【菜单】中期检查', 'value' => 'menus.middle_examination'];
    const MENUS_MIDDLE_EXAMINATION_MY_PROJECTS =
        ['label' => '【菜单】中期检查-我的项目', 'value' => 'menus.middle_examination-my_projects'];
    const MENUS_MIDDLE_EXAMINATION_PROJECT_EXAMINATION =
        ['label' => '【菜单】中期检查-项目审批', 'value' => 'menus.middle_examination-project_examination'];

    const MENUS_FINAL_EXAMINATION =
        ['label' => '【菜单】结项', 'value' => 'menus.final_examination'];
    const MENUS_FINAL_EXAMINATION_MY_PROJECTS =
        ['label' => '【菜单】结项-我的项目', 'value' => 'menus.final_examination-my_projects'];
    const MENUS_FINAL_EXAMINATION_PROJECT_EXAMINATION =
        ['label' => '【菜单】结项-项目审批', 'value' => 'menus.final_examination-project_examination'];

    const FLOW_PROJECT_START_UP_STUDENT = ['label' => '【流程】操作权限-立项-学生', 'value' => 'flow.project_start_up.student'];
    const FLOW_PROJECT_START_UP_SCHOOL = ['label' => '【流程】操作权限-立项-学院', 'value' => 'flow.project_start_up.school'];
    const FLOW_PROJECT_START_UP_GRADUATE_SCHOOL = ['label' => '【流程】操作权限-立项-研究生学院', 'value' => 'flow.project_start_up.graduate_school'];

    const FLOW_MIDDLE_EXAMINATION_STUDENT = ['label' => '【流程】操作权限-中期检查-学生', 'value' => 'flow.middle_examination.student'];
    const FLOW_MIDDLE_EXAMINATION_SCHOOL = ['label' => '【流程】操作权限-中期检查-学院', 'value' => 'flow.middle_examination.school'];
    const FLOW_MIDDLE_EXAMINATION_GRADUATE_SCHOOL = ['label' => '【流程】操作权限-中期检查-研究生学院', 'value' => 'flow.middle_examination.graduate_school'];

    const FLOW_FINAL_EXAMINATION_STUDENT = ['label' => '【流程】操作权限-结项-学生', 'value' => 'flow.final_examination.student'];
    const FLOW_FINAL_EXAMINATION_SCHOOL = ['label' => '【流程】操作权限-结项-学院', 'value' => 'flow.final_examination.school'];
    const FLOW_FINAL_EXAMINATION_GRADUATE_SCHOOL = ['label' => '【流程】操作权限-结项-研究生学院', 'value' => 'flow.final_examination.graduate_school'];

    //返回所有权限
    public function getAllPermissions(): array
    {
        $reflectionClass = new ReflectionClass($this);
        return $reflectionClass->getConstants();
    }

    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

}
