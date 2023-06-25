<?php

namespace App\Jobs\Feishu\Contact;

use App\Models\Feishu\FsDepartment;
use App\Models\Feishu\FsEventHandleRecord;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DepartmentUpdate implements ShouldQueue, ShouldBeUnique
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
     * @throws GuzzleException
     */
    public function handle()
    {
        try {
            $this->record->appendInfo("开始处理『部门变更』事件\n");
            $event = $this->record->getEvent();

            $department = $event->object;
            $d = (new FsDepartment())->where('open_department_id', $department->open_department_id)->first();
            if ($d) {
                $this->record->appendInfo("找到对应部门，更新飞书部门相关信息\n");
                $d->name = $department->name;
                $d->save();
                $d->syncParent();
                $this->record->appendInfo("更新完成\n");
            } else {
                $this->record->appendInfo("未找到对应部门，忽略\n");
            }

            // done
            $this->record->appendInfo("『部门变更』事件处理完成\n");
        } catch (Exception $e) {
            $this->record->appendException(exception2str($e));
        }
    }
}
