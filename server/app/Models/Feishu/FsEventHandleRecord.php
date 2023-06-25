<?php

namespace App\Models\Feishu;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 */
class FsEventHandleRecord extends Model
{
    use HasFactory;

    public function appendInfo($info)
    {
        $this->info .= $info;
        $this->save();
    }

    public function appendException($exception)
    {
        $this->exception .= $exception;
        $this->save();
    }

    public function getEvent()
    {
        return data_get(json_decode($this->post_data), 'event');
    }
}
