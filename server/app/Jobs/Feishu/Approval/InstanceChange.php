<?php

namespace App\Jobs\Feishu\Approval;

use App\Http\Controllers\Feishu\FeishuApprovalController;
use App\Models\Feishu\FsEventHandleRecord;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spacecat\Feishu\FeishuApproval;
use Spacecat\Feishu\FeishuAuth;

class InstanceChange implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private FsEventHandleRecord $record;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($record)
    {
        $this->record = $record;
    }

    public function uniqueId()
    {
        return $this->record->id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            $this->record->appendInfo("开始处理『审批实例状态变更』事件\n");
            $event = $this->record->getEvent();

            $approvalCode = $event->approval_code;
            $instanceCode = $event->instance_code;
            $status = $event->{'status'};

            // validate
            if ($status !== 'APPROVED') {
                $this->record->appendInfo("审批未通过，忽略\n");
                return;
            }

            // do something
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'), env('FS_APP_SECRET')
            )->{'tenant_access_token'};
            $instanceRes = FeishuApproval::getSingleApprovalInstanceDetail($tenantAccessToken, [
                'instance_code' => $instanceCode
            ]);
            $instanceForm = json_decode(data_get($instanceRes, 'data.form'));
            $fieldValue = FeishuApprovalController::getValueFromInstanceForm($instanceForm, '学号');
            $fieldValue2 = FeishuApprovalController::getValueFromInstanceForm($instanceForm, '开始时间', 'value.start');
            $this->record->appendInfo(sprintf("学号为：%s\n", $fieldValue));
            $this->record->appendInfo(sprintf("开始时间为：%s\n", $fieldValue2));

            // done
            $this->record->appendInfo("『审批实例状态变更』事件处理完成\n");
        } catch (GuzzleException $e) {
            $this->record->appendException(sprintf(
                "调飞书接口失败：\n%s",
                exception2str($e)
            ));
        } catch (Exception $e) {
            $this->record->appendException(exception2str($e));
        }
    }
}
