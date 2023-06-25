<?php

namespace App\Models;

use App\Models\Feishu\FsDepartment;
use App\Traits\ModelSerializeDate;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuContacts;
use Spacecat\Feishu\FeishuMiddle;
use Spacecat\Feishu\FeishuUtils;

/**
 * @mixin Builder
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, ModelSerializeDate, SoftDeletes;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'fs_union_id',
        'fs_access_token',
        'fs_access_token_expire_at',
        'fs_refresh_token',
        'fs_refresh_token_expire_at',
    ];

    /**
     * 默认加载的关联
     *
     * @var array
     */
    protected $with = ['fsDepartments'];

    public function departments(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Department::class)->withTimestamps();
    }

    public function fsDepartments(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            FsDepartment::class,
            'fs_department_user',
        )->withTimestamps();
    }

    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function permissions(): Builder
    {
        $roleIds = $this->roles()->pluck('roles.id')->toArray();
        return Permission::query()
            ->whereHas('roles', function ($query) use ($roleIds) {
                return $query->whereIn('roles.id', $roleIds);
            });

    }

    /**
     * 判断当前用户是否是超管（角色列表中含超管）
     * @return bool
     */
    public function isSuper(): bool
    {
        return in_array(Role::ROLE_ID_SUPER, $this->roles()->pluck('roles.id')->toArray());
    }

    /**
     * 判断当前用户是否拥有权限，传入多个有任意一个就可以
     *
     * @param $permissionCodes
     * @return bool
     */
    public function hasPermissions($permissionCodes): bool
    {
        return !!$this->permissions()->whereIn('code', $permissionCodes)->first();
    }

    /**
     * 使用飞书查到的用户信息更新系统用户对应的飞书信息
     * @param $fsUser
     * @throws GuzzleException
     */
    public function syncFsUserData($fsUser)
    {
        $this->fs_open_id = $fsUser->open_id;
        $this->fs_union_id = $fsUser->union_id;
        $this->fs_user_id = $fsUser->user_id;
        $this->name = $fsUser->name;
        $this->phone = self::handleFsUserMobile(data_get($fsUser, 'mobile'));
        $this->student_number = FeishuUtils::getCustomAttrValueFromSingleUser($fsUser, FeishuMiddle::CUSTOM_ATTRS_STUDENT_NUMBER_ID);
        $this->payroll_number = FeishuUtils::getCustomAttrValueFromSingleUser($fsUser, FeishuMiddle::CUSTOM_ATTRS_PAYROLL_NUMBER_ID);
        $this->fs_avatar_72 = $fsUser->avatar->avatar_72;
        $this->fs_avatar_240 = $fsUser->avatar->avatar_240;
        $this->fs_avatar_640 = $fsUser->avatar->avatar_640;
        $this->fs_avatar_origin = $fsUser->avatar->avatar_origin;
        $this->save();
        $this->syncFsUserDepartmentToUser($fsUser);
    }

    /**
     * 使用飞书查到的部门信息更新系统用户对应的飞书部门信息
     * @param $fsUser
     * @throws GuzzleException
     */
    public function syncFsUserDepartmentToUser($fsUser)
    {
        $fsDepartmentIds = [];
        foreach ($fsUser->department_ids as $departmentId) {
            $d = FsDepartment::autoGet($departmentId);
            array_push($fsDepartmentIds, $d->id);
        }
        $this->fsDepartments()->sync($fsDepartmentIds);
    }

    /**
     * 给当前用户增加角色、权限信息
     */
    public function addRolePermissions()
    {
        $this->roles = $this->roles()->get();
        $this->role_ids = collect($this->roles)->pluck('id')->all();
        $this->permissions = $this->permissions()->get();
        $this->permission_codes = collect($this->permissions)->pluck('code')->all();
    }

    /**
     * 按 “fs_open_id/fs_union_id/fs_user_id/手机号/工资号/学号” 的顺序在系统查找满足条件的第一个用户
     * @param $singleUser
     * @return mixed
     */
    public static function findUserByFsInfo($singleUser): mixed
    {
        $phoneNumber = self::handleFsUserMobile(data_get($singleUser, 'mobile'));
        $studentNumber = FeishuUtils::getCustomAttrValueFromSingleUser($singleUser, FeishuMiddle::CUSTOM_ATTRS_STUDENT_NUMBER_ID);
        $payrollNumber = FeishuUtils::getCustomAttrValueFromSingleUser($singleUser, FeishuMiddle::CUSTOM_ATTRS_PAYROLL_NUMBER_ID);
        if (!$singleUser->user_id && !$phoneNumber && !$payrollNumber && !$studentNumber) {
            return null;
        }
        $user = User::query();
        // if ($singleUser->open_id) {
        //     $user = $user->orWhere('fs_open_id', $singleUser->open_id);
        // }
        // if ($singleUser->union_id) {
        //     $user = $user->orWhere('fs_union_id', $singleUser->union_id);
        // }
        if ($singleUser->user_id) {
            $user = $user->orWhere('fs_user_id', $singleUser->user_id);
        }
        if ($phoneNumber) {
            $user = $user->orWhere('phone', $phoneNumber);
        }
        if ($payrollNumber) {
            $user = $user->orWhere('payroll_number', $payrollNumber);
        }
        if ($studentNumber) {
            $user = $user->orWhere('student_number', $studentNumber);
        }
        return $user->first();
    }

    /**
     * @throws GuzzleException
     */
    public static function createUserByFsInfo($singleUser, $roleIds = null): User
    {
        $user = new User();
        $user->syncFsUserData($singleUser);
        if (!sizeof($user->roles)) {
            $user->roles()->sync($roleIds ?: [Role::ROLE_ID_USER]);
        }
        return $user;
    }

    /**
     * 处理飞书用户信息里的手机号，如果是 +86 大陆手机号，去掉 +86
     * @param $phoneNumber
     * @return mixed
     */
    public static function handleFsUserMobile($phoneNumber): mixed
    {
        if ($phoneNumber && strlen($phoneNumber) === 14 && str_starts_with($phoneNumber, '+86')) {
            $phoneNumber = substr($phoneNumber, 3, 11);
        }
        return $phoneNumber;
    }


}
