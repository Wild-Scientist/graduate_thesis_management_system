<?php

namespace App\Models\Feishu;

use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuContacts;

/**
 * @mixin Builder
 */
class FsDepartment extends Model
{
    use HasFactory;

    protected $visible = [
        'name',
        'open_department_id',
        'name_path',
    ];

    /**
     * 同步父部门信息
     *
     * @throws GuzzleException
     */
    public function syncParent($accessToken = null)
    {
        $_accessToken = $accessToken ?: FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'),
            env('FS_APP_SECRET'),
        )->tenant_access_token;
        $parentArr = FeishuContacts::getParentDepartmentsDataAll($_accessToken, [
            'department_id' => $this->open_department_id,
        ]);
        $parentCollect = collect($parentArr)->reverse();
        // 查询用
        $this->open_department_id_link = sprintf(
            sizeof($parentCollect) ? '/%s/%s/' : '%s/%s/',
            implode('/', $parentCollect->pluck('open_department_id')->all()),
            $this->open_department_id,
        );
        // 查询用
        $this->name_link = sprintf(
            sizeof($parentCollect) ? '/%s/%s/' : '%s/%s/',
            implode('/', $parentCollect->pluck('name')->all()),
            $this->name,
        );
        // 显示用
        $this->name_path = sprintf(
            sizeof($parentArr) ? '%s/%s' : '%s%s',
            implode('/', $parentCollect->pluck('name')->all()),
            $this->name,
        );
        $this->save();
    }

    /**
     * 获取系统中存储的飞书部门实例，如不存在先从飞书获取并存储
     * @param $openDepartmentId
     * @return object|null
     * @throws GuzzleException
     */
    public static function autoGet($openDepartmentId): object|null
    {
        $d = (new FsDepartment())->where('open_department_id', $openDepartmentId)->first();
        if (!$d) {
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'),
                env('FS_APP_SECRET')
            )->tenant_access_token;
            $fsDepartmentRes = FeishuContacts::getSingleDepartmentData(
                $tenantAccessToken,
                $openDepartmentId,
            );
            $fsDepartment = data_get($fsDepartmentRes, 'data.department');
            $d = new FsDepartment();
            $d->open_department_id = $fsDepartment->open_department_id;
            $d->name = $fsDepartment->name;
            $d->save();
            $d->syncParent();
        }
        return $d;
    }
}
