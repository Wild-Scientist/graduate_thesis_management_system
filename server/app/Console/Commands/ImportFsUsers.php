<?php

namespace App\Console\Commands;

use App\Models\User;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Console\Command;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuContacts;

class ImportFsUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:fsUsers {openDepartmentId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Feishu Users';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 按部门批量导入飞书用户
     *
     * @throws GuzzleException
     */
    public function handle()
    {
        $openDepartmentId = $this->argument('openDepartmentId');
        $openDepartmentIds = [$openDepartmentId];
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(env('FS_APP_ID'), env('FS_APP_SECRET'))->tenant_access_token;
        $children = FeishuContacts::getChildDepartmentListAll($tenantAccessToken, $openDepartmentId, ['fetch_child' => true]);
        foreach ($children as $child) {
            array_push($openDepartmentIds, $child->open_department_id);
        }
        foreach ($openDepartmentIds as $i => $openDepartmentId) {
            $users = FeishuContacts::getUserListUnderDepartmentAll($tenantAccessToken, ['department_id' => $openDepartmentId]);
            foreach ($users as $j => $singleUser) {
                $user = User::findUserByFsInfo($singleUser);
                if ($user) {
                    $message = '已存在';
                } else {
                    User::createUserByFsInfo($singleUser);
                    $message = '注册成功';
                }
                dump(sprintf(
                    '[%d/%d][%d/%d]%s%s %s',
                    $i,
                    sizeof($openDepartmentIds),
                    $j,
                    sizeof($users),
                    $singleUser->name,
                    $singleUser->user_id,
                    $message,
                ));
            }
        }
    }
}
