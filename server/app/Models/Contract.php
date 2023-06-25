<?php

namespace App\Models;

use App\Traits\ModelSerializeDate;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin Builder
 */
class Contract extends Model
{
    use HasFactory, ModelSerializeDate, SoftDeletes;

    public static function saveDocument($document_token, $project_type, $project_id, $user_id)
    {
        $p = new Contract();
        switch ($project_type) {
            case 'project_start_up':
                $p->project_start_up_id = $project_id;
                break;
            case 'middle_examination':
                $p->middle_examination = $project_id;
                break;
            case 'final_examination':
                $p->final_examination = $project_id;
                break;
        }
        $p->document_id = $document_token;
        $p->user_id = $user_id;
        $p->save();
    }

    public static function getDocument($project_type, $project_id)
    {
        $p = (new Contract())->where("${project_type}_id", $project_id)->first();
        return $p->document_id;
    }
}
