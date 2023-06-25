<?php

namespace App\Models;

use App\Traits\ModelSerializeDate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationLog extends Model
{
    use HasFactory, ModelSerializeDate;
    const TYPE_PROJECT_STARTUP=['label'=>'立项','value'=>'project_start_up'];
    const TYPE_MIDDLE_EXAMINATION=['label'=>'中期检查','value'=>'middle_examination'];
    const TYPE_FINAL_EXAMINATION=['label'=>'结题检查','value'=>'final_examination'];

    /**
     * 获取：操作人
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
