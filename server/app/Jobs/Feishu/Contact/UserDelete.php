<?php

namespace App\Jobs\Feishu\Contact;

use App\Models\Feishu\FsEventHandleRecord;
use App\Models\User;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UserDelete implements ShouldQueue, ShouldBeUnique
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
            $this->record->appendInfo("开始处理『员工离职』事件\n");
            $event = $this->record->getEvent();

            $fsUser = $event->object;
            $this->record->appendInfo(sprintf("user_id: %s\n", $fsUser->user_id));
            $user = User::findUserByFsInfo($fsUser);
            if ($user) {
                $this->record->appendInfo("找到对应用户，标记用户飞书离职状态\n");
                $user->fs_deleted = true;
                $user->save();
                $this->record->appendInfo("标记完成\n");
            } else {
                $this->record->appendInfo("未找到对应用户，忽略\n");
            }

            // done
            $this->record->appendInfo("『员工离职』事件处理完成\n");
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
