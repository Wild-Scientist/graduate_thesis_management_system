<?php

namespace App\Jobs\Feishu\Contact;

use App\Models\Feishu\FsDepartment;
use App\Models\Feishu\FsEventHandleRecord;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DepartmentDelete implements ShouldQueue, ShouldBeUnique
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
            $this->record->appendInfo("开始处理『删除部门』事件\n");
            $event = $this->record->getEvent();

            $department = $event->object;
            $d = (new FsDepartment())->where('open_department_id', $department->open_department_id)->first();
            if ($d) {
                $this->record->appendInfo("找到对应部门，标记部门飞书删除状态\n");
                $d->fs_deleted = true;
                $d->save();
                $this->record->appendInfo("标记完成\n");
            } else {
                $this->record->appendInfo("未找到对应部门，忽略\n");
            }

            // done
            $this->record->appendInfo("『删除部门』事件处理完成\n");
        } catch (Exception $e) {
            $this->record->appendException(exception2str($e));
        }
    }
}
