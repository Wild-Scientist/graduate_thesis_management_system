<?php

namespace App\Jobs\Feishu;

use App\Models\Feishu\FsEventHandleRecord;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FsEventHandler implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private array $postData;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($postData)
    {
        $this->postData = $postData;
    }

    public function uniqueId()
    {
        // 如果过来的事件里无法获取到唯一 id，取当前毫秒级时间戳作为 id
        return $this->getEventId() ?: microtime();
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // 保存事件
        $record = new FsEventHandleRecord();
        $record->post_data = json_encode($this->postData);
        $record->event_id = $this->getEventId();
        $record->event_type = $this->getEventType();
        $record->send_time = $this->getSendTime();
        $record->save();

        try {
            // Token 检查
            if (env('FS_EVENT_VER_TOKEN')) {
                $pass = data_get($this->postData, 'header.token') === env('FS_EVENT_VER_TOKEN') ||
                    data_get($this->postData, 'token') === env('FS_EVENT_VER_TOKEN');
                if (!$pass) {
                    $record->appendInfo("Token 检查未通过\n");
                    return;
                }
            } else {
                $record->appendInfo("ENV:FS_EVENT_VER_TOKEN 缺失，跳过 Token 检查，请尽快处理\n");
            }

            // 重复性检查：根据飞书文档，检查 7.5 小时内的重复事件，如有重复，仅记录不处理。
            $checkBoundary = now()->subMinutes(450);
            $hasRepeat = !!(new FsEventHandleRecord)->where('created_at', '>=', $checkBoundary)
                ->where('id', '!=', $record->id)
                ->whereNotNull('event_id')
                ->where('event_id', $record->event_id)
                ->first();
            if ($hasRepeat) {
                $record->appendInfo("存在 7.5 小时内的重复事件，该事件将被忽略\n");
            } else {
                // 处理事件
                switch ($record->event_type) {
                    // 审批实例状态变更
                    case 'approval_instance':
                        Approval\InstanceChange::dispatch($record)->onQueue('vip');
                        break;
                    // 员工离职
                    case 'contact.user.deleted_v3':
                        Contact\UserDelete::dispatch($record)->onQueue('vip');
                        break;
                    // 员工变更
                    case 'contact.user.updated_v3':
                        Contact\UserUpdate::dispatch($record)->onQueue('vip');
                        break;
                    // 删除部门
                    case 'contact.department.deleted_v3':
                        Contact\DepartmentDelete::dispatch($record)->onQueue('vip');
                        break;
                    // 修改部门
                    case 'contact.department.updated_v3':
                        Contact\DepartmentUpdate::dispatch($record)->onQueue('vip');
                        break;
                    default:
                        break;
                }
            }

            // done
            $record->appendInfo("事件处理完成\n");
            return;
        } catch (Exception $e) {
            $record->appendException(sprintf(
                "飞书事件处理失败：\n%s\n",
                exception2str($e)
            ));
        }
    }

    private function getEventId()
    {
        return data_get($this->postData, 'header.event_id') ?: data_get($this->postData, 'uuid');
    }

    private function getEventType()
    {
        return data_get($this->postData, 'header.event_type') ?: data_get($this->postData, 'type');
    }

    private function getSendTime(): ?Carbon
    {
        $t1 = data_get($this->postData, 'header.create_time');
        $t2 = data_get($this->postData, 'ts');
        if ($t1) {
            return Carbon::createFromTimestampMs($t1);
        } elseif ($t2) {
            return Carbon::createFromTimestamp($t2);
        } else {
            return null;
        }
    }
}
